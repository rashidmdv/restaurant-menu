import { z } from 'zod'

// Main schema for restaurant categories - matching backend Category entity
export const categorySchema = z.object({
  id: z.number(),
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z.string().default(""),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .default(0),
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
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .max(999, "Display order cannot exceed 999")
    .optional()
    .default(0),
  active: z.boolean().optional().default(true),
})

// Type for creating a new category
export type CreateCategory = z.infer<typeof createCategorySchema>

// Schema for updating a category
export const updateCategorySchema = createCategorySchema.partial()

// Type for updating a category
export type UpdateCategory = z.infer<typeof updateCategorySchema>