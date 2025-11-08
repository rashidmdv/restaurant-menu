import {
  IconLayoutDashboard,
  IconCategory,
  IconSettings,
  IconUserCog,
  IconPalette,
  IconHierarchy,
  IconChefHat,
  IconFileText,
  IconCalendarEvent,
} from '@tabler/icons-react'
import { type SidebarData } from '../types'
import LomaLogo from '@/components/icons/loma-logo'

export const sidebarData: SidebarData = {
  user: {
    name: 'Restaurant Admin',
    email: 'admin@restaurant.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Loma',
      logo: LomaLogo,
      plan: 'Admin Panel',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: 'Website Management',
      items: [
        {
          title: 'Content Sections',
          icon: IconFileText,
          url: '/content',
        },
      ],
    },
    {
      title: 'Menu Management',
      items: [
        {
          title: 'Categories',
          icon: IconCategory,
          url: '/category',
        },
        {
          title: 'Sub Categories',
          icon: IconHierarchy,
          url: '/sub-category',
        },
        {
          title: 'Menu Items',
          icon: IconChefHat,
          url: '/items',
        },
      ],
    },
    {
      title: 'Reservations',
      items: [
        {
          title: 'Table Reservations',
          icon: IconCalendarEvent,
          url: '/reservations',
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
          ],
        },
      ],
    },
  ],
}
