import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircleCheck,
  IconCircleX,
  IconTruckDelivery,
  IconCreditCard,
  IconCash,
  IconClock,
  IconPackage,
} from '@tabler/icons-react'

export const paymentMethods = [
  {
    value: 'upi',
    label: 'UPI',
    icon: IconCreditCard,
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    icon: IconCash,
  },
  {
    value: 'card',
    label: 'Card',
    icon: IconCreditCard,
  },
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: IconCreditCard,
  },
]

export const paymentStatuses = [
  {
    value: 'paid',
    label: 'Paid',
    icon: IconCircleCheck,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: IconClock,
  },
  {
    value: 'failed',
    label: 'Failed',
    icon: IconCircleX,
  },
  {
    value: 'refunded',
    label: 'Refunded',
    icon: IconArrowDown,
  },
]

export const statuses = [
  {
    value: 'pending',
    label: 'Pending',
    icon: IconClock,
  },
  {
    value: 'processing',
    label: 'Processing',
    icon: IconPackage,
  },
  {
    value: 'shipped',
    label: 'Shipped',
    icon: IconTruckDelivery,
  },
  {
    value: 'delivered',
    label: 'Delivered',
    icon: IconCircleCheck,
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    icon: IconCircleX,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: 'Medium',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: 'High',
    value: 'high',
    icon: IconArrowUp,
  },
]