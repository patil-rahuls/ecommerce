import bodyParser from 'body-parser';
// import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import './config/dotenv.js';
import { LOGGER } from './middlewares/logger.js';
import { BaseError } from './middlewares/errorHandler.js';
import { Controller } from './common/interfaces/controller.js';

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
    // this.app.use(cookieParser());
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'code.jquery.com', '*.jsdelivr.net'],
            'frame-ancestors': ["'none'"],
            'style-src': ["'self'", "'unsafe-inline'", '*.cloudflare.com', '*.googleapis.com', '*.jsdelivr.net'],
            'font-src': ["'self'", '*.gstatic.com', '*.cloudflare.com', '*.jsdelivr.net'],
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
