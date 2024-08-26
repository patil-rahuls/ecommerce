import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import ejsViewEngine from 'ejs';
import './config/dotenv.js';
import { Controller } from './common/interfaces/controller.js';
import { LOGGER } from './common/logger.js';
import { BaseError } from './middlewares/error-middleware.js';

class App {
  public app: express.Application;
  private PORT = process.env.PORT || 4000;

  constructor(controllers: Controller[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
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
    LOGGER.info(`Initialized middlewares.`);
  }

  // Error Middleware - (Last Middleware is treated as error handler)
  private initializeErrorHandling() {
    this.app.use(BaseError.ErrorHandler);
    LOGGER.info(`Initialized Error-Handling Middleware.`);
  }

  // Routes
  private initializeControllers(controllers: Controller[]) {
    controllers.forEach(controller => {
      this.app.use(controller.path, controller.router);
    });
    this.app.use(function (req, res) {
      res.redirect('/404');
    });
    LOGGER.info(`Initialized controllers.`);
  }

  public start() {
    this.app.set('json spaces', 2);
    this.app
      .listen(this.PORT, () => {
        LOGGER.info(`Server instance started! PORT - ${this.PORT}`);
      })
      .on('error', err => {
        if (err.message.includes('listen EADDRINUSE: address already in use')) {
          console.error(`PORT-${this.PORT} already in use. Please re-configure the server and restart the App.`);
        }
      });
  }
}
export { App };
