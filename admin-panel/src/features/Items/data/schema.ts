import { z } from 'zod'

// Main schema for restaurant items - matching backend Item entity
export const itemSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().default(""),
  slug: z.string(),
  price: z.number().min(0, "Price must be positive"),
  image_url: z.string().nullable().optional(),
  sub_category_id: z.number(),
  display_order: z.number().default(0),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  allergens: z.string().nullable().optional(),
  preparation_time: z.number().nullable().optional(),
  calories: z.number().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  sub_category: z.object({
    id: z.number(),
    name: z.string(),
    slug: z.string(),
    category: z.object({
      id: z.number(),
      name: z.string(),
      slug: z.string(),
    }).optional(),
  }).optional(),
})

// Type for item instance
export type Item = z.infer<typeof itemSchema>

// Schema for creating a new item
export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  image_url: z.string().optional(),
  sub_category_id: z.number(),
  display_order: z.number().optional().default(0),
  available: z.boolean().optional().default(true),
  featured: z.boolean().optional().default(false),
  allergens: z.string().optional(),
  preparation_time: z.number().optional(),
  calories: z.number().optional(),
})

// Type for creating a new item
export type CreateItem = z.infer<typeof createItemSchema>

// Schema for updating an item
export const updateItemSchema = createItemSchema.partial()

// Type for updating an item
export type UpdateItem = z.infer<typeof updateItemSchema>