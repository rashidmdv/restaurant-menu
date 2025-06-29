import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconCircle,
  IconStopwatch,
} from '@tabler/icons-react'

export const labels = [
  {
    value: 'sedan',
    label: 'Sedan',
  },
  {
    value: 'suv',
    label: 'SUV',
  },
  {
    value: 'hatchback',
    label: 'Hatchback',
  },
  {
    value: 'truck',
    label: 'Truck',
  },
  {
    value: 'coupe',
    label: 'Coupe',
  },
]

export const statuses = [
  {
    value: 'active',
    label: 'Active',
    icon: IconCircleCheck,
  },
  {
    value: 'discontinued',
    label: 'Discontinued',
    icon: IconCircleX,
  },
  {
    value: 'upcoming',
    label: 'Upcoming',
    icon: IconExclamationCircle,
  },
  {
    value: 'limited',
    label: 'Limited',
    icon: IconCircle,
  },
  {
    value: 'production',
    label: 'In Production',
    icon: IconStopwatch,
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
