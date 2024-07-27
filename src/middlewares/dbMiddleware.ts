import { NextFunction, Request, Response } from 'express';
import { DB } from '../config/db.js';
import { DBInstance } from '../common/types.js';

export default {
  setDbInstance(dbInstance: DBInstance) {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        res.locals[`DB_INSTANCE_${dbInstance}`] = await DB.getInstance(dbInstance);
      } catch (err) {
        next(err);
      }
      next();
    };
  }
};
