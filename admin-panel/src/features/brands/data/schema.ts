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

// Main schema for catalog brands - adjusted to handle API response
export const brandSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
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
  

})

// Type for brand instance
export type CatalogBrand = z.infer<typeof brandSchema>

// Schema for creating a new brand
export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})

// Type for creating a new brand
export type CreateCatalogBrand = z.infer<typeof createBrandSchema>

// Schema for updating a brand
export const updateBrandSchema = createBrandSchema.partial()

// Type for updating a brand
export type UpdateCatalogBrand = z.infer<typeof updateBrandSchema>