import { App } from './app.js';
import { UserController } from './user/user-controller.js';
import { HomeController } from './controller/home.js';

const app = new App([new UserController(), new HomeController()]);
app.start();
