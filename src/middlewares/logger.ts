import { NextFunction, Request, Response } from 'express';
import { asyncLocalStorage } from '../app.js';

abstract class LOGGER {
  private static readonly COLORS = {
    ERROR: '\x1b[31m%s\x1b[0m', //red
    WARN: '\x1b[33m%s\x1b[0m', //yellow
    INFO: '\x1b[36m%s\x1b[0m', //cyan
    SUCCESS: '\x1b[32m%s\x1b[0m' //green
  };

  private static log(color: string, type: string, timestamp: string, req: Request, msg = ``) {
    let sessionMsg = ``;
    let remoteIPMsg = ``;
    let userIdMsg = ``;
    let reqMsg = ``;
    if (req && Object.keys(req).length) {
      if (req?.session?.id) {
        sessionMsg = ` | SessionID: ${req?.session?.id}`;
      }
      const remoteIP = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress;
      if (remoteIP) {
        remoteIPMsg = ` | RemoteIP: ${remoteIP}`;
      }
      const userId = req?.session?.user?.id;
      if (userId) {
        userIdMsg = ` | UserID: ${userId}`;
      }
      if (req?.method && req?.originalUrl && !LOGGER.isIgnoredResource(req)) {
        reqMsg = ` | [${req.method} ${req.originalUrl}]`;
      }
    }
    const msgStr = msg ? ` | - ${msg}` : ``;
    console.log(color, `[${timestamp}] ${type}${sessionMsg}${remoteIPMsg}${userIdMsg}${reqMsg}${msgStr}`);
  }

  private static getLoggerMethod(type: string) {
    return function (msg: string) {
      const timestamp = new Date().toISOString();
      const { REQ }: any = asyncLocalStorage.getStore() || { REQ: null };
      LOGGER.log(LOGGER.COLORS[type], type.padStart(7, ' '), timestamp, REQ, msg);
    };
  }

  // Ignores logging of static resources' requests like images, media, fonts etc.
  private static isIgnoredResource(req: Request) {
    const ignoredResourcesForLogging = ['.css', '.js', '.jp', '.png', '.svg', '.webp', '.ico', '.woff'];
    return ignoredResourcesForLogging.some(resource => req.originalUrl.includes(resource));
  }

  // Request/Response logger to run on each request.
  public static LOG_REQUEST_RESPONSE(req: Request, res: Response, next: NextFunction) {
    res.on('finish', function () {
      if (!LOGGER.isIgnoredResource(req)) {
        const timestamp = new Date().toISOString();
        let msg = ``;
        if (res?.statusCode && res?.statusMessage) {
          msg = `[${res.statusCode} ${res.statusMessage}]`;
        }
        LOGGER.log(LOGGER.COLORS.INFO, 'REQUEST', timestamp, req, msg);
      }
    });
    next();
  }

  public static INFO(msg: string) {
    LOGGER.getLoggerMethod('INFO')(msg);
  }

  public static ERROR(msg: string) {
    LOGGER.getLoggerMethod('ERROR')(msg);
  }

  public static WARN(msg: string) {
    LOGGER.getLoggerMethod('WARN')(msg);
  }

  public static SUCCESS(msg: string) {
    LOGGER.getLoggerMethod('SUCCESS')(msg);
  }
}
export { LOGGER };
