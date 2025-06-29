import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get auth store
    const { auth } = useAuthStore.getState();
    const token = auth.accessToken;
    
    // Add authorization header if token exists
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if not refreshing already
      if (originalRequest && originalRequest.url?.includes('/auth/refresh')) {
        // Logout user if refresh token fails
        useAuthStore.getState().auth.reset();
        return Promise.reject(error);
      }
      
      // Mark request as retried
      originalRequest._retry = true;
      
      try {
        // Try to refresh token (implement this function in authStore)
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Get new token
          const token = useAuthStore.getState().auth.accessToken;
          
          // Update auth header
          if (token && originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          
          // Retry original request with new token
          return api(originalRequest);
        }
      } catch (_refreshError) {
        // If refresh fails, logout and redirect to login
        useAuthStore.getState().auth.reset();
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Function to refresh the token
const refreshToken = async (): Promise<boolean> => {
  try {
    // Implement your refresh token logic here
    // For example:
    // const response = await axios.post(`${API_BASE_URL}/auth/refresh`);
    // if (response.data.accessToken) {
    //   useAuthStore.getState().auth.setAccessToken(response.data.accessToken);
    //   return true;
    // }
    return false;
  } catch (_error) {
    return false;
  }
};

// Wrapper around axios for type safety
export const API = {
  /**
   * GET request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with response data
   */
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.get<T>(url, config);
  },
  
  /**
   * POST request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response data
   */
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.post<T>(url, data, config);
  },
  
  /**
   * PUT request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response data
   */
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.put<T>(url, data, config);
  },
  
  /**
   * PATCH request
   * @param url - API endpoint
   * @param data - Request body
   * @param config - Axios request config
   * @returns Promise with response data
   */
  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.patch<T>(url, data, config);
  },
  
  /**
   * DELETE request
   * @param url - API endpoint
   * @param config - Axios request config
   * @returns Promise with response data
   */
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return api.delete<T>(url, config);
  },
};

export default api;