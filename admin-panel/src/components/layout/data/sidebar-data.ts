import {
  IconLayoutDashboard,
  IconCategory,
  IconBox,
  IconSettings,
  IconUserCog,
  IconTool,
  IconPalette,
  IconNotification,
  IconBrowserCheck,
  IconHelp,
  IconHierarchy,
  IconChefHat,
  IconToolsKitchen2,
} from '@tabler/icons-react'
import SpareitLogo from '@/components/icons/spareit-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Restaurant Admin',
    email: 'admin@restaurant.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Restaurant Menu',
      logo: SpareitLogo,
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
              title: 'Account',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
