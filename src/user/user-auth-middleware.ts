import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../common/interfaces/user.js';
import { LOGGER } from '../common/logger.js';
import { BaseError } from '../middlewares/error-middleware.js';

class AuthMiddleware {
  public async loginForm(req: Request, res: Response, next: NextFunction) {
    try {
      // If session exists, redirect.
      if (req.session?.user?.mobile) {
        res.redirect('/');
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
      res.cookie('satr_id', null, {
        expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
        httpOnly: true
      });
      res.cookie('ct', null, {
        expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
        httpOnly: false
      });
      res.cookie('at', null, {
        expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
        httpOnly: false
      });
      res.json({
        status: 200,
        userMessage: `Logged out. See you soon!`
      });
    } catch (error) {
      next(new BaseError(`ERR_LOGOUT`, error.message));
    }
  }

  public async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId = '', ct = '' } = req.body;
      const ctCookie = req
        .header('Cookie')
        ?.split('; ')
        ?.filter(c => /ct=/.test(c))?.[0]
        ?.split('=')?.[1];
      if ([ct, ctCookie, req.header('X-XSRF-TOKEN')].every(token => token === req.session.ct)) {
        // Validate userId
        if (!new RegExp(/^[6-9]\d{9}$/).test(userId)) {
          // The regex above is for Indian mobile numbers.
          throw new BaseError(`INVALID_MOBILE`);
        }

        // Generate & Send OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        // TODO: here, add the logic to send OTP SMS to `userId` through AWS SQS.
        // if(req.session.user) {
        // req for re-send otp.
        // TODO: check if 3 minutes have passed and then only send another OTP.
        // use-> req.session.otpTimestamp
        // }
        LOGGER.info(`OTP ${otp} sent to user - ${userId}`);
        const usr: User = { id: 0, mobile: userId, password: `${otp}` }; // id: 0 for unauthenticated user.
        // id: Will be set with actual value, when the user logs in successfully.
        req.session.user = usr;
        // req.session.otpTimestamp = Date.now();
        res.json({
          status: 200,
          userMessage: `We've just sent an OTP to your mobile number. Please use it to log in!`
        });
      } else {
        throw new BaseError('ERR_UNAUTHORIZED_LOGIN_ATTEMPT');
      }
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
      const { userId = '', passkey = '', ct = '' } = req.body;
      const ctCookie = req
        .header('Cookie')
        ?.split('; ')
        ?.filter(c => /ct=/.test(c))?.[0]
        ?.split('=')?.[1];
      if ([ct, ctCookie, req.header('X-XSRF-TOKEN')].every(token => token === req.session.ct)) {
        // Validate userId
        if (!new RegExp(/^[6-9]\d{9}$/).test(userId)) {
          // The regex above is for Indian mobile numbers.
          throw new BaseError(`INVALID_MOBILE`);
        }
        let ok;
        // Validate if passkeys === otp
        if (passkey?.length === 4) {
          if (`${passkey}` === req.session.user.password) {
            ok = true;
          } else {
            throw new BaseError('INCORRECT_OTP');
          }
        } // Validate/check if passkeys is a password i.e. contains the set of characters
        else if (passkey?.length > 5 && /^[A-Za-z0-9_!@#$^./&+-]*$/.test(passkey)) {
          ok = true;
        } else {
          throw new BaseError('INCORRECT_PASSWORD');
        }
        if (ok) {
          const dbConn = await res.locals.DB_INSTANCE_WRITE.getConnection();
          const user = await this.getUser(userId, dbConn);
          if (this.isNewUser(user)) {
            const [result] = await dbConn.execute('INSERT INTO `user` SET `mobile` = ? ', [userId]);
            if (result?.insertId) {
              // User registered successfully.
              const usrDataForSession = await this.getUser(userId, dbConn);
              await this.setUsrSession(usrDataForSession, req, res);
              res.json({
                status: 200,
                userMessage: `Logged in!`
              });
            } else {
              throw new BaseError(`ERR_COULDNT_SAVE_USER`);
            }
          } else if (user?.user_group_id === 5) {
            throw new BaseError(`BLACKLISTED_USER`);
          } else if (await bcrypt.compare(passkey, user.password)) {
            // Existing user
            await this.setUsrSession(user, req, res);
            res.json({
              status: 200,
              userMessage: `Logged in!`
            });
          } else {
            throw new BaseError('INCORRECT_PASSWORD');
          }
        }
      } else {
        throw new BaseError('ERR_UNAUTHORIZED_LOGIN_ATTEMPT');
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
      const [rows] = await dbConn.execute('SELECT * FROM `user` WHERE `mobile` = ?;', [mobile]);
      return rows.length ? rows : false;
    } catch (err) {
      throw new BaseError(`DB_QUERY_ERR`, err.message);
    }
  }

  private isNewUser(user: any) {
    return typeof user === 'boolean' && !user;
  }

  private getToken(payload, options: { expiresIn: string } = { expiresIn: '5m' }) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  private async setUsrSession(usrDataForSession, req: Request, res: Response) {
    const salt = await bcrypt.genSaltSync(10);
    usrDataForSession.id = await bcrypt.hash(usrDataForSession.id, salt);
    // Login and set user session.
    req.session.user = usrDataForSession;
    // Now logged in. Generate access_token and send response.
    const at = await this.getToken(req.session.user.mobile);
    req.session.at = at;
    // Set access_token in a response cookie
    res.cookie('at', req.session.at, { sameSite: 'strict', maxAge: 5 * 60 * 1000 });
    // TODO: we need to implement rotating refresh token.
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
