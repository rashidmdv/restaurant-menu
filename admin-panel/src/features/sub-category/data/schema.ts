import { z } from 'zod'

// Main schema for restaurant sub-categories - matching backend SubCategory entity
export const subCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().default(""),
  slug: z.string(),
  category_id: z.number(),
  display_order: z.number().default(0),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
})

// Type for sub-category instance
export type SubCategory = z.infer<typeof subCategorySchema>

// Schema for creating a new sub-category
export const createSubCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  category_id: z.number(),
  display_order: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

// Type for creating a new sub-category
export type CreateSubCategory = z.infer<typeof createSubCategorySchema>

// Schema for updating a sub-category
export const updateSubCategorySchema = createSubCategorySchema.partial()

// Type for updating a sub-category
export type UpdateSubCategory = z.infer<typeof updateSubCategorySchema>