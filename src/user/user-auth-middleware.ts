import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { BaseError } from '../middlewares/error-middleware.js';
import { UserMiddleware } from './user-middleware.js';
import { DB } from '../middlewares/db.js';
import { CookieHelper } from '../common/cookie-helper.js';
import { InputValidator } from '../common/input-validator.js';
import { SMSAuth } from '../common/sms-auth.js';
import { User } from '../common/interfaces/user.js';

const userObj = new UserMiddleware();
class AuthMiddleware {
  static readonly ACCESS_TOKEN_EXPIRY = 1 * 60 * 1000;
  static readonly REFRESH_TOKEN_EXPIRY = 10 * 24 * 60 * 60 * 1000;

  // Access Login Form
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
        next(new BaseError(`ERR_USER_LOGINFORM`, error.message));
      }
    }
  }

  // Validate and verify Mobile-Number & send OTP
  public async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId = '' } = req.body;
      if (!InputValidator.validateMobileNumber(userId)) {
        throw new BaseError(`ERR_INVALID_MOBILE`);
      }

      const otp = await SMSAuth.generateSendOTP(userId, req.session.lastOtpAt);
      if (!otp || isNaN(otp)) {
        throw new BaseError(`ERR_USER_OTP_COULDNT_SEND`);
      }
      req.session.lastOtpAt = Date.now();
      res.json({
        status: 200,
        userMessage: `OTP Sent !`
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_OTP_COULDNT_SEND`, error.message));
      }
    }
  }

  // Validate and verify Password / OTP
  public async verify(req: Request, res: Response, next: NextFunction) {
    // handle authentication
    try {
      if (req.session?.user?.isAuthenticated) {
        throw new BaseError('ERR_USR_ALREADY_LOGGED_IN');
      }
      const { userId = '', passkey = '' } = req.body;
      if (!InputValidator.validateMobileNumber(userId)) {
        throw new BaseError(`ERR_INVALID_MOBILE`);
      }

      let otpCorrect = false;
      switch (true) {
        // OTP - 4 digits.
        case passkey?.length === 4 && !isNaN(passkey):
          if (await SMSAuth.verifyOTP(userId, passkey)) {
            // If user provided OTP matches with that in redis
            otpCorrect = true;
          } else {
            throw new BaseError('ERR_USER_INCORRECT_OTP');
          }
          break;
        // Password - at least 6 digits.
        case passkey?.length > 5 && /^[A-Za-z0-9_!@#$^./&+-]*$/.test(passkey):
          break;
        default:
          throw new BaseError('ERR_USER_INCORRECT_PASSWORD');
      }

      // Ready to login/set-session
      const dbConn = await DB.createConnection(res);
      let user = await this.getUser(userId, dbConn);
      switch (true) {
        case user?.[0]?.user_group_id === 6:
          throw new BaseError(`ERR_USER_BLACKLISTED`);
        case otpCorrect && this.isNewUser(user):
          // New user authenticated using OTP
          const [result] = await dbConn.execute('INSERT INTO `user` SET `mobile` = ? ', [userId]);
          // result = {... , "insertId": n, ...};
          if (!result?.insertId) {
            throw new BaseError(`ERR_USER_COULDNT_SAVE`);
          }
          [user] = await dbConn.execute('SELECT id, mobile, password, email, name, gender, default_billing_addr AS defaultBillingAddress, default_shipping_addr AS defaultShippingAddress, user_group_id AS userGroup, created_at AS createdAt FROM `user` WHERE `id` = ? ;', [result?.insertId]);
        case otpCorrect && !this.isNewUser(user):
        // Existing user authenticated using OTP

        /*case (await bcrypt.compare(passkey, user?.[0]?.password)):*/
        case passkey === user?.[0]?.password:
          // Existing user authenticated using password
          DB.releaseConnection(res);
          await this.setUsrSession(user[0], req, res);
          let redirectUrl;
          if (req.session.redirectUrl) {
            redirectUrl = req.session.redirectUrl;
            req.session.redirectUrl = null;
          }
          res.json({
            status: 200,
            userMessage: `Logged in !!`,
            ...(redirectUrl && { redirectUrl })
          });
          break;
        case passkey !== user?.[0]?.password:
        /*case (!await bcrypt.compare(passkey, user?.[0]?.password)):*/
        default:
          throw new BaseError('ERR_USER_INCORRECT_PASSWORD');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_USER_LOGIN`, error.message));
      }
    }
  }

  private async getUser(mobile, dbConn) {
    try {
      const [rows] = await dbConn.execute('SELECT id, mobile, password, email, name, gender, default_billing_addr AS defaultBillingAddress, default_shipping_addr AS defaultShippingAddress, user_group_id AS userGroup, created_at AS createdAt FROM `user` WHERE `mobile` = ?;', [mobile]);
      return rows;
    } catch (err) {
      throw new BaseError(`ERR_DB_STMT`, err.message);
    }
  }

  private isNewUser(user: any) {
    return !Boolean(user.length);
  }

  // Set User Session
  private async setUsrSession(usrDataForSession, req: Request, res: Response) {
    // const salt = await bcrypt.genSaltSync(10);
    // usrDataForSession.id = await bcrypt.hash(usrDataForSession.id, salt);
    // Login and set user session.
    req.session.user = <User>usrDataForSession;
    req.session.user.isAuthenticated = true;
    // Add cart data to session.
    req.session.user.cart = await userObj.getUserCart(req.session.user.id);
    // Generate JWTs
    // Access Token
    const at = await AuthMiddleware.getToken(`ACCESS_ID-${req.session.user.mobile}`);
    // Refresh Token
    const rt = await AuthMiddleware.getToken(`REFRESH_ACCESS_ID-${req.session.user.mobile}`, { expiresIn: AuthMiddleware.REFRESH_TOKEN_EXPIRY });
    // and set respective cookies.
    res.cookie('at', at, { sameSite: 'strict', maxAge: AuthMiddleware.ACCESS_TOKEN_EXPIRY });
    res.cookie('rt', rt, { sameSite: 'strict', maxAge: AuthMiddleware.REFRESH_TOKEN_EXPIRY });
    // TODO: Implement rotating Refresh Token.
    // TODO: DFP & 'Remember Me'
  }

  // Set JWT
  static getToken(payload, options: { expiresIn: number } = { expiresIn: AuthMiddleware.ACCESS_TOKEN_EXPIRY }) {
    return jwt.sign({ payload }, process.env.JWT_SECRET, options);
  }

  // Decode JWT
  static decodeToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
    }
    return decoded?.payload;
  }

  // Use the following middleware on each request by using it as app.use(...);
  // I have used both JWT as well as Session.
  // Server Side Session cookie and the JWT 'rt' (Refresh Token) both have expiry of 10d.
  // JWT 'at' (Access Token) has expiry of 1h.
  static async isAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
      let at, rt;
      if (['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].some(method => method === req.method)) {
        at = req.header('Authorization');
        rt = req.header('X-AUTH-TOKEN');
      } else {
        at = CookieHelper.getCookie(req, 'at');
        rt = CookieHelper.getCookie(req, 'rt');
        if (!rt) {
          throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
        }
      }
      if (!AuthMiddleware.isValidJwtToken(rt)) {
        throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
      }
      if (!req?.session?.user?.isAuthenticated) {
        throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
      }
      if (!AuthMiddleware.isValidJwtToken(at)) {
        // Renew Access Token
        // First Verify the Refresh Token
        if (AuthMiddleware.decodeToken(rt) === `REFRESH_ACCESS_ID-${req.session.user.mobile}`) {
          at = await AuthMiddleware.getToken(`ACCESS_ID-${req.session.user.mobile}`);
          res.cookie('at', at, { sameSite: 'strict', maxAge: AuthMiddleware.ACCESS_TOKEN_EXPIRY });
        } else {
          // Refresh Token is invalid.
          throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
        }
      }
      // At this point - 'at', 'rt', and the session-data, all are present.
      if (AuthMiddleware.decodeToken(at) === `ACCESS_ID-${req.session.user.mobile}` && AuthMiddleware.decodeToken(rt) === `REFRESH_ACCESS_ID-${req.session.user.mobile}`) {
        // User authenticated
        next();
      } else {
        // Tokens are invalid.
        throw new BaseError('ERR_USER_NOT_AUTHENTICATED');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        // Logout completely
        AuthMiddleware.logout(req, res, next);
      } else {
        next(new BaseError(`ERR_USER_NOT_AUTHENTICATED`, error.message));
      }
    }
  }

  private static isValidJwtToken(token) {
    if (!token || token === 'undefined' || typeof token !== 'string') {
      return false;
    }
    const header = token?.split('.')?.[0];
    if (JSON.parse(atob(header))?.typ?.toLowerCase() === 'jwt') {
      return true;
    }
    return false;
  }

  // Logout
  static logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.session?.destroy(error => {
        if (error) {
          next(new BaseError(`ERR_USER_LOGOUT`));
        }
      });
      // an attempt to delete the session and other cookies from client's browser by expiring them.
      const cookiesArr = ['satr_id', 'ct', 'at', 'rt'];
      cookiesArr.forEach(c => CookieHelper.deleteCookies(res, c));
      if (!req.originalUrl?.includes('logout')) {
        // Logic to redirect to home page and ask user to login.
        res.redirect(`/?login=true&redirectTo=${req.originalUrl}`);
      } else {
        res.redirect(`/`);
      }
    } catch (error) {
      next(new BaseError(`ERR_USER_LOGOUT`, error.message));
    }
  }
}

export { AuthMiddleware };
