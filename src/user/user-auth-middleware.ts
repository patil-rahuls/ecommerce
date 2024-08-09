import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { LOGGER } from '../common/logger.js';
import { BaseError } from '../middlewares/error-middleware.js';
import { CookieHelper } from '../common/cookie-helper.js';
import { InputValidator } from '../common/input-validator.js';
import { SMSAuth } from '../common/sms-auth.js';
import { REDIS_INSTANCE } from '../common/redis.js';
import { User } from '../common/interfaces/user.js';

class AuthMiddleware {
  public async loginForm(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.session?.user?.isAuthenticated) {
        throw new BaseError('ERR_USR_ALREADY_LOGGED_IN');
      }
      res.json({
        status: res.statusCode,
        userMessage: `Use your mobile number to login!`
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        // next(error); // tested
        next(new BaseError(`ERR_LOGINFORM`, error.message));
      }
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.session.destroy(error => {
        if (error) {
          next(new BaseError(`ERR_LOGOUT`));
        }
      });
      // an attempt to delete the session and other cookies from client's browser by expiring them.
      const cookiesArr = ['satr_id', 'ct', 'at', 'rt'];
      cookiesArr.forEach(c => CookieHelper.deleteCookies(res, c));
      res.redirect('/');
    } catch (error) {
      next(new BaseError(`ERR_LOGOUT`, error.message));
    }
  }

  public static isRequestAuthorized(req: Request, ct) {
    const ctCookie = CookieHelper.getCookie(req, 'ct');
    return [ct, ctCookie, req.header('X-XSRF-TOKEN')].every(token => token === req.session.ct);
  }

  public async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId = '', ct = '' } = req.body;
      if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
        throw new BaseError('ERR_UNAUTHORIZED_LOGIN_ATTEMPT');
      }
      if (!InputValidator.validateMobileNumber(userId)) {
        throw new BaseError(`INVALID_MOBILE`);
      }

      const otp = await SMSAuth.generateSendOTP(userId, req.session.lastOtpAt);
      if (!otp || isNaN(otp)) {
        throw new BaseError(`ERR_COULDNT_SEND_OTP`);
      }
      req.session.lastOtpAt = Date.now();
      res.json({
        status: 200,
        userMessage: `We've just sent an OTP to your mobile number. Please enter it!`
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_COULDNT_SEND_OTP`, error.message));
      }
    }
  }

  public async verify(req: Request, res: Response, next: NextFunction) {
    // handle authentication
    try {
      if (req.session?.user?.isAuthenticated) {
        throw new BaseError('ERR_USR_ALREADY_LOGGED_IN');
      }
      const { userId = '', passkey = '', ct = '' } = req.body;
      if (!AuthMiddleware.isRequestAuthorized(req, ct)) {
        throw new BaseError('ERR_UNAUTHORIZED_LOGIN_ATTEMPT');
      }
      if (!InputValidator.validateMobileNumber(userId)) {
        throw new BaseError(`INVALID_MOBILE`);
      }

      let otpCorrect = false;
      switch (true) {
        // OTP - 4 digits.
        case passkey?.length === 4 && !isNaN(passkey):
          const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
          await redisRead.connect();
          if (`${passkey}` === (await redisRead.get(`${userId}`))) {
            // If user provided OTP matches with that in redis
            otpCorrect = true;
            await redisRead.del(`${userId}`);
          } else {
            await redisRead.quit();
            throw new BaseError('INCORRECT_OTP');
          }
          await redisRead.quit();
          break;
        // Password - at least 6 digits.
        case passkey?.length > 5 && /^[A-Za-z0-9_!@#$^./&+-]*$/.test(passkey):
          break;
        default:
          throw new BaseError('INCORRECT_PASSWORD');
      }

      // Ready to login/set-session
      const dbInstance = Object.keys(res.locals.DB)?.find(k => res.locals.DB[k] !== null);
      // ^ 'WRITE' or 'READ' or other DB Instance identifier.
      if (!dbInstance) {
        throw new BaseError('DB_INSTANCE_NOT_FOUND');
      }
      res.locals.DB_CONN[dbInstance] = await res.locals.DB[dbInstance].getConnection();
      const dbConn = res.locals.DB_CONN[dbInstance];
      let user = await this.getUser(userId, dbConn);
      switch (true) {
        case user?.[0]?.user_group_id === 6:
          throw new BaseError(`BLACKLISTED_USER`);
        case otpCorrect && this.isNewUser(user):
          // New user authenticated using OTP
          const [result] = await dbConn.execute('INSERT INTO `user` SET `mobile` = ? ', [userId]);
          // result = {... , "insertId": n, ...};
          if (!result?.insertId) {
            throw new BaseError(`ERR_COULDNT_SAVE_USER`);
          }
          [user] = await dbConn.execute(
            'SELECT id, mobile, password, email, name, gender, default_billing_addr AS defaultBillingAddress, default_shipping_addr AS defaultShippingAddress, user_group_id AS userGroup, created_at AS createdAt FROM `user` WHERE `id` = ? ;',
            [result?.insertId]
          );
        case otpCorrect && !this.isNewUser(user):
        // Existing user authenticated using OTP

        /*case (await bcrypt.compare(passkey, user?.[0]?.password)):*/
        case passkey === user?.[0]?.password:
          // Existing user authenticated using password
          await dbConn.release(); // res.locals.DB_CONN[dbInstance].release();
          LOGGER.info(`DB connection ${dbInstance} Released!`);
          await this.setUsrSession(user[0], req, res);
          res.json({
            status: 200,
            userMessage: `Logged in! Welcome!!`
          });
          break;
        case passkey !== user?.[0]?.password:
        /*case (!await bcrypt.compare(passkey, user?.[0]?.password)):*/
        default:
          throw new BaseError('INCORRECT_PASSWORD');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_LOGIN`, error.message));
      }
    }
  }

  private async getUser(mobile, dbConn) {
    try {
      const [rows] = await dbConn.execute(
        'SELECT id, mobile, password, email, name, gender, default_billing_addr AS defaultBillingAddress, default_shipping_addr AS defaultShippingAddress, user_group_id AS userGroup, created_at AS createdAt FROM `user` WHERE `mobile` = ?;',
        [mobile]
      );
      // rows -> [{...}] OR []
      return rows;
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private isNewUser(user: any) {
    return !Boolean(user.length);
  }

  private getToken(payload, options: { expiresIn: string } = { expiresIn: '5m' }) {
    return jwt.sign({ payload }, process.env.JWT_SECRET, options);
  }

  private async setUsrSession(usrDataForSession, req: Request, res: Response) {
    // const salt = await bcrypt.genSaltSync(10);
    // usrDataForSession.id = await bcrypt.hash(usrDataForSession.id, salt);
    // Login and set user session.
    req.session.user = <User>usrDataForSession;
    req.session.user.isAuthenticated = true;
    // Generate access_token and send response.
    const at = await this.getToken(`accessId-${req.session.user.mobile}`); // parameter can be any object that we can verify later.
    const rt = await this.getToken(`userId-${req.session.user.mobile}`); // parameter can be any object that we can verify later.
    req.session.at = at;
    req.session.rt = rt;
    // Set access_token in a response cookie
    res.cookie('at', req.session.at, { sameSite: 'strict', maxAge: 5 * 60 * 1000 });
    res.cookie('rt', req.session.rt, { sameSite: 'strict' });
    // TODO: Implement rotating refresh token.
  }

  // Use the following middleware on each request by using it as app.use(...);
  public static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req?.session?.user?.isAuthenticated) {
      // User is authenticated
      next();
    } else {
      throw new BaseError('ERR_NOT_AUTHENTICATED');
    }
  }

  // WIP
  // public async getUsrByToken(token) {
  //   try {
  //     const decodedId = jwt.verify(token, process.env.JWT_SECRET);
  //     // return await this.findOne({ _id: decoded._id });
  //   } catch (err) {
  //     // throw new Error(`Error verifying token: ${err.message}`);
  //   }
  // };
}

export { AuthMiddleware };
