import { API } from '@/lib/api';

// Types for API request/response based on backend Category entity
export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  sub_categories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  category_id: number;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFilters {
  active?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_dir?: string;
  include_count?: boolean;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: CategoryFilters): Record<string, any> {
  if (!filters) return {};
  const cleanedFilters: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanedFilters[key] = value;
    }
  });
  return cleanedFilters;
}

// DTOs
export interface CreateCategoryDto {
  name: string;
  description?: string;
  display_order?: number;
  active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  display_order?: number;
  active?: boolean;
}

// Backend response wrapper
interface BackendResponse<T> {
  success: boolean;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
  };
}

// Category Service - matching backend API endpoints
export const CategoryService = {
  getCategories: async (filters?: CategoryFilters): Promise<Category[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<BackendResponse<Category[]>>('/api/v1/categories', {
      params: cleanedFilters,
    });
    return response.data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await API.get<BackendResponse<Category>>(`/api/v1/categories/${id}`);
    return response.data.data;
  },

  getCategoryWithSubCategories: async (id: string): Promise<Category> => {
    const response = await API.get<BackendResponse<Category>>(`/api/v1/categories/${id}`, {
      params: { include_subcategories: true }
    });
    return response.data.data;
  },

  createCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const response = await API.post<BackendResponse<Category>>('/api/v1/categories', category);
    return response.data.data;
  },

  updateCategory: async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    const response = await API.put<BackendResponse<Category>>(`/api/v1/categories/${id}`, category);
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await API.delete(`/api/v1/categories/${id}`);
  },

  toggleCategoryActive: async (id: string): Promise<Category> => {
    const response = await API.patch<BackendResponse<Category>>(`/api/v1/categories/${id}/toggle`);
    return response.data.data;
  },

  updateDisplayOrder: async (id: string, displayOrder: number): Promise<Category> => {
    const response = await API.patch<BackendResponse<Category>>(`/api/v1/categories/${id}/order`, {
      display_order: displayOrder
    });
    return response.data.data;
  },

  uploadCategoryImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post<BackendResponse<{ url: string }>>('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },
};
