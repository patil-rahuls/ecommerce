import { Gender } from '../types.js';
import { Address } from './address.js';
import { Cart } from './cart.js';
import { Product } from './product.js';

interface User {
  id: number;
  mobile: string;
  password?: string;
  email?: string;
  name?: string;
  gender?: Gender;
  defaultBillingAddress?: number; // points to Address.id
  defaultShippingAddress?: number; // points to Address.id
  allAddresses?: Address[];
  wishlist: Product[];
  cart: Cart[];
  orders: any; // WIP
  userGroup?: string;
  createdAt?: string;
  isAuthenticated: boolean;
}

export { User };
