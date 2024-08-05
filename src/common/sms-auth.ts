import { REDIS_INSTANCE } from './redis.js';
import { BaseError } from '../middlewares/error-middleware.js';
import { LOGGER } from './logger.js';

abstract class SMSAuth {
  public static readonly generateSendOTP = async (mobileNum, prevOtpTimeStamp = 0) => {
    try {
      const redisRead = REDIS_INSTANCE.init(process.env.REDIS_URL);
      await redisRead.connect();
      if (await redisRead.get(`${mobileNum}`)) {
        // if OTP exists in redis, it is valid.
        // Check if OTP is requested too soon ie. before 3 minutes.
        const diff = (Date.now() - prevOtpTimeStamp) / 1000 / 60; // minutes
        if (diff < 3) {
          await redisRead.quit();
          throw new BaseError('ERR_OTP_REQUESTED_TOO_SOON');
        }
      }

      // UUID, shortid, nanoid could be used for generating random OTPs
      const otp = Math.floor(1000 + Math.random() * 9000);
      const OTP_VALIDITY = 5 * 60; // 5 minutes
      const otpSaveOptions = { EX: OTP_VALIDITY }; // OTP valid for 5 Minutes.
      let otpSet,
        reAttempts = 0;
      do {
        otpSet = await redisRead.set(`${mobileNum}`, otp, otpSaveOptions);
        if (reAttempts) {
          LOGGER.warn(`OTP->Redis re-attempt# ${reAttempts}`);
        }
        reAttempts++;
      } while (otpSet !== 'OK' && reAttempts < 2);
      if (otpSet === 'OK') {
        LOGGER.dev(`OTP-${mobileNum} -> ${await redisRead.get(`${mobileNum}`)}`);
        // TODO: here, add the logic to send OTP SMS to `userId` through AWS SQS.
        // if sending SMS fails, remove that entry from redis and throw error.
        await redisRead.quit();
        return otp;
      }
      await redisRead.quit();
      throw new BaseError('ERR_COULDNT_SAVE_OTP');
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      } else {
        throw new BaseError(`ERR_COULDNT_SEND_OTP`, error.message);
      }
    }
  };
}

export { SMSAuth };
