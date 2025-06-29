import { API } from '@/lib/api';

// Types for API request/response based on backend SubCategory entity
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
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  display_order: number;
  active: boolean;
}

export interface SubCategoryFilters {
  category_id?: number;
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
function cleanFilters(filters?: SubCategoryFilters): Record<string, any> {
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
export interface CreateSubCategoryDto {
  name: string;
  description?: string;
  category_id: number;
  display_order?: number;
  active?: boolean;
}

export interface UpdateSubCategoryDto {
  name?: string;
  description?: string;
  category_id?: number;
  display_order?: number;
  active?: boolean;
}

// SubCategory Service - matching backend API endpoints
export const SubCategoryService = {
  getSubCategories: async (filters?: SubCategoryFilters): Promise<SubCategory[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<SubCategory[]>('/api/v1/subcategories', {
      params: cleanedFilters,
    });
    return response.data;
  },

  getSubCategoryById: async (id: string): Promise<SubCategory> => {
    const response = await API.get<SubCategory>(`/api/v1/subcategories/${id}`);
    return response.data;
  },

  createSubCategory: async (subCategory: CreateSubCategoryDto): Promise<SubCategory> => {
    return (await API.post<SubCategory>('/api/v1/subcategories', subCategory)).data;
  },

  updateSubCategory: async (id: string, subCategory: UpdateSubCategoryDto): Promise<SubCategory> => {
    const response = await API.put<SubCategory>(`/api/v1/subcategories/${id}`, subCategory);
    return response.data;
  },

  deleteSubCategory: async (id: string): Promise<void> => {
    await API.delete(`/api/v1/subcategories/${id}`);
  },

  toggleSubCategoryActive: async (id: string): Promise<SubCategory> => {
    const response = await API.patch<SubCategory>(`/api/v1/subcategories/${id}/toggle`);
    return response.data;
  },

  updateDisplayOrder: async (id: string, displayOrder: number): Promise<SubCategory> => {
    const response = await API.patch<SubCategory>(`/api/v1/subcategories/${id}/order`, {
      display_order: displayOrder
    });
    return response.data;
  },

  // Get categories for subcategory creation
  getCategories: async (): Promise<Category[]> => {
    const response = await API.get<Category[]>('/api/v1/categories');
    return response.data;
  },
};
