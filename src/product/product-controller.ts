import { Router } from 'express';
import { Controller } from '../common/interfaces/controller.js';
import { ProductMiddleware } from './product-middleware.js';
import { CSRF } from '../middlewares/csrf.js';

class ProductController implements Controller {
  public path: string;
  public router: Router;
  private product;

  constructor() {
    this.path = '/';
    this.router = Router();
    this.product = new ProductMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get Product Page
    this.router.get(`/:ptitle/pid/:pid`, CSRF.protect(), this.product.getProduct);

    // WIP Set Dummy Product - Only for development
    // this.router.post(`/:pid`, CSRF.protect(), this.product.setProduct);
  }
}

export { ProductController };
