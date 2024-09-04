import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../middlewares/error-middleware.js';
import { REDIS_INSTANCE } from '../common/redis.js';
import { LOGGER } from '../middlewares/logger.js';

class ProductMiddleware {
  // Get a product's all attributes' values.
  public async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.params?.ptitle && req.params?.pid) {
        const productDetails = await this.getProductFromRedis(`PRODUCT:${req.params.pid}`);
        res.render('index', {
          layout: 'product',
          data: productDetails
        });
      } else {
        res.redirect('/');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PRODUCT_PAGE`, error.message));
      }
    }
  }

  // Get only required attribute-values of a product. (For wishlist, cart, etc)
  public async getProductDetailsByAttributes(pid, attributesArr) {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      const productDetails = await redisRead.hmGet(`PRODUCT:${pid}`, attributesArr);
      await redisRead.quit();
      return productDetails;
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }
      throw new BaseError(`ERR_PRODUCT_WISHLIST`, error.message);
    }
  }

  //   Only for dev . Will remove once testing is done.
  public async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      // Warning: KEYS should only be used in production environments with extreme care.
      // It may ruin performance when it is executed against large databases.(like products data).
      const productKeys = await redisRead.keys(`PRODUCT:*`);
      LOGGER.WARN(JSON.stringify(productKeys));
      const allProductDetails = productKeys.map(async k => {
        return this.getProductFromRedis(k);
      });
      LOGGER.WARN(JSON.stringify(allProductDetails));
      await redisRead.quit();
      res.render('index', {
        layout: 'product',
        data: allProductDetails
      });
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_PRODUCT_PAGE`, error.message));
      }
    }
  }

  //   WIP DUMMY
  public async setProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.params.pid) {
        const redisWrite = REDIS_INSTANCE.init(process.env.REDIS_URL);
        await redisWrite.connect();
        const productDetails = {
          id: req.params.pid,
          imgThumbnail: `/product.jpeg`,
          title: `Product Brand's Product Title WITH Product's salient features`,
          rating: 2,
          discountPercentage: `15`,
          mrp: `1299`,
          sellPrice: `1099`,
          url: `/xyz-abc/pid/${req.params.pid}`
        };
        const result = await redisWrite.hSet(`PRODUCT:${req.params.pid}`, productDetails); // Returns no. of values set in hmap
        await redisWrite.quit();
        // if(!isNaN(result) && (Number(result) % 1 === 0)) {
        res.render('index', {
          layout: 'product',
          data: result
        });
      } else {
        res.redirect('/');
      }
    } catch (error) {
      if (error instanceof BaseError) {
        next(error);
      } else {
        next(new BaseError(`ERR_SET_PRODUCT`, error.message));
      }
    }
  }

  // ## Redis Commands ## //
  private async getProductFromRedis(productKey) {
    const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
    await redisRead.connect();
    const productDetails = await redisRead.hGetAll(productKey);
    await redisRead.quit();
    return productDetails;
  }
}

export { ProductMiddleware };
