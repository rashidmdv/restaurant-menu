import { API } from '@/lib/api';
import { VehicleMake, VehicleType, VehicleStatus } from '@/features/make/data/schema';

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

export interface VehicleMakeFilters {
  makeId?: string;
  isActive?: boolean;
  type?: VehicleType;
  status?: VehicleStatus;
  page?: number;
  limit?: number;
  name?: string;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: VehicleMakeFilters): Record<string, any> {
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
export type CreateVehicleMakeDto = Omit<VehicleMake, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVehicleMakeDto = Partial<CreateVehicleMakeDto>;

// Service
export const VehicleService = {
  getMakes: async (filters?: VehicleMakeFilters): Promise<PaginatedResponse<VehicleMake>> => {
    const cleanedFilters = cleanFilters(filters);
    if (!cleanedFilters.page) cleanedFilters.page = 1;
    if (!cleanedFilters.limit) cleanedFilters.limit = 10;

    const response = await API.get<PaginatedResponse<VehicleMake>>('/vehicle-makes', {
      params: cleanedFilters,
    });
    return response.data;
  },

  getMakeById: async (id: string): Promise<VehicleMake> => {
    const response = await API.get<VehicleMake>(`/vehicle-makes/${id}`);
    return response.data;
  },

  getRecentMakes: async (limit: number = 5): Promise<VehicleMake[]> => {
    const response = await API.get<VehicleMake[]>('/vehicle-makes/recent', {
      params: { limit },
    });
    return response.data;
  },

  createMake: async (make: CreateVehicleMakeDto): Promise<VehicleMake> => {
  return (await API.post<VehicleMake>('/vehicle-makes', make)).data
},

  updateMake: async (id: string, make: UpdateVehicleMakeDto): Promise<VehicleMake> => {
    const response = await API.patch<VehicleMake>(`/vehicle-makes/${id}`, make);
    return response.data;
  },

  deleteMake: async (id: string): Promise<void> => {
    await API.delete(`/vehicle-makes/${id}`);
  },

  uploadMakeLogo: async (file: File): Promise<{ url: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await API.post('/uploads/vehicle-makes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
},

  importMakes: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await API.post('/vehicle-makes/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
};
