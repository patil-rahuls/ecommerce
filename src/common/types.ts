export type DBInstance = 'READ' | 'WRITE';
export const ADDRESS_TYPE_ARR = ['Home', 'Work'] as const;
export type AddressType = (typeof ADDRESS_TYPE_ARR)[number];
// export type Gender = 'Male' | 'Female';
export const GENDER_ARR = ['Male', 'Female'] as const;
export type Gender = (typeof GENDER_ARR)[number];
