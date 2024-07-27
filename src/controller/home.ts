import { NextFunction, Request, Response, Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import CSRF from '../middlewares/csrfMiddleware.js';

class HomeController implements Controller {
  public path: string;
  public router: Router;

  constructor() {
    this.path = '/';
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(``, this.homePage);
  }

  private async homePage(req: Request, res: Response, next: NextFunction) {
    // set pre-session Id, to tie the login form csrf token with.
    req.session.preSessionId = req.session.id;
    // OR return home html page.
    res.json({
      status: 200,
      userMessage: `Welcome`
    });
  }
}

export { HomeController };
