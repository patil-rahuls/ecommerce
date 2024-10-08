import { NextFunction, Request, Response, Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';

class HomeController implements Controller {
  public path: string;
  public router: Router;

  constructor() {
    this.path = '/';
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(``, (req, res, next) => this.setPreSessionId(req, res, next));
    this.router.get(``, this.homePage);
    this.router.get(`/404`, this.pageNotFound);
    this.router.get(`/500`, this.errorPage);
  }

  private async setPreSessionId(req: Request, res: Response, next: NextFunction) {
    // set preSessionId on session, to tie the login-form csrf token with.
    req.session.preSessionId = req.session.id;
    next();
  }

  private async homePage(req: Request, res: Response) {
    let data: any = req.session?.user?.isAuthenticated ? req.session?.user : null;
    // Logic to ask user to login and save previous url in session.
    // Check if query '/?login=true&redirectTo=' is set.
    if (Object.keys(req.query).length === 2 && req.query.login && req.query.redirectTo) {
      if (data === null) {
        data = {};
      }
      data['loginRequested'] = true;
      req.session.redirectUrl = `${req.query.redirectTo}`;
    }
    res.render('index', {
      layout: 'home',
      data
    });
  }

  private async pageNotFound(req: Request, res: Response) {
    const data = req.session?.user?.isAuthenticated ? req.session?.user : null;
    res.render('index', {
      layout: '404',
      data
    });
  }

  private async errorPage(req: Request, res: Response) {
    const data = req.session?.user?.isAuthenticated ? req.session?.user : null;
    res.render('index', {
      layout: '500',
      data
    });
  }
}

export { HomeController };
