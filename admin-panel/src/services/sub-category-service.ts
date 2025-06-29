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
  items?: Item[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  slug: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: number;
  name: string;
  slug: string;
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

// Pagination interface matching backend
export interface Pagination {
  has_next: boolean;
  has_prev: boolean;
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

// Backend response wrapper
interface BackendResponse<T> {
  success: boolean;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
    pagination?: Pagination;
    total?: number;
  };
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  total: number;
}

// SubCategory Service - matching backend API endpoints
export const SubCategoryService = {
  getSubCategories: async (filters?: SubCategoryFilters): Promise<SubCategory[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<BackendResponse<SubCategory[]>>('/api/v1/subcategories', {
      params: cleanedFilters,
    });
    return response.data.data;
  },

  getSubCategoriesPaginated: async (filters?: SubCategoryFilters): Promise<PaginatedResponse<SubCategory>> => {
    const cleanedFilters = cleanFilters({
      ...filters,
      include_count: true, // Always include count for pagination
    });
    const response = await API.get<BackendResponse<SubCategory[]>>('/api/v1/subcategories', {
      params: cleanedFilters,
    });
    
    return {
      data: response.data.data,
      pagination: response.data.meta.pagination || {
        has_next: false,
        has_prev: false,
        limit: cleanedFilters.limit || 10,
        page: Math.floor((cleanedFilters.offset || 0) / (cleanedFilters.limit || 10)) + 1,
        total: response.data.data.length,
        total_pages: 1
      },
      total: response.data.meta.pagination?.total || response.data.data.length
    };
  },

  getSubCategoryById: async (id: string): Promise<SubCategory> => {
    const response = await API.get<BackendResponse<SubCategory>>(`/api/v1/subcategories/${id}`);
    return response.data.data;
  },

  getSubCategoryWithItems: async (id: string): Promise<SubCategory> => {
    const response = await API.get<BackendResponse<SubCategory>>(`/api/v1/subcategories/${id}`, {
      params: { include_items: true }
    });
    return response.data.data;
  },

  createSubCategory: async (subCategory: CreateSubCategoryDto): Promise<SubCategory> => {
    const response = await API.post<BackendResponse<SubCategory>>('/api/v1/subcategories', subCategory);
    return response.data.data;
  },

  updateSubCategory: async (id: string, subCategory: UpdateSubCategoryDto): Promise<SubCategory> => {
    const response = await API.put<BackendResponse<SubCategory>>(`/api/v1/subcategories/${id}`, subCategory);
    return response.data.data;
  },

  deleteSubCategory: async (id: string): Promise<void> => {
    await API.delete(`/api/v1/subcategories/${id}`);
  },

  toggleSubCategoryActive: async (id: string): Promise<SubCategory> => {
    const response = await API.patch<BackendResponse<SubCategory>>(`/api/v1/subcategories/${id}/toggle-active`);
    return response.data.data;
  },

  updateDisplayOrder: async (id: string, displayOrder: number): Promise<SubCategory> => {
    const response = await API.patch<BackendResponse<SubCategory>>(`/api/v1/subcategories/${id}/display-order`, {
      display_order: displayOrder
    });
    return response.data.data;
  },

  // Get categories for subcategory creation
  getCategories: async (): Promise<Category[]> => {
    const response = await API.get<BackendResponse<Category[]>>('/api/v1/categories');
    return response.data.data;
  },

  uploadSubCategoryImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post<BackendResponse<{ url: string }>>('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },
};
