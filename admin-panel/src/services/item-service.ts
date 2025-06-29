import { API } from '@/lib/api';
import { CatalogItem } from '@/features/Items/data/schema';

//Types for API request/response


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

export interface  CatalogSubCategory {
  id: string;
  name: string;
  description?: string;
  image?: string
  isActive?: boolean;
  categoryId?: string;
}

export interface CatalogBrand {
  id: string; 
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogItemFilters {
  itemId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any; // Allow for additional filter properties
}

// Create/Update DTOs
export type CreateCatalogItemDto = Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt' | 'model' | 'typeInfo' | 'statusInfo' | 'modelName'>;
export type UpdateCatalogItemDto = Partial<CreateCatalogItemDto>;

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: CatalogItemFilters): Record<string, any> {
  if (!filters) return {};
  
  const cleanedFilters: Record<string, any> = {};
  
  // Only include defined values
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleanedFilters[key] = value;
    }
  });
  
  return cleanedFilters;
}

// Catalog service API
export const CatalogService = {
  // Items API
  getItems: async (filters?: CatalogItemFilters): Promise<PaginatedResponse<CatalogItem>> => {
    // Clean filters and ensure defaults
    const cleanedFilters = cleanFilters(filters);
    
    // Ensure pagination defaults
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;
    
    const response = await API.get<PaginatedResponse<CatalogItem>>('/catalog-items', { 
      params: cleanedFilters
    });
    return response.data;
  },

  getItemById: async (id: string): Promise<CatalogItem> => {
    const response = await API.get<CatalogItem>(`/catalog-items/${id}`);
    return response.data;
  },

  getRecentItems: async (limit: number = 5): Promise<CatalogItem[]> => {
    const response = await API.get<CatalogItem[]>('/catalog-items/recent', {
      params: { limit }
    });
    return response.data;
  },

  createItem: async (Item: CreateCatalogItemDto): Promise<CatalogItem> => {
    // Format dates properly if they're provided as strings
    const formattedItem = {
      ...Item,
      fromDate: Item.fromDate ? new Date(Item.fromDate).toISOString() : undefined,
      toDate: Item.toDate ? new Date(Item.toDate).toISOString() : undefined,
    };
    
    const response = await API.post<CatalogItem>('/catalog-items', formattedItem);
    return response.data;
  },

  updateItem: async (id: string, Item: UpdateCatalogItemDto): Promise<CatalogItem> => {
    // Format dates properly if they're provided as strings
    const formattedItem = {
      ...Item,
      fromDate: Item.fromDate ? new Date(Item.fromDate).toISOString() : undefined,
      toDate: Item.toDate ? new Date(Item.toDate).toISOString() : undefined,
    };
    
    const response = await API.patch<CatalogItem>(`/catalog-items/${id}`, formattedItem);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await API.delete(`/catalog-items/${id}`);
  },

uploadItemImage: async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await API.post('/uploads/catalog-items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data; // should return { url: "https://..." }
},


  // subCategories API
  getSubCategories: async (): Promise<CatalogSubCategory[]> => {
    const response = await API.get<CatalogSubCategory[]>('/catalog-sub-categories');
    return response.data;
  },

  //brands API
    getBrands: async (): Promise<CatalogBrand[]> => {
        const response = await API.get<CatalogBrand[]>('/catalog-brands');
        return response.data;
    },

  
  // CSV Import
  importItems: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await API.post('/catalog-items/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};