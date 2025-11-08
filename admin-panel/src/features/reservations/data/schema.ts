import { z } from 'zod'

// Reservation status enum
export const reservationStatusEnum = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
])

export type ReservationStatus = z.infer<typeof reservationStatusEnum>

// Main reservation schema matching backend entity
export const reservationSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  reservation_date: z.string(), // ISO date string (YYYY-MM-DD)
  reservation_time: z.string(), // HH:MM format
  number_of_guests: z.number().int(),
  special_requests: z.string().optional().nullable(),
  status: reservationStatusEnum,
  created_at: z.string(),
  updated_at: z.string(),
})

export type Reservation = z.infer<typeof reservationSchema>

// Create reservation schema with validation
export const createReservationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(200, 'Full name must be less than 200 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number must be less than 20 characters'),
  reservation_date: z
    .string()
    .min(1, 'Please select a date')
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Please enter a valid date',
    }),
  reservation_time: z
    .string()
    .min(1, 'Please select a time')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  number_of_guests: z
    .number({
      required_error: 'Number of guests is required',
      invalid_type_error: 'Please enter a valid number',
    })
    .int('Number of guests must be a whole number')
    .min(1, 'At least 1 guest is required')
    .max(20, 'Maximum 20 guests allowed'),
  special_requests: z.string().max(1000, 'Special requests must be less than 1000 characters').optional(),
})

export type CreateReservation = z.infer<typeof createReservationSchema>

// Update reservation schema
export const updateReservationSchema = createReservationSchema
  .extend({
    status: reservationStatusEnum.optional(),
  })
  .partial()

export type UpdateReservation = z.infer<typeof updateReservationSchema>

// Filter schema
export const reservationFiltersSchema = z.object({
  status: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  order_by: z.string().optional(),
  order_dir: z.enum(['ASC', 'DESC']).optional(),
})

export type ReservationFilters = z.infer<typeof reservationFiltersSchema>

// Status options for select inputs
export const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Completed', value: 'completed'},
] as const

// Status badge colors
export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
} as const
