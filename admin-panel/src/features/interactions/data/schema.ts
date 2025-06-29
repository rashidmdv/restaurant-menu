// File: web/src/features/interactions/data/schema.ts

import { z } from 'zod'

export const interactionSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  message: z.string(),
  intent: z.string(),
  timestamp: z.string(),
  status: z.string(),
  channel: z.string(),
  sentimentScore: z.number().optional(),
  aiProcessed: z.boolean().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type Interaction = z.infer<typeof interactionSchema>