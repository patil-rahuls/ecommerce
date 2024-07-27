import { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

export default {
  setCsrfToken() {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        // Tie the CSRF token with the session
        req.session.ct = randomBytes(36).toString('base64');
        // Set CSRF token in a response cookie
        res.cookie('ct', req.session.ct, { sameSite: 'strict', maxAge: 5 * 60 * 1000 });
      } catch (err) {
        next(err);
      }
      next();
    };
  }
};
