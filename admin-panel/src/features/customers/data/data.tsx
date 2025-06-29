// File: web/src/features/customers/data/data.tsx

import {
  IconUserCheck,
  IconUserX,
  IconUserPause,
  IconUserQuestion,
  IconUserPlus,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandInstagram,
  IconWorld,
  IconStarFilled,
  IconUser,
  IconUsers,
  IconCrown,
} from '@tabler/icons-react'

export const statuses = [
  {
    value: 'active',
    label: 'Active',
    icon: IconUserCheck,
  },
  {
    value: 'inactive',
    label: 'Inactive',
    icon: IconUserPause,
  },
  {
    value: 'blocked',
    label: 'Blocked',
    icon: IconUserX,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: IconUserQuestion,
  },
  {
    value: 'new',
    label: 'New',
    icon: IconUserPlus,
  },
]

export const sources = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: IconBrandWhatsapp,
  },
  {
    value: 'facebook',
    label: 'Facebook',
    icon: IconBrandFacebook,
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: IconBrandInstagram,
  },
  {
    value: 'website',
    label: 'Website',
    icon: IconWorld,
  },
  {
    value: 'referral',
    label: 'Referral',
    icon: IconUserCheck,
  },
]

export const segments = [
  {
    value: 'vip',
    label: 'VIP',
    icon: IconCrown,
  },
  {
    value: 'regular',
    label: 'Regular',
    icon: IconUser,
  },
  {
    value: 'new',
    label: 'New',
    icon: IconUserPlus,
  },
  {
    value: 'loyal',
    label: 'Loyal',
    icon: IconStarFilled,
  },
  {
    value: 'wholesale',
    label: 'Wholesale',
    icon: IconUsers,
  },
]

export function getStatusColor(status: string): string {
  const statusColorMap: Record<string, string> = {
    active: 'bg-green-500',
    inactive: 'bg-yellow-500',
    blocked: 'bg-red-500',
    pending: 'bg-blue-500',
    new: 'bg-purple-500',
  }
  return statusColorMap[status] || 'bg-gray-500'
}

export function getSegmentColor(segment: string): string {
  const segmentColorMap: Record<string, string> = {
    vip: 'bg-purple-100 text-purple-800',
    regular: 'bg-gray-100 text-gray-800',
    new: 'bg-blue-100 text-blue-800',
    loyal: 'bg-green-100 text-green-800',
    wholesale: 'bg-amber-100 text-amber-800',
  }
  return segmentColorMap[segment] || 'bg-gray-100 text-gray-800'
}

export function getSourceIcon(source: string) {
  return sources.find(s => s.value === source)?.icon || IconWorld
}