import { Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import { UserMiddleware } from './user-middleware.js';
import CSRF from '../middlewares/csrf-middleware.js';
import { DB } from '../middlewares/db.js';

class UserController implements Controller {
  public path: string;
  public router: Router;
  private auth;
  private user;

  constructor() {
    this.path = '/user';
    this.router = Router();
    this.auth = new AuthMiddleware();
    this.user = new UserMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Login Authentication
    this.router.get(`/login`, CSRF.setCsrfToken(), this.auth.loginForm);
    this.router.post(`/auth`, CSRF.setCsrfToken(), (req, res, next) => this.auth.sendOtp(req, res, next));
    this.router.post(`/verify`, CSRF.setCsrfToken(), DB.setInstance('WRITE'), (req, res, next) => this.auth.verify(req, res, next));
    this.router.get(`/logout`, this.auth.logout);
    // Profile
    this.router.get(`/profile`, CSRF.setCsrfToken(), DB.setInstance('READ'), (req, res, next) => this.user.profile(req, res, next));
    this.router.post(`/profile`, CSRF.setCsrfToken(), DB.setInstance('WRITE'), (req, res, next) => this.user.updateProfile(req, res, next));
    // Address
    this.router.post(`/address`, CSRF.setCsrfToken(), DB.setInstance('WRITE'), (req, res, next) => this.user.updateAddress(req, res, next));
    this.router.delete(`/address`, CSRF.setCsrfToken(), DB.setInstance('WRITE'), (req, res, next) => this.user.deleteAddress(req, res, next));
    this.router.put(`/address`, CSRF.setCsrfToken(), DB.setInstance('WRITE'), (req, res, next) => this.user.setDefaultAddress(req, res, next));
    // Wishlist
    this.router.get(`/wishlist`, CSRF.setCsrfToken(), DB.setInstance('READ'), (req, res, next) => this.user.wishlist(req, res, next));
    this.router.put(`/wishlist`, CSRF.setCsrfToken(), DB.setInstance('READ'), (req, res, next) => this.user.updateWishlist(req, res, next));
    // Cart
    this.router.get(`/cart`, CSRF.setCsrfToken(), DB.setInstance('READ'), (req, res, next) => this.user.cart(req, res, next));
    // Orders
    this.router.get(`/orders`, CSRF.setCsrfToken(), DB.setInstance('READ'), (req, res, next) => this.user.orders(req, res, next));
  }
}

export { UserController };
