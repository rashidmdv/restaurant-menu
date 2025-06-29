
import { sub } from 'date-fns'
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
export const itemSchema = z.object({
  id: z.string().uuid("Item ID must be a valid UUID"),
  name: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  stockQuantity: z.union([z.string(), z.number()])
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, "Stock must be a valid number"),

  price: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Price must be a valid number"),

  specifications: z.object({
    material: z.string().min(1, "Material is required"),
    position: z.string().min(1, "Position is required"),
    warranty: z.string().min(1, "Warranty is required"),
  }).optional(),
  images: z.string().optional(),
  isActive: z.boolean().default(true),
  subCategoryId: z.string().uuid("Subcategory ID must be a valid UUID"),
  brandId: z.string().uuid("Brand ID must be a valid UUID"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  // Optional subcategory and brand object from the API

    subCategory: z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
    }).optional(),  

    brand: z.object({
      id: z.string(),
      name: z.string(),
      logo: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      
    }).optional(),

   subcategoryName: z.string().optional(),
   brandName: z.string().optional(),
})

// Type for model instance
export type CatalogItem = z.infer<typeof itemSchema>

// Schema for creating a new model
export const createItemSchema = z.object({
  id: z.string().uuid("Item ID must be a valid UUID"),
  name: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(0, "Price is required"),
  stockQuantity: z.string().min(0, "Stock is required"),
  specifications: z.object({
    material: z.string().min(1, "Material is required"),
    position: z.string().min(1, "Position is required"),
    warranty: z.string().min(1, "Warranty is required"),
  }).optional(),
  images: z.string().optional(),
  isActive: z.boolean().default(true),
  subCategoryId: z.string().uuid("Subcategory ID must be a valid UUID"),
  brandId: z.string().uuid("Brand ID must be a valid UUID"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

// Type for creating a new model
export type CreateCatalogItem = z.infer<typeof createItemSchema>

// Schema for updating a model
export const updateItemSchema = createItemSchema.partial()

// Type for updating a model
export type UpdateCatalogItem = z.infer<typeof updateItemSchema>