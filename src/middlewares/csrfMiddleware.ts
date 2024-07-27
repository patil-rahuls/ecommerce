import { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'node:crypto';

export default {
  setCsrfToken() {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        const ct = randomBytes(36).toString('base64');
        req.session.ct = ct;
      } catch (err) {
        next(err);
      }
      next();
    };
  }
};
