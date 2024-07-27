import { App } from './app.js';
import { HomeController } from './controller/home.js';
import { UserController } from './controller/user.js';

const app = new App([new UserController(), new HomeController()]);
app.start();
