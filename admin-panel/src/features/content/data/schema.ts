import { z } from 'zod'

// Content Section Schema
export const contentSchema = z.object({
  id: z.number(),
  section_name: z.string(),
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.any()),
  image_url: z.string(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

// TypeScript types
export type ContentSection = z.infer<typeof contentSchema>

// Enhanced metadata schemas for different section types (for future use)
export const heroMetadataSchema = z.object({
  button_text: z.string().optional(),
  button_url: z.string().url('Invalid button URL').optional().or(z.literal('')),
  background_overlay: z.boolean().optional(),
}).optional()

export const experienceMetadataSchema = z.object({
  features: z.array(z.string()).optional(),
  highlight_text: z.string().optional(),
}).optional()

export const eventsMetadataSchema = z.object({
  event_date: z.string().optional(),
  booking_url: z.string().url('Invalid booking URL').optional().or(z.literal('')),
  capacity: z.number().min(1).optional(),
}).optional()

// Enhanced validation with conditional rules
export const createContentSchema = z.object({
  section_name: z.string().min(1, 'Section name is required').max(50, 'Section name must be less than 50 characters'),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must be less than 2000 characters'),
  image_url: z.string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: 'Must be a valid URL or empty',
    }),
  metadata: z.record(z.any()).optional(),
}).refine((data) => {
  // Hero section must have an image
  if (data.section_name === 'hero' && (!data.image_url || data.image_url === '')) {
    return false
  }
  return true
}, {
  message: 'Hero section must have an image',
  path: ['image_url'],
}).refine((data) => {
  // Location section should have address in content
  if (data.section_name === 'location' && data.content && !data.content.toLowerCase().includes('address')) {
    return false
  }
  return true
}, {
  message: 'Location section should include address information',
  path: ['content'],
})

export const updateContentSchema = z.object({
  section_name: z.string().min(1, 'Section name is required').max(50, 'Section name must be less than 50 characters').optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content must be less than 2000 characters')
    .optional(),
  image_url: z.string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: 'Must be a valid URL or empty',
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().optional(),
}).refine((data) => {
  // Hero section must have an image (if section_name and image_url are provided)
  if (data.section_name === 'hero' && data.image_url !== undefined && (!data.image_url || data.image_url === '')) {
    return false
  }
  return true
}, {
  message: 'Hero section must have an image',
  path: ['image_url'],
}).refine((data) => {
  // Location section should have address in content (if both are provided)
  if (data.section_name === 'location' && data.content && !data.content.toLowerCase().includes('address')) {
    return false
  }
  return true
}, {
  message: 'Location section should include address information',
  path: ['content'],
})

export type CreateContentRequest = z.infer<typeof createContentSchema>
export type UpdateContentRequest = z.infer<typeof updateContentSchema>

// Filter schemas
export const contentFilterSchema = z.object({
  section_name: z.string().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  order_by: z.string().optional(),
  order_dir: z.enum(['asc', 'desc']).optional(),
})

export type ContentFilter = z.infer<typeof contentFilterSchema>

// Pre-defined content section types
export const CONTENT_SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'story', label: 'Our Story' },
  { value: 'people', label: 'Our People/Team' },
  { value: 'location', label: 'Location' },
  { value: 'experience', label: 'Experience' },
  { value: 'events', label: 'Events' },
] as const

export type ContentSectionType = typeof CONTENT_SECTION_TYPES[number]['value']