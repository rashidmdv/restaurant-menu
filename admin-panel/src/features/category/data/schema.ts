import { z } from 'zod'

// Main schema for restaurant categories - matching backend Category entity
export const categorySchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().default(""),
  slug: z.string(),
  display_order: z.number().default(0),
  active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  sub_categories: z.array(z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    display_order: z.number(),
    active: z.boolean(),
  })).optional(),
})

// Type for category instance
export type Category = z.infer<typeof categorySchema>

// Schema for creating a new category
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  display_order: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

// Type for creating a new category
export type CreateCategory = z.infer<typeof createCategorySchema>

// Schema for updating a category
export const updateCategorySchema = createCategorySchema.partial()

// Type for updating a category
export type UpdateCategory = z.infer<typeof updateCategorySchema>