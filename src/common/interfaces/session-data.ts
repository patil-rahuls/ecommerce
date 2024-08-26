import { User } from './user.js';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: User;
    otp: string;
    ct: string; // CSRF Token
    preSessionId?: string;
    lastOtpAt: any;
    previousUrl: string; // Url to redirect at, after login.
  }
}
