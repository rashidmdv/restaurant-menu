import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { API } from '@/lib/api';
import { User } from '@/types/auth';

export function useAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { auth } = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = !!auth.accessToken;
  
  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.accessToken) {
        try {
          setIsLoading(true);
          const response = await API.get<User>('/auth/me');
          setUser(response.data);
        } catch (_error) {
          // If fetching user fails, reset auth state
          auth.reset();
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [auth]);
  
  return {
    user,
    isLoading,
    isAuthenticated,
  };
}