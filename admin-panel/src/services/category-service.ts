import { API } from '@/lib/api';
import { CatalogSubCategory, VehicleType, VehicleStatus } from '@/features/category/data/schema';

// Types for API request/response
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface CatalogSubCategoryFilters {
  categoryId?: string;
  isActive?: boolean;
  type?: VehicleType;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: CatalogSubCategoryFilters): Record<string, any> {
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
export type CreateCatalogSubCategoryDto = Omit<CatalogSubCategory, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCatalogSubCategoryDto = Partial<CreateCatalogSubCategoryDto>;

// Catalog Sub-Category Service
export const CatalogService = {
  getCategories: async (filters?: CatalogSubCategoryFilters): Promise<PaginatedResponse<CatalogSubCategory>> => {
    const cleanedFilters = cleanFilters(filters);
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;

    const response = await API.get<PaginatedResponse<CatalogSubCategory>>('/catalog-categories', {
      params: cleanedFilters,
    });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<CatalogSubCategory> => {
    const response = await API.get<CatalogSubCategory>(`/catalog-categories/${id}`);
    return response.data;
  },

  getRecentCategories: async (limit: number = 5): Promise<CatalogSubCategory[]> => {
    const response = await API.get<CatalogSubCategory[]>('/catalog-categories/recent', {
      params: { limit },
    });
    return response.data;
  },

  createCategory: async (category: CreateCatalogSubCategoryDto): Promise<CatalogSubCategory> => {
  return (await API.post<CatalogSubCategory>('/catalog-categories', category)).data
},

  updateCategory: async (id: string, category: UpdateCatalogSubCategoryDto): Promise<CatalogSubCategory> => {
    const response = await API.patch<CatalogSubCategory>(`/catalog-categories/${id}`, category);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await API.delete(`/catalog-categories/${id}`);
  },

  uploadCategoryImage: async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await API.post('/uploads/catalog-categories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
},

  importCategories: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await API.post('/catalog-sub-categories/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
};
