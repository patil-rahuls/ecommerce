import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import ejsViewEngine from 'ejs';
import './config/dotenv.js';
import { Controller } from './common/interfaces/controller.js';
import { LOGGER } from './middlewares/logger.js';
import { BaseError } from './middlewares/error-middleware.js';
import { AsyncLocalStorage } from 'node:async_hooks';

// Initialize an asyncLocalStorage to store request and response objects that can be accessed globally.
const asyncLocalStorage: any = new AsyncLocalStorage();

class App {
  public app: express.Application;
  private PORT = process.env.PORT || 4000;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.initializeLogger();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  // Logger
  private initializeLogger() {
    this.app.use((req, res, next) => LOGGER.LOG_REQUEST_RESPONSE(req, res, next));

    // Set req and res objects in a global context using AsyncLocalStorage.
    // AsyncLocalStorage works like a 'thread local object'.
    // In our case we get a globally accessible {request, response} context. However, as of Aug. 2024, this is experimental.
    // We will use it for LOGGER to log req info along with log message.
    this.app.use(function (req, res, next) {
      const context = asyncLocalStorage.getStore() || {};
      context['REQ'] = req;
      context['RES'] = res;
      asyncLocalStorage.enterWith(context);
      next();
    });
    LOGGER.INFO(`Initialized Logger`);
  }

  // Middlewares
  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
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
        // Session cookie configuration.
        name: 'satr_id', // satr(Hindi) = 'session'
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
          maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
          sameSite: 'strict',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production' ? true : false
        }
      })
    );
    this.app.use(express.static(path.join(import.meta.dirname, 'public')));
    // UI & Templating
    this.app.set('views', path.join(import.meta.dirname, 'views'));
    this.app.engine('html', ejsViewEngine.__express);
    this.app.set('view engine', 'html');
    LOGGER.INFO(`Initialized Middlewares.`);
  }

  // Routes
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
    this.app.use(function (req, res) {
      res.redirect('/404');
    });
    LOGGER.INFO(`Initialized controllers.`);
  }

  // Error Middleware - (Last Middleware is treated as error handler)
  private initializeErrorHandling() {
    this.app.use(BaseError.ErrorHandler);
    LOGGER.INFO(`Initialized Error-Handler.`);
  }

  public start() {
    this.app.set('json spaces', 2);
    this.app
      .listen(this.PORT, () => {
        LOGGER.INFO(`Server instance started! PORT - ${this.PORT}`);
      })
      .on('error', err => {
        if (err.message.includes('listen EADDRINUSE: address already in use')) {
          LOGGER.ERROR(`PORT-${this.PORT} already in use. Please re-configure the server and restart the App.`);
        }
      });
  }
}
export { App, asyncLocalStorage };
