import { API } from '@/lib/api';
import { VehicleVariant, VehicleType } from '@/features/variant/data/schema';

//Types for API request/response
export interface VehicleMake {
  id: string;
  name: string;
  country?: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface VehicleVariantFilters {
  modelId?: string;
  isActive?: boolean;
  type?: VehicleType;
  //status?: VehicleStatus;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any; // Allow for additional filter properties
}

// Create/Update DTOs
export type CreateVehicleVariantDto = Omit<VehicleVariant, 'id' | 'createdAt' | 'updatedAt' | 'model' | 'typeInfo' | 'statusInfo' | 'modelName'>;
export type UpdateVehicleVariantDto = Partial<CreateVehicleVariantDto>;

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: VehicleVariantFilters): Record<string, any> {
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

// Vehicle service API
export const VehicleService = {
  // Variants API
  getVariants: async (filters?: VehicleVariantFilters): Promise<PaginatedResponse<VehicleVariant>> => {
    // Clean filters and ensure defaults
    const cleanedFilters = cleanFilters(filters);
    
    // Ensure pagination defaults
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;
    
    const response = await API.get<PaginatedResponse<VehicleVariant>>('/vehicle-variants', { 
      params: cleanedFilters
    });
    return response.data;
  },

  getVariantById: async (id: string): Promise<VehicleVariant> => {
    const response = await API.get<VehicleVariant>(`/vehicle-variants/${id}`);
    return response.data;
  },

  getRecentVariants: async (limit: number = 5): Promise<VehicleVariant[]> => {
    const response = await API.get<VehicleVariant[]>('/vehicle-variants/recent', {
      params: { limit }
    });
    return response.data;
  },

  createVariant: async (variant: CreateVehicleVariantDto): Promise<VehicleVariant> => {
    // Format dates properly if they're provided as strings
    const formattedVariant = {
      ...variant,
      fromDate: variant.fromDate ? new Date(variant.fromDate).toISOString() : undefined,
      toDate: variant.toDate ? new Date(variant.toDate).toISOString() : undefined,
    };
    
    const response = await API.post<VehicleVariant>('/vehicle-variants', formattedVariant);
    return response.data;
  },

  updateVariant: async (id: string, variant: UpdateVehicleVariantDto): Promise<VehicleVariant> => {
    // Format dates properly if they're provided as strings
    const formattedVariant = {
      ...variant,
      fromDate: variant.fromDate ? new Date(variant.fromDate).toISOString() : undefined,
      toDate: variant.toDate ? new Date(variant.toDate).toISOString() : undefined,
    };
    
    const response = await API.patch<VehicleVariant>(`/vehicle-variants/${id}`, formattedVariant);
    return response.data;
  },

  deleteVariant: async (id: string): Promise<void> => {
    await API.delete(`/vehicle-variants/${id}`);
  },

  // Makes API
  getMakes: async (): Promise<VehicleMake[]> => {
    const response = await API.get<VehicleMake[]>('/vehicle-models');
    return response.data;
  },
  
  // CSV Import
  importVariants: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await API.post('/vehicle-variants/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};