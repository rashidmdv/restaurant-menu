import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersPrimaryButtons } from './components/customers-primary-buttons'
import CustomersProvider from './context/customers-context'
import { customers } from './data/customers'

export default function Customers() {
  return (
    <CustomersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Customers</h2>
            <p className='text-muted-foreground'>
              Manage your WhatsApp shop customers and their information
            </p>
          </div>
          <CustomersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={customers} columns={columns} />
        </div>
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}