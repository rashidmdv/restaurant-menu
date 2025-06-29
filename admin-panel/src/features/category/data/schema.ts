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

// Main schema for vehicle categories - adjusted to handle API response
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  type: z.string().min(1, "Type is required"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  typeInfo: z.any().optional(),
  statusInfo: z.any().optional(),
  

})

// Type for category instance
export type CatalogCategory = z.infer<typeof categorySchema>

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  isActive: z.boolean().optional().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

})

// Type for creating a new category
export type CreateCatalogCategory = z.infer<typeof createCategorySchema>

// Schema for updating a category
export const updateCategorySchema = createCategorySchema.partial()

// Type for updating a category
export type UpdateCatalogCategory = z.infer<typeof updateCategorySchema>