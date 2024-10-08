import { REDIS_INSTANCE } from './redis.js';
import { BaseError } from '../middlewares/error-middleware.js';
import { LOGGER } from '../middlewares/logger.js';

abstract class SMSAuth {
  public static readonly generateSendOTP = async (mobileNum, prevOtpTimeStamp = 0) => {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      if (await redisRead.get(`USR:OTP:${mobileNum}`)) {
        // If OTP exists in redis, it is valid.
        // Check if OTP is requested too soon ie. before 3 minutes.
        const diff = (Date.now() - prevOtpTimeStamp) / 1000 / 60; // minutes
        if (diff < 3) {
          await redisRead.quit();
          throw new BaseError('ERR_USER_OTP_REQUESTED_TOO_SOON');
        }
      }

      // UUID, shortid, nanoid could be used for generating random OTPs
      const otp = Math.floor(1000 + Math.random() * 9000);
      const OTP_VALIDITY = 5 * 60; // 5 minutes
      const otpSaveOptions = { EX: OTP_VALIDITY }; // OTP valid for 5 Minutes.
      let otpSet,
        reAttempts = 0;
      do {
        otpSet = await redisRead.set(`USR:OTP:${mobileNum}`, otp, otpSaveOptions);
        if (reAttempts) {
          LOGGER.WARN(`OTP->Redis re-attempt# ${reAttempts}`);
        }
        reAttempts++;
      } while (otpSet !== 'OK' && reAttempts < 2);
      if (otpSet === 'OK') {
        LOGGER.SUCCESS(`OTP-${mobileNum} -> ${await redisRead.get(`USR:OTP:${mobileNum}`)}`);
        // TODO: here, add the logic to send OTP SMS to `userId` through AWS SQS.
        // if sending SMS fails, do the following
        // 1. Remove that entry from redis and
        // 2. throw error(already handled)
        await redisRead.quit();
        return otp;
      }
      await redisRead.quit();
      throw new BaseError('ERR_USER_OTP_COULDNT_SAVE');
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      } else {
        throw new BaseError(`ERR_USER_OTP_COULDNT_SEND`, error.message);
      }
    }
  };

  public static readonly verifyOTP = async (mobileNum, givenOTP) => {
    try {
      let otpVerified = false;
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      const otp = await redisRead.get(`USR:OTP:${mobileNum}`);
      if (otp && otp === givenOTP) {
        otpVerified = true;
        await redisRead.del(`USR:OTP:${mobileNum}`);
      }
      await redisRead.quit();
      return otpVerified;
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      } else {
        throw new BaseError(`ERR_USER_OTP_COULDNT_SEND`, error.message);
      }
    }
  };
}

export { SMSAuth };
