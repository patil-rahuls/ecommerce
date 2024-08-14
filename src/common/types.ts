export const DB_INSTANCE_ARR = ['READ', 'WRITE'] as const;
export type DBInstance = (typeof DB_INSTANCE_ARR)[number];
export const ADDRESS_TYPE_ARR = ['Home', 'Work'] as const;
export type AddressType = (typeof ADDRESS_TYPE_ARR)[number];
export const GENDER_ARR = ['Male', 'Female'] as const;
export type Gender = (typeof GENDER_ARR)[number];
