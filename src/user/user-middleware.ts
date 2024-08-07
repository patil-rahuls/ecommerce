import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../middlewares/error-middleware.js';

class UserMiddleware {
  public async profile(req: Request, res: Response, next: NextFunction) {
    try {
      // const data = req.session?.user?.isAuthenticated ? req.session?.user : null;
      const data = { name: null, mobile: '7666016757', password: null, email: null, gender: null };
      res.render('index', {
        layout: 'user-profile',
        data
      });
      // if(req.session?.user?.isAuthenticated){
      //     res.json({
      //         status: res.statusCode,
      //         userMessage: `Use your mobile number to login!`
      //     });
      // } else {

      // }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PROFILE_PAGE`, error.message));
      }
    }
  }
}

export { UserMiddleware };
