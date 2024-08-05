import { RedisClientType, createClient } from 'redis';
import { BaseError } from '../middlewares/error-middleware.js';
import { LOGGER } from './logger.js';

class Redis {
  private static instance: Redis;
  private static client: RedisClientType;

  private constructor() {}

  public init(url: string) {
    Redis.client = createClient({ url });

    Redis.client.on('error', err => {
      Redis.client.quit();
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
