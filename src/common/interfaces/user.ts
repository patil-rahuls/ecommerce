import { Gender } from '../types.js';
import { Address } from './address.js';

interface User {
  id: number;
  mobile: string;
  password?: string;
  email?: string;
  name?: string;
  gender?: Gender;
  defaultBillingAddress?: Address;
  defaultShippingAddress?: Address;
  allAddresses?: Address[];
  userGroup?: string;
  createdAt?: string;
  isAuthenticated: boolean;
}

export { User };
