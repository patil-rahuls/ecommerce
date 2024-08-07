import { NextFunction, Request, Response } from 'express';
import { DB } from '../config/db.js';
import { DBInstance } from '../common/types.js';

export default {
  setDbInstance(dbInstance: DBInstance) {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        res.locals.DB = {
          READ: null,
          WRITE: null
        };
        res.locals.DB_CONN = {
          READ: null,
          WRITE: null
        };
        res.locals.DB[dbInstance] = await DB.getInstance(dbInstance);
      } catch (err) {
        next(err);
      }
      next();
    };
  }
};
