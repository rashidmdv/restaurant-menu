import Cookies from 'js-cookie';
import { create } from 'zustand';
import { AuthService } from '@/services/auth-service';
import { User } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRES_KEY = 'token_expires';

interface AuthState {
  auth: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setTokens: (accessToken: string, refreshToken: string, expiresAt: string) => void;
    setUser: (user: User | null) => void;
    refreshTokens: () => Promise<boolean>;
    logout: () => Promise<void>;
    reset: () => void;
    checkTokenExpiry: () => boolean;
  };
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const savedAccessToken = Cookies.get(ACCESS_TOKEN_KEY) || '';
  const savedRefreshToken = Cookies.get(REFRESH_TOKEN_KEY) || '';
  const savedExpiresAt = Cookies.get(TOKEN_EXPIRES_KEY) || null;
  
  return {
    auth: {
      accessToken: savedAccessToken,
      refreshToken: savedRefreshToken,
      expiresAt: savedExpiresAt,
      user: null,
      isAuthenticated: !!savedAccessToken,
      
      setTokens: (accessToken, refreshToken, expiresAt) => 
        set((state) => {
          // Validate tokens before storing
          if (!accessToken || !refreshToken) {
            return state;
          }
          
          // Store tokens in cookies with secure settings
          const cookieOptions = { 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict' as const,
            expires: new Date(expiresAt)
          };
          
          Cookies.set(ACCESS_TOKEN_KEY, accessToken, cookieOptions);
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions);
          Cookies.set(TOKEN_EXPIRES_KEY, expiresAt, cookieOptions);
          
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken, 
              refreshToken, 
              expiresAt,
              isAuthenticated: true 
            } 
          };
        }),
      
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
        
      checkTokenExpiry: () => {
        const { expiresAt } = get().auth;
        if (!expiresAt) return false;
        
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // Return true if token expires in less than 5 minutes
        return (expiry - now) < fiveMinutes;
      },
        
      refreshTokens: async () => {
        try {
          const { refreshToken: currentRefreshToken } = get().auth;
          
          if (!currentRefreshToken) {
            return false;
          }
          
          const response = await AuthService.refreshToken({ 
            refresh_token: currentRefreshToken 
          });
          
          get().auth.setTokens(
            response.access_token, 
            response.refresh_token, 
            response.expires_at
          );
          
          return true;
        } catch (_error) {
          get().auth.reset();
          return false;
        }
      },
      
      logout: async () => {
        try {
          await AuthService.logout();
        } catch (_error) {
          // Ignore logout errors
        } finally {
          get().auth.reset();
        }
      },
      
      reset: () => 
        set((state) => {
          Cookies.remove(ACCESS_TOKEN_KEY);
          Cookies.remove(REFRESH_TOKEN_KEY);
          Cookies.remove(TOKEN_EXPIRES_KEY);
          return { 
            ...state, 
            auth: { 
              ...state.auth, 
              accessToken: '', 
              refreshToken: '',
              expiresAt: null,
              user: null,
              isAuthenticated: false 
            } 
          };
        }),
    },
  };
});

