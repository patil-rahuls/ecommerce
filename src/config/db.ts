import './dotenv.js';
import db, { Pool } from 'mysql2/promise';
import { LOGGER } from '../common/logger.js';
import { DBInstance } from '../common/types.js';
import { BaseError } from '../middlewares/error-middleware.js';

abstract class DB {
  // private constructor() {}
  private static readInstance: Pool;
  private static writeInstance: Pool;
  // Create more static instances here, if any db instance is added in the system.

  public static async getInstance(instance: DBInstance) {
    try {
      const config = JSON.parse(process.env[`DB_${instance}`]);
      switch (instance) {
        case 'READ':
          if (!DB.readInstance) {
            DB.readInstance = db.createPool({
              host: config.host,
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
          LOGGER.info(`Using MySQL-'${instance}' instance.`);
          return DB.readInstance;
        case 'WRITE':
          if (!DB.writeInstance) {
            DB.writeInstance = db.createPool({
              host: config.host,
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
          LOGGER.info(`Using MySQL-'${instance}' instance.`);
          return DB.writeInstance;
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
}

export { DB };
/* usage -
import DB from './config/db'
    try {
        const readConn = await DB.getInstance('read');
        // 1. Using Connection Pool
        // Connection is created on-demand is automatically released when query resolves.
        const result = await readConn.query("SELECT * FROM user WHERE 1 LIMIT 10;");
        // <pool>.query() = (<pool>.getConnection() => creates an on-demand connection) + connection.query() + connection.release()
        const [rows, fields] = await pool.query('SELECT `field` FROM `table`');

        // 2. Using Manually creating Connection from the Pool
        // i.e. using `<pool>.getConnection()`
        const conn = await readPool.getConnection();
        const res = await conn.query("SELECT * FROM user WHERE 1 LIMIT 10;");
        // Connection is NOT automatically released when query resolves.
        conn.release(); // will release the connection back to the connection pool
        // readConn.end(); // optional. ends the connection. We don't need to do this at all, as our app won't ever shut down.
        const result = await res;

    } catch (err) {
        //
    }
*/
