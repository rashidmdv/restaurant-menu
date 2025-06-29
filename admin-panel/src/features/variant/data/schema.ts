import { z } from 'zod'

// Define enums for vehicle types and statuses to match backend
export enum VehicleType {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  TRUCK = 'truck',
  COUPE = 'coupe'
}



// Enum validation schemas with nullable support
export const vehicleTypeSchema = z.enum([
  VehicleType.SEDAN,
  VehicleType.SUV,
  VehicleType.HATCHBACK,
  VehicleType.TRUCK,
  VehicleType.COUPE
]).nullable().optional()



// Main schema for vehicle variant - adjusted to handle API response
export const variantSchema = z.object({
  id: z.string().uuid("Variant ID must be a valid UUID"),
  name: z.string().min(1, "Variant name is required"),
  engineType: z.string().min(1, "Engine type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Fields for categorization - use type and status directly from API
  type: vehicleTypeSchema,
  
  // Allow for complex typeInfo and statusInfo objects
  typeInfo: z.any().optional(),
 
  
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
  
  // // Optional makeName from the API
  // makeName: z.string().optional()
})

// Type for model instance
export type VehicleVariant = z.infer<typeof variantSchema>

// Schema for creating a new model
export const createVariantSchema = z.object({
  id: z.string().uuid("Variant ID must be a valid UUID"),
  name: z.string().min(1, "Variant name is required"),
  engineType: z.string().min(1, "Engine type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  modelId: z.string().uuid("Model ID must be a valid UUID"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

// Type for creating a new model
export type CreateVehicleVariant = z.infer<typeof createVariantSchema>

// Schema for updating a model
export const updateVariantSchema = createVariantSchema.partial()

// Type for updating a model
export type UpdateVehicleVariant = z.infer<typeof updateVariantSchema>