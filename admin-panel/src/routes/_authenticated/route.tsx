// import Cookies from 'js-cookie';
// import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
// import { cn } from '@/lib/utils';
// import { SearchProvider } from '@/context/search-context';
// import { SidebarProvider } from '@/components/ui/sidebar';
// import { AppSidebar } from '@/components/layout/app-sidebar';
// import SkipToMain from '@/components/skip-to-main';
// import { useAuthStore } from '@/stores/authStore';

// export const Route = createFileRoute('/_authenticated')({
//   // Add a beforeLoad guard to check authentication
//   beforeLoad: async ({ location }) => {
//     // Get auth state from store
//     const { auth } = useAuthStore.getState();
    
//     // If no access token, redirect to sign-in
//     if (!auth.accessToken) {
//       // Add the current location as a redirect parameter
//       const redirectTo = location.pathname;
//       throw redirect({
//         to: '/sign-in',
//         search: { redirect: redirectTo },
//       });
//     }

//     // Return nothing if authenticated
//     return {};
//   },
//   component: RouteComponent,
// });

// function RouteComponent() {
//   const defaultOpen = Cookies.get('sidebar_state') !== 'false';
  
//   return (
//     <SearchProvider>
//       <SidebarProvider defaultOpen={defaultOpen}>
//         <SkipToMain />
//         <AppSidebar />
//         <div
//           id='content'
//           className={cn(
//             'ml-auto w-full max-w-full',
//             'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
//             'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
//             'sm:transition-[width] sm:duration-200 sm:ease-linear',
//             'flex h-svh flex-col',
//             'group-data-[scroll-locked=1]/body:h-full',
//             'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
//           )}
//         >
//           <Outlet />
//         </div>
//       </SidebarProvider>
//     </SearchProvider>
//   );
// }


import Cookies from 'js-cookie'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'

export const Route = createFileRoute('/_authenticated')({
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
