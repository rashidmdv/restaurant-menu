import { z } from 'zod'

// Valid currency codes
const VALID_CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'QAR'] as const

// Dietary info schema for structured validation (exported for future use)
export const dietaryInfoSchema = z.object({
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  gluten_free: z.boolean().optional(),
  dairy_free: z.boolean().optional(),
  nut_free: z.boolean().optional(),
  spicy: z.boolean().optional(),
  halal: z.boolean().optional(),
  keto: z.boolean().optional(),
}).optional().default({})

// Main schema for restaurant items - matching backend Item entity
export const itemSchema = z.object({
  id: z.number(),
  name: z.string()
    .min(1, "Name is required")
    .max(150, "Name must be less than 150 characters"),
  description: z.string().default(""),
  price: z.number()
    .min(0, "Price cannot be negative")
    .max(9999.99, "Price cannot exceed 9999.99"),
  currency: z.string().default("AED"), // Keep as string for backwards compatibility
  dietary_info: z.record(z.any()).default({}), // Keep as record for backwards compatibility
  image_url: z.string().optional(),
  sub_category_id: z.number()
    .int("Sub-category ID must be a whole number")
    .positive("Sub-category ID must be positive"),
  available: z.boolean().default(true),
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .default(0),
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
  name: z.string()
    .min(1, "Name is required")
    .max(150, "Name must be less than 150 characters")
    .refine((val) => /^[a-zA-Z0-9\s\-&'.,!()]+$/.test(val), {
      message: "Name can only contain letters, numbers, spaces, and basic punctuation",
    })
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be only whitespace",
    }),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  price: z.number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a valid number",
    })
    .min(0.01, "Price must be greater than 0")
    .max(9999.99, "Price cannot exceed 9999.99")
    .refine((val) => Number.isFinite(val), {
      message: "Price must be a valid number",
    }),
  currency: z.string()
    .refine((val) => VALID_CURRENCIES.includes(val as any), {
      message: "Please select a valid currency",
    })
    .default("AED"),
  dietary_info: z.record(z.any()).optional().default({}),
  image_url: z.string()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL or empty",
    })
    .optional(),
  sub_category_id: z.number({
      required_error: "Sub-category is required",
      invalid_type_error: "Please select a valid sub-category",
    })
    .int("Sub-category ID must be a whole number")
    .positive("Please select a valid sub-category"),
  available: z.boolean().optional().default(true),
  display_order: z.number()
    .int("Display order must be a whole number")
    .min(0, "Display order cannot be negative")
    .max(999, "Display order cannot exceed 999")
    .optional()
    .default(0),
})

// Type for creating a new item
export type CreateItem = z.infer<typeof createItemSchema>

// Schema for updating an item
export const updateItemSchema = createItemSchema.partial()

// Type for updating an item
export type UpdateItem = z.infer<typeof updateItemSchema>