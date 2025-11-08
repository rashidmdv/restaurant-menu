import { API } from '@/lib/api';

// Types for API request/response based on backend Reservation entity
export interface Reservation {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  reservation_date: string; // YYYY-MM-DD format
  reservation_time: string; // HH:MM format
  number_of_guests: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ReservationFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
  order_by?: string;
  order_dir?: string;
  include_count?: boolean;
  [key: string]: any;
}

// Clean filters for API request (remove undefined values)
function cleanFilters(filters?: ReservationFilters): Record<string, any> {
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
export interface CreateReservationDto {
  full_name: string;
  email: string;
  phone: string;
  reservation_date: string;
  reservation_time: string;
  number_of_guests: number;
  special_requests?: string;
}

export interface UpdateReservationDto {
  full_name?: string;
  email?: string;
  phone?: string;
  reservation_date?: string;
  reservation_time?: string;
  number_of_guests?: number;
  special_requests?: string;
  status?: string;
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
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  total: number;
}

// Reservation Service - matching backend API endpoints
export const ReservationService = {
  getReservations: async (filters?: ReservationFilters): Promise<Reservation[]> => {
    const cleanedFilters = cleanFilters(filters);
    const response = await API.get<BackendResponse<{ reservations: Reservation[]; total: number }>>('/v1/reservations', {
      params: cleanedFilters,
    });
    return response.data.data.reservations;
  },

  getReservationsPaginated: async (filters?: ReservationFilters): Promise<PaginatedResponse<Reservation>> => {
    const cleanedFilters = cleanFilters({
      ...filters,
      include_count: true,
    });

    const response = await API.get<BackendResponse<{ reservations: Reservation[]; total: number; limit: number; offset: number }>>('/v1/reservations', {
      params: cleanedFilters,
    });

    const data = response.data.data;
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    const total = data.total || 0;
    const page = Math.floor(offset / limit) + 1;
    const total_pages = Math.ceil(total / limit);

    return {
      data: data.reservations || [],
      pagination: {
        has_next: offset + limit < total,
        has_prev: offset > 0,
        limit: limit,
        page: page,
        total: total,
        total_pages: total_pages,
      },
      total: total,
    };
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await API.get<BackendResponse<Reservation>>(`/v1/reservations/${id}`);
    return response.data.data;
  },

  createReservation: async (reservation: CreateReservationDto): Promise<Reservation> => {
    const response = await API.post<BackendResponse<Reservation>>('/v1/reservations', reservation);
    return response.data.data;
  },

  updateReservation: async (id: string, reservation: UpdateReservationDto): Promise<Reservation> => {
    const response = await API.put<BackendResponse<Reservation>>(`/v1/reservations/${id}`, reservation);
    return response.data.data;
  },

  deleteReservation: async (id: string): Promise<void> => {
    await API.delete(`/v1/reservations/${id}`);
  },

  updateReservationStatus: async (id: string, status: string): Promise<Reservation> => {
    const response = await API.patch<BackendResponse<Reservation>>(`/v1/reservations/${id}/status`, {
      status,
    });
    return response.data.data;
  },
};
