import { API } from '@/lib/api';

// Types for API request/response based on backend Item entity
export interface Item {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  image_url?: string;
  sub_category_id: number;
  display_order: number;
  available: boolean;
  featured: boolean;
  allergens?: string;
  preparation_time?: number;
  calories?: number;
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
}

export interface ItemFilters {
  sub_category_id?: number;
  category_id?: number;
  available?: boolean;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
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
  image_url?: string;
  sub_category_id: number;
  display_order?: number;
  available?: boolean;
  featured?: boolean;
  allergens?: string;
  preparation_time?: number;
  calories?: number;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  sub_category_id?: number;
  display_order?: number;
  available?: boolean;
  featured?: boolean;
  allergens?: string;
  preparation_time?: number;
  calories?: number;
}

// Item Service - matching backend API endpoints
export const ItemService = {
  getItems: async (filters?: ItemFilters): Promise<Item[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<Item[]>('/api/v1/items', {
      params: cleanedFilters,
    });
    return response.data;
  },

  getItemById: async (id: string): Promise<Item> => {
    const response = await API.get<Item>(`/api/v1/items/${id}`);
    return response.data;
  },

  getFeaturedItems: async (): Promise<Item[]> => {
    const response = await API.get<Item[]>('/api/v1/items/featured');
    return response.data;
  },

  searchItems: async (query: string, filters?: ItemFilters): Promise<Item[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<Item[]>('/api/v1/items/search', {
      params: { q: query, ...cleanedFilters },
    });
    return response.data;
  },

  createItem: async (item: CreateItemDto): Promise<Item> => {
    return (await API.post<Item>('/api/v1/items', item)).data;
  },

  updateItem: async (id: string, item: UpdateItemDto): Promise<Item> => {
    const response = await API.put<Item>(`/api/v1/items/${id}`, item);
    return response.data;
  },

  deleteItem: async (id: string): Promise<void> => {
    await API.delete(`/api/v1/items/${id}`);
  },

  toggleItemAvailable: async (id: string): Promise<Item> => {
    const response = await API.patch<Item>(`/api/v1/items/${id}/toggle`);
    return response.data;
  },

  updateDisplayOrder: async (id: string, displayOrder: number): Promise<Item> => {
    const response = await API.patch<Item>(`/api/v1/items/${id}/order`, {
      display_order: displayOrder
    });
    return response.data;
  },

  updatePrice: async (id: string, price: number): Promise<Item> => {
    const response = await API.patch<Item>(`/api/v1/items/${id}/price`, {
      price: price
    });
    return response.data;
  },

  uploadItemImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await API.post('/api/v1/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // Get subcategories for item creation
  getSubCategories: async (): Promise<SubCategory[]> => {
    const response = await API.get<SubCategory[]>('/api/v1/subcategories');
    return response.data;
  },
};