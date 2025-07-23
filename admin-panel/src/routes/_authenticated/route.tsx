import Cookies from 'js-cookie'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/authStore'
import { AuthService } from '@/services/auth-service'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { auth } = useAuthStore.getState()
    
    // If no access token, redirect to sign-in
    if (!auth.accessToken) {
      const redirectTo = location.pathname
      throw redirect({
        to: '/sign-in',
        search: { redirect: redirectTo },
      })
    }

    // Check if token is expired or about to expire
    if (auth.checkTokenExpiry()) {
      try {
        const refreshSuccess = await auth.refreshTokens()
        if (!refreshSuccess) {
          throw redirect({
            to: '/sign-in',
            search: { redirect: location.pathname },
          })
        }
      } catch (_error) {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.pathname },
        })
      }
    }

    // Load user profile if not already loaded
    if (!auth.user) {
      try {
        const user = await AuthService.getProfile()
        auth.setUser(user)
      } catch (_error) {
        // If profile fetch fails, redirect to sign-in
        auth.reset()
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.pathname },
        })
      }
    }

    return {}
  },
  component: RouteComponent,
})

function RouteComponent() {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'sm:transition-[width] sm:duration-200 sm:ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
