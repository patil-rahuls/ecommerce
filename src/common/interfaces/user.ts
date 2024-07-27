import { Gender } from '../types.js';
import { Address } from './address.js';

interface User {
  id: number;
  mobile: number;
  password?: string;
  email?: string;
  name?: string;
  gender?: Gender;
  defaultBillingAddress?: Address;
  defaultShippingAddress?: Address;
  allAddresses?: Address[];
  userGroup: string;
  createdAt: string;
}

export { User };
