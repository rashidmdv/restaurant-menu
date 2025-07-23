import { SidebarMenuButton } from '@/components/ui/sidebar'
import SpareitLogo from '@/components/icons/spareit-logo'

export function CompanyHeader() {
  return (
    <SidebarMenuButton
      size="lg"
      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <SpareitLogo />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">Loma Restaurant</span>
        <span className="truncate text-xs">Admin Panel</span>
      </div>
    </SidebarMenuButton>
  )
}