import { NextFunction, Request, Response } from 'express';
import { ERROR_CODES, GENERIC_ERR_STR } from '../common/error-codes.js';
import { LOGGER } from '../middlewares/logger.js';
import { DB } from './db.js';

class BaseError extends Error {
  public debug;
  public status;
  public userMessage;
  constructor(
    public code: string,
    message?: string
  ) {
    const err = Object.assign({}, ERROR_CODES[code]);
    if (message) {
      err.message = `BaseError - ${err.message} - ${message}`;
    }
    super(err.message);
    Object.keys(err).forEach(key => (this[key] = err[key]));
    this.name = this.constructor.name; // to make err instanceof BaseError
  }

  // Default Error Middleware for the express app.
  public static ErrorHandler = (err: Error | BaseError, req: Request, res: Response, next: NextFunction) => {
    const errObj = {
      debug: `${req?.method} ${req?.path}`,
      message: err?.message || GENERIC_ERR_STR,
      stack: err?.stack,
      status: res.statusCode === 200 ? 500 : res.statusCode,
      userMessage: GENERIC_ERR_STR
    };

    if (!err) {
      return next
        ? next()
        : res.status(500).json({
            status: 500,
            message: `Error in ErrorHandler. LOL !!`,
            userMessage: GENERIC_ERR_STR
          });
    }

    // Release DB connections.
    DB.releaseConnection(res);

    if (err instanceof BaseError) {
      errObj.status = err.status;
      if (err.userMessage) {
        errObj.userMessage = err.userMessage;
      }
    }

    LOGGER.ERROR(JSON.stringify(errObj, null, 2));
    if (process.env.NODE_ENV === 'production') {
      delete errObj.stack;
      delete errObj.message;
      delete errObj.debug;
    }
    res.status(errObj.status).json(errObj);
  };
}

export { BaseError };
