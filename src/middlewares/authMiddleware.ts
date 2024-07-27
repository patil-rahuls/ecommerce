import { NextFunction, Request, Response } from 'express';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { User } from '../common/interfaces/user.js';
import { LOGGER } from './logger.js';
import { BaseError } from './errorHandler.js';

class AuthMiddleware {
  private user: User;

  public async loginForm(req: Request, res: Response, next: NextFunction) {
    try {
      res.cookie('ct', req.session.ct);
      LOGGER.info(JSON.stringify(req.session));
      LOGGER.info(req.session.id);
      res.json({
        status: res.statusCode,
        auth_token: 'auth_token',
        userMessage: `We've just sent an OTP to your mobile number. Please use it to log in!`
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      }
      // next(error); // tested
      next(new BaseError(`ERR_LOGINFORM`));
    }
  }

  // Method to handle both registration and login
  // I have simplified login and signup by combining them.
  // In the 1st request, we will only recieve `mobile` in the req.body
  // After validation and check, in the 2nd req we will recieve both `mobile` AND either of `otp` OR `password`.
  /*public async authenticate(req: Request, res: Response, next: NextFunction) {
    // Instead of try-catch, 'express-async-handler' could also be used. Does the same job.
    try {
      const { userId, ...passwords } = req.body;
      // userId = mobile number of user.
      // passwords - { otp, password }

      // Server side input validation
      if (!new RegExp(/^[6-9]\d{9}$/).test(userId)) {
        // The regex above is for Indian mobile numbers.
        throw new BaseError(`INVALID_MOBILE`);
      }
      // `mobile` is in correct format. Check if user already exists.
      const dbConn = await res.locals.DB_INSTANCE_WRITE.getConnection();
      const user = await this.getUser(userId, dbConn);
      // Now there are 2 options: Already registered & New user
      if (typeof user === 'boolean' && !user) {
        res.json({
          userId: userId
          // token: generateToken(foundUser?._id)
        });
        await this.signup(userId, dbConn);
      } else if (typeof user === 'object' && user.length) {
        // Option 2. Already registered user.
        // If the user is blacklisted, return error
        if (user[0].user_group_id === 5) {
          throw new BaseError(`BLACKLISTED_USER`);
        }
        // Ask user for password/otp.
        // await this.login(dbConn);
      }
      await dbConn.release();

      // Option 1. New user
      if (!Object.keys(passwords).length) {
        // const dbInstance = res.locals.DB_INSTANCE_WRITE;
        // res.locals.DB_CONN_WRITE = await dbInstance.getConnection();
        // const dbConn = res.locals.DB_CONN_WRITE;

        if (await this.userExists(mobile, dbConn)) {
          await this.sendOtp(mobile, res);
          const auth_token = this.getToken(mobile);
          res.json({
            status: res.statusCode,
            auth_token,
            userMessage: `We've just sent an OTP to your mobile number. Please use it to log in!`
          });
        }
      }

      // Option 2. Already registered user
      // At this point, both `mobile` and `...passwords` values are truthy
      // From UI, we may either get a password OR OTP in the req.body.
      // like this -> { mobile: XXXXXXXXXX, password: 'iLoveDeepika', otp: null } OR { mobile: XXXXXXXXXX, password: null, otp: XXXX }

      // LOGGER.info(JSON.stringify(fields));
      // LOGGER.info(JSON.stringify(rows));

      // if (rows.length) {
      //   // user exists, he may login using password OR otp.

      // } else {
      //   // New user. Send OTP to authenticate.
      //   await AuthMiddleware.sendOtp(mobile, res);
      //   // show
      // }
      // throw new BaseError(`ERR_AUTHENTICATION`);
      // get user info into a session.
      // LOGGER.info(`Authenticated !`);
      // res.send(`Authenticated !`);
    } catch (error) {
      next(error);
    }
  }

  private async sendOtp(mobile, res) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    LOGGER.info(`OTP for userId ${mobile} = ${otp}`);
    // TODO: here add logic to send OTP SMS to `mobile`
    res.locals.otp[mobile] = otp;
  }

  private async registerUser(mobile, dbConn, res) {
    // Generate Random 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    LOGGER.info(`OTP for user - ${mobile} is ${otp}`);
    // TODO: here add logic to send OTP to `mobile`
    res.locals.mobile_otp[mobile] = { mobile, otp };
    const result = await dbConn.execute('INSERT INTO `user` SET `mobile` = ? ', [mobile]);
    return result;
    // if(result[0].insertId){
    //   const salt = await bcrypt.genSaltSync(10);
    //   return await bcrypt.hash(result[0].insertId, salt);
    //   // user added
    //   return true;
    // }
  }

  private getToken(payload, options: { expiresIn: string } = { expiresIn: '5m' }) {
    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    req.session.destroy(err => {
      if (err) {
        next(new BaseError(`ERR_LOGOUT`));
      }
    });
    LOGGER.info(`Logged out.`);
    res.json({
      status: res.statusCode,
      userMessage: `You're now logged out!`
    });
  }

  private async getUser(mobile, dbConn) {
    // dbConn.execute returns an array of objects.
    const [rows] = await dbConn.execute('SELECT * FROM `user` WHERE `mobile` = ?;', [mobile]);
    return rows.length ? rows : false;
  }

  // This generates a session ID and a CSRF token tied to it for mobile number form before the authentication
  private async generatePreAuthToken() {
    // https://stackoverflow.com/a/65262232
    // Generate sessionId using device fingerprinting
  }*/
}

export { AuthMiddleware };
