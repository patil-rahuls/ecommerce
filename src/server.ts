import { App } from './app.js';
import { UserController } from './controller/user.js';

const app = new App([new UserController()]);
app.start();
