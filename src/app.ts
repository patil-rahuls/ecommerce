import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import { engine } from 'express-handlebars';
import './config/dotenv.js';
import { LOGGER } from './common/logger.js';
import { BaseError } from './middlewares/error-middleware.js';
import { Controller } from './common/interfaces/controller.js';
import path from 'path';

class App {
  public app: express.Application;
  private PORT = process.env.PORT || 4000;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    // Error Handler Middleware (last Middleware is treated as error handler)
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false })); // IMP - these should be written before all the routes.
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            'frame-ancestors': ["'none'"],
            'style-src': ["'self'", "'unsafe-inline'", '*.cloudflare.com', '*.googleapis.com'],
            'font-src': ["'self'", '*.gstatic.com', '*.cloudflare.com'],
            'img-src': ["'self'", 'data:']
          }
        },
        crossOriginResourcePolicy: {
          policy: 'same-site'
        },
        strictTransportSecurity: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        // X-Content-Type-Options: nosniff - bydefault
        xFrameOptions: { action: 'deny' }
      })
    );
    this.app.use(
      session({
        // Session cookie config.
        name: 'satr_id', // hindi translation of the word 'session'
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
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          sameSite: 'strict',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false
        }
      })
    );
    // UI & Templating
    this.app.use(express.static(path.join(import.meta.dirname, 'public')));
    this.app.engine('html', engine({ defaultLayout: 'main', extname: '.html' }));
    this.app.set('view engine', 'html');
    this.app.set('views', path.join(import.meta.dirname, 'views'));
    this.app.enable('view cache'); // this is by default ON on production
    LOGGER.info(`Initialized middlewares.`);
  }

  private initializeErrorHandling() {
    this.app.use(BaseError.ErrorHandler);
    LOGGER.info(`Initialized Error-Handling Middleware.`);
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
    LOGGER.info(`Initialized controllers.`);
  }

  public start() {
    this.app.set('json spaces', 2);
    this.app.listen(this.PORT, () => {
      LOGGER.info(`Server instance started! PORT - ${this.PORT}`);
    });
  }
}
export { App };
