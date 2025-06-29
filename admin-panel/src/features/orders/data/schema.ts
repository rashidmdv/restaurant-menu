import { z } from 'zod'

export const orderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  orderItems: z.number(),
  totalAmount: z.string(),
  orderDate: z.string(),
  status: z.string(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  priority: z.string()
})

export type Order = z.infer<typeof orderSchema>