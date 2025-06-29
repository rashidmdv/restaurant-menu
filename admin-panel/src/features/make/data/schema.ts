import { z } from 'zod'

// Define enums for vehicle types and statuses to match backend
export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  TRUCK = 'truck',
  COUPE = 'coupe'
}

export enum VehicleStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued',
  UPCOMING = 'upcoming',
  LIMITED = 'limited',
  PRODUCTION = 'production'
}

// Enum validation schemas with nullable support
export const vehicleTypeSchema = z.enum([
  VehicleType.SEDAN,
  VehicleType.SUV,
  VehicleType.HATCHBACK,
  VehicleType.TRUCK,
  VehicleType.COUPE
]).nullable().optional()

export const vehicleStatusSchema = z.enum([
  VehicleStatus.ACTIVE,
  VehicleStatus.DISCONTINUED,
  VehicleStatus.UPCOMING,
  VehicleStatus.LIMITED,
  VehicleStatus.PRODUCTION
]).nullable().optional()

// Main schema for vehicle makes - adjusted to handle API response
export const makeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  //makeId: z.string().uuid("Make ID must be a valid UUID"),
  //year: z.string().min(4, "Year should be at least 4 digits"),
  //fromDate: z.string().datetime().nullable().optional(),
  //toDate: z.string().datetime().nullable().optional(),
  //isDeleted: z.boolean().optional().default(false),
  isActive: z.boolean().default(true),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Fields for categorization - use type and status directly from API
  type: vehicleTypeSchema,
  status: vehicleStatusSchema,
  
  // Allow for complex typeInfo and statusInfo objects
  typeInfo: z.any().optional(),
  statusInfo: z.any().optional(),
  
  // Optional make object from the API
  // make: z.object({
  //   id: z.string(),
  //   name: z.string(),
  //   logo: z.string().optional(),
  //   description: z.string().optional(),
  //   isActive: z.boolean().optional(),
  //   createdAt: z.string().datetime().optional(),
  //   updatedAt: z.string().datetime().optional()
  // }).optional(),
  
  // Optional makeName from the API
 // makeName: z.string().optional()
})

// Type for make instance
export type VehicleMake = z.infer<typeof makeSchema>

// Schema for creating a new make
export const createMakeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  //year: z.string().min(4, "Year is required"),
  //makeId: z.string().uuid("Make ID is required and must be a valid UUID"),
  description: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  // fromDate: z.string().optional(),
   //toDate: z.string().optional(),
   //type: vehicleTypeSchema,
   //status: vehicleStatusSchema,
})

// Type for creating a new make
export type CreateVehicleMake = z.infer<typeof createMakeSchema>

// Schema for updating a make
export const updateMakeSchema = createMakeSchema.partial()

// Type for updating a make
export type UpdateVehicleMake = z.infer<typeof updateMakeSchema>