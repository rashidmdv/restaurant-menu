import { API } from '@/lib/api';
import { CatalogBrand, VehicleType, VehicleStatus } from '@/features/brands/data/schema';

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

export interface CatalogBrandFilters {
  brandId?: string;
  isActive?: boolean;
  type?: VehicleType;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: CatalogBrandFilters): Record<string, any> {
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
export type CreateCatalogBrandDto = Omit<CatalogBrand, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCatalogBrandDto = Partial<CreateCatalogBrandDto>;

// Service
export const CatalogService = {
  getBrands: async (filters?: CatalogBrandFilters): Promise<PaginatedResponse<CatalogBrand>> => {
    const cleanedFilters = cleanFilters(filters);
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;

    const response = await API.get<PaginatedResponse<CatalogBrand>>('/catalog-brands', {
      params: cleanedFilters,
    });
    return response.data;
  },

  getBrandById: async (id: string): Promise<CatalogBrand> => {
    const response = await API.get<CatalogBrand>(`/catalog-brands/${id}`);
    return response.data;
  },

  getRecentBrands: async (limit: number = 5): Promise<CatalogBrand[]> => {
    const response = await API.get<CatalogBrand[]>('/catalog-brands/recent', {
      params: { limit },
    });
    return response.data;
  },

  createBrand: async (brand: CreateCatalogBrandDto): Promise<CatalogBrand> => {
  return (await API.post<CatalogBrand>('/catalog-brands', brand)).data
},

  updateBrand: async (id: string, brand: UpdateCatalogBrandDto): Promise<CatalogBrand> => {
    const response = await API.patch<CatalogBrand>(`/catalog-brands/${id}`, brand);
    return response.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await API.delete(`/catalog-brands/${id}`);
  },

  uploadBrandLogo: async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await API.post('/uploads/catalog-brands', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
},

  importBrands: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await API.post('/catalog-brands/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
};
