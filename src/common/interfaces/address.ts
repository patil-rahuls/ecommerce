import { AddressType } from '../types';

interface Address {
  name: string;
  mobile: number;
  pincode: number;
  address_text: string;
  address_type: AddressType;
}

export { Address };
