import { AddressType } from '../types.js';

interface Address {
  id: number;
  name: string;
  mobile: string;
  pincode: number;
  addressText: string;
  addressType: AddressType;
}

export { Address };
