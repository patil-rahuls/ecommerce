import { Request, Response } from 'express';
import { LOGGER } from '../middlewares/logger.js';

abstract class CookieHelper {
  public static readonly getCookie = (req: Request, cookieType) => {
    const regxPattern = new RegExp(String.raw`${cookieType}=`);
    return req
      .header('Cookie')
      ?.split('; ')
      ?.filter(c => regxPattern.test(c))?.[0]
      ?.split('=')?.[1];
  };
  public static readonly deleteCookies = (res: Response, cookieName) => {
    res.cookie(cookieName, null, {
      expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
      httpOnly: false
    });
    LOGGER.INFO(`Deleted Cookies`);
  };
}

export { CookieHelper };
