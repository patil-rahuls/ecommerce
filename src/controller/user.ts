import { Router } from 'express';
import session from 'express-session';
import { Controller } from '../common/interfaces/controller.js';
import { AuthMiddleware } from '../middlewares/authMiddleware.js';
// import dbMiddleware from '../middlewares/dbMiddleware.js';
import CSRF from '../middlewares/csrfMiddleware.js';

const sessionInit = session({
  secret: process.env.SESSION_SECRET, // used to sign the session ID cookie.
  resave: false, // save changes to the store on every request.
  saveUninitialized: false,
  // store: new RedisStore({
  //   host: 'localhost',
  //   port: 0000,
  //   client: '',
  //   user: '',
  //   password: ''
  // }),
  cookie: {
    maxAge: 2 * 60 * 1000,
    sameSite: 'strict',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production' ? true : false
  }
});
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
    this.router.get(`/login`, sessionInit, CSRF.setCsrfToken(), this.auth.loginForm);
    // this.router.post(`/login`, sessionInit, CSRF.setCsrfToken(), this.auth.login);
    // this.router.get(`/auth`, dbMiddleware.setDbInstance('WRITE'), this.auth.authenticate); // route path -> "/user/auth"
    // this.router.get(`/logout`, this.auth.logout);
  }
}

export { UserController };
