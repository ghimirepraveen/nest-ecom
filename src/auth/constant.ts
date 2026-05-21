export const USERTYPE = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
} as const;

export type UserType = (typeof USERTYPE)[keyof typeof USERTYPE];
