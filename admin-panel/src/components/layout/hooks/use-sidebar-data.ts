import { useAuthStore } from '@/stores/authStore'
import { sidebarData } from '../data/sidebar-data'
import { type SidebarData } from '../types'

export function useSidebarData(): SidebarData {
  const { auth } = useAuthStore()
  
  // Use auth user data if available, otherwise fallback to static data
  const user = auth.user ? {
    name: auth.user.name,
    email: auth.user.email,
    avatar: auth.user.avatar || '/avatars/shadcn.jpg', // fallback avatar
  } : sidebarData.user

  return {
    user,
    navGroups: sidebarData.navGroups,
  }
}