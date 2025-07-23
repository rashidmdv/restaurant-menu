export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  avatar?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'moderator' | 'viewer';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

// Legacy interface for backward compatibility
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}