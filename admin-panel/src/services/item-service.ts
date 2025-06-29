import { API } from '@/lib/api';

// Types for API request/response based on backend Item entity
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  dietary_info: Record<string, any>;
  image_url?: string;
  sub_category_id: number;
  available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  sub_category?: {
    id: number;
    name: string;
    slug: string;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
  };
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

export interface ItemFilters {
  sub_category_id?: number;
  category_id?: number;
  available?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_dir?: string;
  include_count?: boolean;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: ItemFilters): Record<string, any> {
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
export interface CreateItemDto {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  dietary_info?: Record<string, any>;
  image_url?: string;
  sub_category_id: number;
  display_order?: number;
  available?: boolean;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  dietary_info?: Record<string, any>;
  image_url?: string;
  sub_category_id?: number;
  display_order?: number;
  available?: boolean;
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

// Item Service - matching backend API endpoints
export const ItemService = {
  getItems: async (filters?: ItemFilters): Promise<Item[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<BackendResponse<Item[]>>('/api/v1/items', {
      params: cleanedFilters,
    });
    return response.data.data;
  },

  getItemsPaginated: async (filters?: ItemFilters): Promise<PaginatedResponse<Item>> => {
    const cleanedFilters = cleanFilters({
      ...filters,
      include_count: true, // Always include count for pagination
    });
    const response = await API.get<BackendResponse<Item[]>>('/api/v1/items', {
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

  getItemById: async (id: string): Promise<Item> => {
    const response = await API.get<BackendResponse<Item>>(`/api/v1/items/${id}`);
    return response.data.data;
  },

  getFeaturedItems: async (): Promise<Item[]> => {
    const response = await API.get<BackendResponse<Item[]>>('/api/v1/items/featured');
    return response.data.data;
  },

  searchItems: async (query: string, filters?: ItemFilters): Promise<Item[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<BackendResponse<Item[]>>('/api/v1/items/search', {
      params: { search: query, ...cleanedFilters },
    });
    return response.data.data;
  },

  createItem: async (item: CreateItemDto): Promise<Item> => {
    const response = await API.post<BackendResponse<Item>>('/api/v1/items', item);
    return response.data.data;
  },

  updateItem: async (id: string, item: UpdateItemDto): Promise<Item> => {
    const response = await API.put<BackendResponse<Item>>(`/api/v1/items/${id}`, item);
    return response.data.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await API.delete(`/api/v1/items/${id}`);
  },

  toggleItemAvailable: async (id: string): Promise<Item> => {
    const response = await API.patch<BackendResponse<Item>>(`/api/v1/items/${id}/toggle`);
    return response.data.data;
  },

  updateDisplayOrder: async (id: string, displayOrder: number): Promise<Item> => {
    const response = await API.patch<BackendResponse<Item>>(`/api/v1/items/${id}/order`, {
      display_order: displayOrder
    });
    return response.data.data;
  },

  updatePrice: async (id: string, price: number): Promise<Item> => {
    const response = await API.patch<BackendResponse<Item>>(`/api/v1/items/${id}/price`, {
      price: price
    });
    return response.data.data;
  },

  uploadItemImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post<BackendResponse<{ url: string }>>('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data;
  },

  // Get subcategories for item creation
  getSubCategories: async (): Promise<SubCategory[]> => {
    const response = await API.get<BackendResponse<SubCategory[]>>('/api/v1/subcategories');
    return response.data.data;
  },
};

// Export backward compatibility for existing imports
export const CatalogService = ItemService;