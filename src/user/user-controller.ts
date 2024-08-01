import { Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import CSRF from '../middlewares/csrf-middleware.js';
import dbMiddleware from '../middlewares/db-middleware.js';

class UserController implements Controller {
  public path: string;
  public router: Router;
  private auth;

  constructor() {
    this.path = '/user';
    this.router = Router();
    this.auth = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`/login`, CSRF.setCsrfToken(), this.auth.loginForm);
    this.router.post(`/auth`, CSRF.setCsrfToken(), (req, res, next) => this.auth.sendOtp(req, res, next));
    this.router.post(`/verify`, CSRF.setCsrfToken(), dbMiddleware.setDbInstance('WRITE'), (req, res, next) =>
      this.auth.verify(req, res, next)
    );
    this.router.get(`/logout`, this.auth.logout);
  }
}

export { UserController };
