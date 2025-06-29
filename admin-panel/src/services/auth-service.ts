import { API } from '@/lib/api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

export const AuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await API.get<User>('/auth/me');
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    try {
      await API.post('/auth/logout');
    } catch (_error) {
      // Ignore errors on logout
    }
  },
};