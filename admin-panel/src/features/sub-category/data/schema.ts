import { ca } from 'date-fns/locale'
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

// Main schema for vehicle sub-categories - adjusted to handle API response
export const subcategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  categoryId: z.string().min(1, "Category ID is required"),


// Optional make object from the API
  category: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional()
  }).optional(),

  // Optional categoryName from the API
  categoryName: z.string().optional()
})
 


// Type for category instance
export type CatalogSubCategory = z.infer<typeof subcategorySchema>

// Schema for creating a new sub-category
export const createSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  isActive: z.boolean().optional().default(true),
  

})

// Type for creating a new sub-category
export type CreateCatalogSubCategory = z.infer<typeof createSubCategorySchema>

// Schema for updating a sub-category
export const updateSubCategorySchema = createSubCategorySchema.partial()

// Type for updating a sub-category
export type UpdateCatalogSubCategory = z.infer<typeof updateSubCategorySchema>