import { NextFunction, Request, Response } from 'express';
import { BaseError } from './error-middleware.js';
import { CookieHelper } from '../common/cookie-helper.js';

abstract class CSRF {
  public static protect() {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        // Protection #1
        // Prevent any form like [GET /user/login] from being accessed directly, as they return the CSRF token.
        // User needs to first visit home page or any product page before he can access the form (like login form).
        // This is because, the login form will be presented only when user clicks on the "Login" btn on the header.
        // And for this, user must browse some page first, possibly the home page OR any other product page, so that
        // the pre-session id is set in `req.session.preSessionId` on browsing that page.
        if (!req.session.preSessionId) {
          throw new BaseError(`ERR_RESOURCE_ATTEMPT_UNAUTHORIZED`);
        }

        // Protection #2 CSRF Tokens.
        const ctCookie = CookieHelper.getCookie(req, 'ct');
        if (['GET'].includes(req.method) || !ctCookie) {
          const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
          let result = '';
          for (let i = 64; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
          }
          // Tie the CSRF token with the session
          req.session.ct = result;
          // Set CSRF token in a response cookie
          res.cookie('ct', req.session.ct, { sameSite: 'strict', maxAge: 10 * 60 * 1000 });
        }
        if (['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(req.method)) {
          const { ct = '' } = req.body;
          // Double submit + in body. LOL! Feel free to roast!
          if (![ct, ctCookie, req.header('X-XSRF-TOKEN')].every(token => token === req.session.ct)) {
            throw new BaseError(`ERR_INVALID_CSRF_TOKEN`);
          }
        }
        next();
      } catch (err) {
        if (err.code === `ERR_RESOURCE_ATTEMPT_UNAUTHORIZED`) {
          res.redirect('/404');
        } else {
          next(err);
        }
      }
    };
  }
}

export { CSRF };
