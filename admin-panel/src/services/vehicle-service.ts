import { API } from '@/lib/api';
import { VehicleModel, VehicleType, VehicleStatus } from '@/features/model/data/schema';

// Types for API request/response
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

export interface VehicleModelFilters {
  makeId?: string;
  isActive?: boolean;
  type?: VehicleType;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any; // Allow for additional filter properties
}

// Create/Update DTOs
export type CreateVehicleModelDto = Omit<VehicleModel, 'id' | 'createdAt' | 'updatedAt' | 'make' | 'typeInfo' | 'statusInfo' | 'makeName'>;
export type UpdateVehicleModelDto = Partial<CreateVehicleModelDto>;

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: VehicleModelFilters): Record<string, any> {
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
  // Models API
  getModels: async (filters?: VehicleModelFilters): Promise<PaginatedResponse<VehicleModel>> => {
    // Clean filters and ensure defaults
    const cleanedFilters = cleanFilters(filters);
    
    // Ensure pagination defaults
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;
    
    const response = await API.get<PaginatedResponse<VehicleModel>>('/vehicle-models', { 
      params: cleanedFilters
    });
    return response.data;
  },

  getModelById: async (id: string): Promise<VehicleModel> => {
    const response = await API.get<VehicleModel>(`/vehicle-models/${id}`);
    return response.data;
  },

  getRecentModels: async (limit: number = 5): Promise<VehicleModel[]> => {
    const response = await API.get<VehicleModel[]>('/vehicle-models/recent', {
      params: { limit }
    });
    return response.data;
  },

  createModel: async (model: CreateVehicleModelDto): Promise<VehicleModel> => {
    // Format dates properly if they're provided as strings
    const formattedModel = {
      ...model,
      fromDate: model.fromDate ? new Date(model.fromDate).toISOString() : undefined,
      toDate: model.toDate ? new Date(model.toDate).toISOString() : undefined,
    };
    
    const response = await API.post<VehicleModel>('/vehicle-models', formattedModel);
    return response.data;
  },

  updateModel: async (id: string, model: UpdateVehicleModelDto): Promise<VehicleModel> => {
    // Format dates properly if they're provided as strings
    const formattedModel = {
      ...model,
      fromDate: model.fromDate ? new Date(model.fromDate).toISOString() : undefined,
      toDate: model.toDate ? new Date(model.toDate).toISOString() : undefined,
    };
    
    const response = await API.patch<VehicleModel>(`/vehicle-models/${id}`, formattedModel);
    return response.data;
  },

  deleteModel: async (id: string): Promise<void> => {
    await API.delete(`/vehicle-models/${id}`);
  },

  // Makes API
  getMakes: async (): Promise<VehicleMake[]> => {
    const response = await API.get<VehicleMake[]>('/vehicle-makes');
    return response.data;
  },
  
  // CSV Import
  importModels: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    
    await API.post('/vehicle-models/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};