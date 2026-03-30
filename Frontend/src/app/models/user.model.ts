export interface User {
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type RoleName = 'Admin' | 'Manager' | 'Employee';

export const ROLE_MAP: Record<number, RoleName> = {
  1: 'Admin',
  2: 'Manager',
  3: 'Employee',
};
