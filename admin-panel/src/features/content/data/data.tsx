import { 
  IconFileText, 
  IconUser, 
  IconMapPin, 
  IconSparkles, 
  IconCalendarEvent,
  IconHome,
} from '@tabler/icons-react'

export const contentSectionTypes = [
  {
    value: 'hero',
    label: 'Hero Section',
    icon: IconHome,
    description: 'Main banner section with call-to-action',
    color: 'bg-blue-500',
  },
  {
    value: 'story',
    label: 'Our Story', 
    icon: IconFileText,
    description: 'Restaurant history and background',
    color: 'bg-green-500',
  },
  {
    value: 'people',
    label: 'Our People/Team',
    icon: IconUser,
    description: 'Chef and team information',
    color: 'bg-purple-500',
  },
  {
    value: 'location',
    label: 'Location',
    icon: IconMapPin,
    description: 'Restaurant location and contact details',
    color: 'bg-red-500',
  },
  {
    value: 'experience',
    label: 'Experience',
    icon: IconSparkles,
    description: 'Dining experience description',
    color: 'bg-orange-500',
  },
  {
    value: 'events',
    label: 'Events',
    icon: IconCalendarEvent,
    description: 'Private events and catering',
    color: 'bg-pink-500',
  },
]

export const statusOptions = [
  {
    value: true,
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    value: false,
    label: 'Inactive',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]