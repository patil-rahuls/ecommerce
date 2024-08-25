import { Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import { AuthMiddleware } from './user-auth-middleware.js';
import { UserMiddleware } from './user-middleware.js';
import { CSRF } from '../middlewares/csrf.js';
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
    this.initializeCommonMiddlewares();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get Login Form
    this.router.get(`/login`, this.auth.loginForm);
    // Verify Mobile Number and Send OTP
    this.router.post(`/auth`, (req, res, next) => this.auth.sendOtp(req, res, next));
    // Verify Pasword / OTP
    this.router.post(`/verify`, DB.setInstance('WRITE'), (req, res, next) => this.auth.verify(req, res, next));
    // Logout
    this.router.get(`/logout`, AuthMiddleware.logout);

    // Profile Page
    this.router.get(`/profile`, AuthMiddleware.isAuthenticated, DB.setInstance('READ'), (req, res, next) => this.user.profile(req, res, next));
    // Edit Profile Details & Addresses
    this.router.post(`/profile`, AuthMiddleware.isAuthenticated, DB.setInstance('WRITE'), (req, res, next) => this.user.updateProfile(req, res, next));
    // Edit Address
    this.router.post(`/address`, AuthMiddleware.isAuthenticated, DB.setInstance('WRITE'), (req, res, next) => this.user.updateAddress(req, res, next));
    // Delete Address
    this.router.delete(`/address`, AuthMiddleware.isAuthenticated, DB.setInstance('WRITE'), (req, res, next) => this.user.deleteAddress(req, res, next));
    // Set Address as Default
    this.router.put(`/address`, AuthMiddleware.isAuthenticated, DB.setInstance('WRITE'), (req, res, next) => this.user.setDefaultAddress(req, res, next));

    // Get Wishlist Products
    this.router.get(`/wishlist`, AuthMiddleware.isAuthenticated, (req, res, next) => this.user.wishlist(req, res, next));
    // Add item to Wishlist
    this.router.post(`/wishlist`, AuthMiddleware.isAuthenticated, (req, res, next) => this.user.updateWishlist(req, res, next));
    // Remove Wishlist Item
    this.router.delete(`/wishlist`, AuthMiddleware.isAuthenticated, (req, res, next) => this.user.updateWishlist(req, res, next));

    // Cart WIP
    this.router.get(`/cart`, AuthMiddleware.isAuthenticated, DB.setInstance('READ'), (req, res, next) => this.user.cart(req, res, next));
    // Orders WIP
    this.router.get(`/orders`, AuthMiddleware.isAuthenticated, DB.setInstance('READ'), (req, res, next) => this.user.orders(req, res, next));
  }

  private initializeCommonMiddlewares() {
    this.router.use(CSRF.protect());
  }
}

export { UserController };
