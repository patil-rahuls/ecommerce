import { NextFunction, Request, Response } from 'express';
import { BaseError } from './error-middleware.js';

export default {
  setCsrfToken() {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        // Prevent any form like [GET /user/login] from being accessed directly, as they return the CSRF token.
        // User needs to first visit home page or any product page before he can access the form (like login form).
        // This is because, the login form will be presented only when user clicks on the "Login" btn on the header.
        // And for this, user must browse some page first, possibly the home page OR any other product page, so that
        // the pre-session id is set in `req.session.preSessionId` on browsing that page.
        if (!req.session.preSessionId) {
          throw new BaseError(`ERR_LOGINFORM_UNAUTHORIZED`);
        }
        const ctCookie = req
          .header('Cookie')
          ?.split('; ')
          ?.filter(c => /ct=/.test(c))?.[0]
          ?.split('=')?.[1];
        // Generate a CSRF token if expired/not-exists.
        // if (!req.session?.ct || !ctCookie) {
        if (!ctCookie) {
          const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let result = '';
          for (let i = 64; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
          // Tie the CSRF token with the session
          req.session.ct = result;
          // Set CSRF token in a response cookie
          res.cookie('ct', req.session.ct, { sameSite: 'strict', maxAge: 5 * 60 * 1000 });
        }
      } catch (err) {
        next(err);
      }
      next();
    };
  }
};
