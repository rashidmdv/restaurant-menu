import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersPrimaryButtons } from './components/orders-primary-buttons'
import OrdersProvider from './context/orders-context'
import { orders } from './data/orders'

export default function Orders() {
  return (
    <OrdersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>WhatsApp Orders</h2>
            <p className='text-muted-foreground'>
              Manage customer orders received through WhatsApp
            </p>
          </div>
          <OrdersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={orders} columns={columns} />
        </div>
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}