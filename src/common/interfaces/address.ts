import { AddressType } from '../types.js';

interface Address {
  id: number;
  name: string;
  mobile: number;
  pincode: number;
  addressText: string;
  addressType: AddressType;
}

export { Address };
