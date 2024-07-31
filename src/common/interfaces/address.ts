import { AddressType } from '../types.js';

interface Address {
  name: string;
  mobile: number;
  pincode: number;
  address_text: string;
  address_type: AddressType;
}

export { Address };
