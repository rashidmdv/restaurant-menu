import Cookies from 'js-cookie';
import { create } from 'zustand';

const ACCESS_TOKEN_KEY = 'access_token';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string[];
}

interface AuthState {
  auth: {
    accessToken: string;
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    setAccessToken: (accessToken: string) => void;
    refreshToken: () => Promise<boolean>;
    reset: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const savedToken = Cookies.get(ACCESS_TOKEN_KEY) || '';
  
  return {
    auth: {
      accessToken: savedToken,
      user: null,
      
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
        
      setAccessToken: (accessToken) => 
        set((state) => {
          // Store token in cookie
          Cookies.set(ACCESS_TOKEN_KEY, accessToken, { secure: true, sameSite: 'strict' });
          return { ...state, auth: { ...state.auth, accessToken } };
        }),
        
      refreshToken: async () => {
        try {
          // Implementation would depend on your API
          // This is a placeholder for the actual implementation
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies
          });
          
          if (response.ok) {
            const data = await response.json();
            get().auth.setAccessToken(data.accessToken);
            return true;
          }
          
          return false;
        } catch (_error) {
          return false;
        }
      },
      
      reset: () => 
        set((state) => {
          Cookies.remove(ACCESS_TOKEN_KEY);
          return { ...state, auth: { ...state.auth, accessToken: '', user: null } };
        }),
    },
  };
});