import '../config/dotenv.js';
import db, { Pool } from 'mysql2/promise';
import { NextFunction, Request, Response } from 'express';
import { DBInstance, DB_INSTANCE_ARR } from '../common/types.js';
import { LOGGER } from '../common/logger.js';
import { BaseError } from './error-middleware.js';

abstract class DB {
  // private constructor() {}

  private static readInstance: Pool;
  private static writeInstance: Pool;
  // Create more static instances here, if any db instance is added in the system.
  // Refer & Update DB_INSTANCE_ARR from '../common/types.js' First.

  // Called from the middlewares before getConnection
  public static async getInstance(instance: DBInstance) {
    try {
      const config = JSON.parse(process.env[`DB_${instance}`]);
      switch (instance) {
        case 'READ':
          return DB.readInstance || this.createDbInstancePool(config);
        case 'WRITE':
          return DB.writeInstance || this.createDbInstancePool(config);
        default:
          throw new BaseError(`DB_INSTANCE_NOT_FOUND`);
      }
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(`ERR_DB_CONNECTION`, error.message);
    }
  }

  private static createDbInstancePool(config) {
    return db.createPool({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.dbname,
      waitForConnections: true,
      connectionLimit: 2,
      maxIdle: 2, // max idle connections, the default value is the same as `connectionLimit`
      idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }

  // Called from the controllers.
  public static setInstance(dbInstance: DBInstance) {
    return async function (req: Request, res: Response, next: NextFunction) {
      try {
        res.locals.DB = {
          READ: null,
          WRITE: null
        };
        res.locals.DB_CONN = {
          READ: null,
          WRITE: null
        };
        res.locals.DB[dbInstance] = await DB.getInstance(dbInstance);
        LOGGER.info(`MySQL-'${dbInstance}' In use`);
      } catch (err) {
        next(err);
      }
      next();
    };
  }

  public static async createConnection(res: Response) {
    const dbInstance = Object.keys(res.locals.DB)?.find(k => res.locals.DB[k] !== null);
    // ^ 'WRITE' or 'READ' or other DB Instance identifier.
    if (!dbInstance) {
      throw new BaseError('DB_INSTANCE_NOT_FOUND');
    }
    res.locals.DB_CONN[dbInstance] = await res.locals.DB[dbInstance].getConnection();
    LOGGER.info(`MySQL-'${dbInstance}' Connected!`);
    return res.locals.DB_CONN[dbInstance];
  }

  public static releaseConnection(res: Response) {
    DB_INSTANCE_ARR.forEach(async instance => {
      if (res.locals?.DB_CONN?.[instance]) {
        await res.locals.DB_CONN[instance].release();
        LOGGER.info(`MYSQL-'${instance}' Released!`);
      }
    });
  }
}

export { DB };
// <pool>.query() = creates an on-demand connection + connection.query() + connection.release()
// conn = <pool>.getConnection();
// conn.query("SELECT * FROM user WHERE 1 LIMIT 10;");
// Connection is NOT automatically released when query resolves.
// conn.release(); // will release the connection back to the connection pool
// conn.end();     // optional. ends the connection. We don't need to do this at all, as our app won't ever shut down.
