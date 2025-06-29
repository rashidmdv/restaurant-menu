import { z } from 'zod'

// Main schema for restaurant items - matching backend Item entity
export const itemSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(150, "Name too long"),
  description: z.string().default(""),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("AED"),
  dietary_info: z.record(z.any()).default({}),
  image_url: z.string().optional(),
  sub_category_id: z.number(),
  available: z.boolean().default(true),
  display_order: z.number().default(0),
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
  name: z.string().min(1, "Name is required").max(150, "Name too long"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().optional().default("AED"),
  dietary_info: z.record(z.any()).optional().default({}),
  image_url: z.string().optional(),
  sub_category_id: z.number(),
  available: z.boolean().optional().default(true),
  display_order: z.number().optional().default(0),
})

// Type for creating a new item
export type CreateItem = z.infer<typeof createItemSchema>

// Schema for updating an item
export const updateItemSchema = createItemSchema.partial()

// Type for updating an item
export type UpdateItem = z.infer<typeof updateItemSchema>