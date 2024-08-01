import { User } from './user.js';

declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: User;
    otp: string;
    ct: string; // csrf token
    at: string; // auth token
    rt: string; // refresh token
    preSessionId?: string;
    otpTimestamp: any; // timestamp at which otp was sent.
  }
}
