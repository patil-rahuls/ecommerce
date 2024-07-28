import { User } from './interfaces/user';

export type DBInstance = 'READ' | 'WRITE';
export type Gender = 'Male' | 'Female';
export type AddressType = 'Home' | 'Work';
declare module 'express-session' {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: User;
    authenticated: boolean;
    otp: string;
    ct: string; // csrf token
    at: string; // auth token
    rt: string; // refresh token
    preSessionId?: string;
  }
}
