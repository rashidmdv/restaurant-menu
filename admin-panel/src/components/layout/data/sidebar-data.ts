import {
  IconLayoutDashboard,
  IconUsers,
  IconCar,
  IconClipboardList,
  IconLayersSubtract,
  IconCategory,
  IconBox,
  IconBrandWhatsapp,
  IconSettings,
  IconUserCog,
  IconTool,
  IconPalette,
  IconNotification,
  IconBrowserCheck,
  IconHelp,
  IconTruck,
  IconPackage,
  IconHierarchy,
  IconBrandToyota,
} from '@tabler/icons-react'
import SpareitLogo from '@/components/icons/spareit-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Kaif',
    email: 'spareit@spareit.co.in',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Spareit',
      logo: SpareitLogo,
      plan: 'Organization',
    },
    //  {
    //    name: 'Acme Inc',
    //    logo: GalleryVerticalEnd,
    //    plan: 'Enterprise',
    //  },
    //  {
    //    name: 'Acme Corp.',
    //    logo: AudioWaveform,
    //    plan: 'Startup',
    //  },
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
        // {
        //   title: 'Tasks',
        //   url: '/tasks',
        //   icon: IconChecklist,
        // },
        // {
        //   title: 'Apps',
        //   url: '/apps',
        //   icon: IconPackages,
        // },
        // {
        //   title: 'Chats',
        //   url: '/chats',
        //   badge: '3',
        //   icon: IconMessages,
        // },
        {
          title: 'Customers',
          url: '/customers',
          icon: IconUsers,
        },
      ],
    },
    {
      title: 'Whatsapp',
      items: [
        {
          title: 'Interactions',
          icon: IconBrandWhatsapp,
          //url: '/chats',
          url: '/interactions',
          badge: '3',
        },
      ],
    },
    {
      title: 'Sales',
      items: [
        {
          title: 'Orders',
          icon: IconBox,
          url: '/orders',
          badge: '22',
        },
      ],
    },
    {
      title: 'Catalog',
      items: [
        {
          title: 'Vehicle',
          icon: IconTruck, // better represents vehicle-related catalog
          items: [
            {
              title: 'Make',
              icon: IconCar, // already good
              url: '/make',
            },
            {
              title: 'Model',
              icon: IconClipboardList, // good as is
              url: '/model',
            },
            {
              title: 'Variants',
              icon: IconLayersSubtract, // good for representing combinations
              url: '/variant',
            },
          ],
        },
        {
          title: 'Product',
          icon: IconPackage, // represents product/items well
          items: [
            {
              title: 'Brands',
              icon: IconBrandToyota, 
              url: '/brands',
            },
            {
              title: 'Items',
              icon: IconBox, // box is better for individual items
              url: '/items',
            },
            {
              title: 'Category',
              icon: IconCategory, // perfect as is
              url: '/category',
            },
            {
              title: 'Sub Category',
              icon: IconHierarchy, // shows sub-structure, better than subtask
              url: '/sub-category',
            },
          ],
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
