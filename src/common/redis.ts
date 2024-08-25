import { RedisClientType, createClient } from 'redis';
import { BaseError } from '../middlewares/error-middleware.js';
import { LOGGER } from './logger.js';

class Redis {
  private static instance: Redis;
  private static client: RedisClientType;

  private constructor() {}

  public init(url: string) {
    Redis.client = createClient({
      url,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: function (retries) {
          if (retries > 3) {
            const msg = 'REDIS- Too many attempts to reconnect. Connection terminated!';
            LOGGER.error(msg);
            return new BaseError('ERR_REDIS_CONN_ATTEMPTS_EXCEEDED', msg);
          } else {
            return retries * 500;
          }
        }
      }
    });

    Redis.client.on('error', err => {
      Redis.client.quit();
      LOGGER.info('REDIS-Connection error.');
      throw new BaseError('ERR_REDIS_CONNECTION', err.message);
    });
    Redis.client.on('ready', () => {
      LOGGER.info('REDIS-Ready.');
    });
    Redis.client.on('connect', () => {
      LOGGER.info('REDIS-Connected!');
    });
    Redis.client.on('reconnecting', () => {
      LOGGER.info('REDIS-Connecting...');
    });
    Redis.client.on('end', () => {
      LOGGER.info('REDIS-Disconnected!');
    });
    return Redis.client;
  }

  public static getInstance() {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }
}

export const REDIS_INSTANCE = Redis.getInstance();
