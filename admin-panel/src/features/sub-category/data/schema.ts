import { z } from 'zod'

// Main schema for restaurant sub-categories - matching backend SubCategory entity
export const subCategorySchema = z.object({
  id: z.number(),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z.string().default(""),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  category_id: z.number()
    .int("Category ID must be a whole number")
    .positive("Category ID must be positive"),
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .default(0),
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
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .refine((val) => /^[a-zA-Z0-9\s\-&'.,!]+$/.test(val), {
      message: "Name can only contain letters, numbers, spaces, and basic punctuation",
    })
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be only whitespace",
    }),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  category_id: z.number()
    .int("Category ID must be a whole number")
    .positive("Please select a valid category"),
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .max(999, "Display order cannot exceed 999")
    .optional()
    .default(0),
  active: z.boolean().optional().default(true),
})

// Type for creating a new sub-category
export type CreateSubCategory = z.infer<typeof createSubCategorySchema>

// Schema for updating a sub-category
export const updateSubCategorySchema = createSubCategorySchema.partial()

// Type for updating a sub-category
export type UpdateSubCategory = z.infer<typeof updateSubCategorySchema>