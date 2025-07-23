import { API } from '@/lib/api';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse, 
  User,
  AuthResponse 
} from '@/types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await API.post<{success: boolean, data: LoginResponse}>('/v1/auth/login', credentials);
    return response.data.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await API.get<{success: boolean, data: User}>('/v1/auth/me');
    return response.data.data;
  },
  
  refreshToken: async (refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await API.post<{success: boolean, data: RefreshTokenResponse}>('/v1/auth/refresh', refreshTokenData);
    return response.data.data;
  },
  
  logout: async (): Promise<void> => {
    try {
      await API.post('/v1/auth/logout');
    } catch (_error) {
      // Ignore errors on logout
    }
  },

  // Legacy method for backward compatibility
  loginLegacy: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const loginResponse = await AuthService.login(credentials);
    return {
      accessToken: loginResponse.access_token,
      refreshToken: loginResponse.refresh_token,
      user: loginResponse.user
    };
  }
};