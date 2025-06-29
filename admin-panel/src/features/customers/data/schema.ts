// File: web/src/features/customers/data/schema.ts

import { z } from 'zod'

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string(),
  lastInteraction: z.string().optional(),
  totalOrders: z.number(),
  totalSpent: z.number(),
  status: z.string(),
  segment: z.string(),
  source: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  memberSince: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
})

export type Customer = z.infer<typeof customerSchema>