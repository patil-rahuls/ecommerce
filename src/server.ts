import { App } from './app.js';
import { HomeController } from './controller/home.js';
import { UserController } from './user/user-controller.js';

const app = new App([new UserController(), new HomeController()]);
app.start();
