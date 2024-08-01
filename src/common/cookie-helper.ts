import { Request, Response } from 'express';

abstract class CookieHelper {
  public static getCookie = (req: Request, cookieType) => {
    const regxPattern = new RegExp(String.raw`${cookieType}=`);
    return req
      .header('Cookie')
      ?.split('; ')
      ?.filter(c => regxPattern.test(c))?.[0]
      ?.split('=')?.[1];
  };
  public static deleteCookies = (res: Response, cookieName) => {
    res.cookie(cookieName, null, {
      expires: new Date('Thu, 01 Jan 1970 00:00:00 UTC'),
      httpOnly: false
    });
  };
}

export { CookieHelper };
