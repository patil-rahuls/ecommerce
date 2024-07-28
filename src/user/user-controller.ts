import { Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import CSRF from '../middlewares/csrf-middleware.js';

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
    // https://stackoverflow.com/a/65416695
    // https://stackoverflow.com/questions/38906961/node-express-cannot-get-route
    this.router.get(`/login`, CSRF.setCsrfToken(), this.auth.loginForm);
    // this.router.post(`/login`, sessionInit, CSRF.setCsrfToken(), this.auth.login);
    // this.router.get(`/auth`, dbMiddleware.setDbInstance('WRITE'), this.auth.authenticate); // route path -> "/user/auth"
    this.router.get(`/logout`, this.auth.logout);
  }
}

export { UserController };
