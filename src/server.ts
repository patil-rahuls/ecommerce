import { App } from './app.js';
import { UserController } from './user/user-controller.js';
import { HomeController } from './controller/home.js';
import { ProductController } from './product/product-controller.js';

const app = new App([new UserController(), new HomeController(), new ProductController()]);
app.start();
