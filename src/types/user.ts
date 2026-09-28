export type UserRole = 'user' | 'admin';

export interface User {
  uid: string;
  id: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  isAnonymous?: boolean;
}
