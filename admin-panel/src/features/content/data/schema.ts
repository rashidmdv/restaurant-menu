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

// Create/Update schemas
export const createContentSchema = z.object({
  section_name: z.string().min(1, 'Section name is required').max(50, 'Section name must be less than 50 characters'),
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
})

export const updateContentSchema = z.object({
  section_name: z.string().min(1).max(50).optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  metadata: z.record(z.any()).optional(),
  active: z.boolean().optional(),
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