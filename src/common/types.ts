export type DBInstance = 'READ' | 'WRITE';
export type AddressType = 'Home' | 'Work';
// export type Gender = 'Male' | 'Female';
export const GENDER_ARR = ['Male', 'Female'] as const;
export type Gender = (typeof GENDER_ARR)[number];
