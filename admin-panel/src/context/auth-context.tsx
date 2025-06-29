import { createContext, useContext, ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { API } from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { User } from '@/types/auth';

// Auth context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const { user, isLoading, isAuthenticated } = useAuthStatus();
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await API.post<{ accessToken: string }>('/auth/login', { email, password });
      const { accessToken } = response.data;
      
      if (accessToken) {
        auth.setAccessToken(accessToken);
        return true;
      }
      
      return false;
    } catch (_error) {
      toast.error('Login failed. Please check your credentials.');
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    auth.reset();
    navigate({ to: '/sign-in' });
  };
  
  // Create context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}