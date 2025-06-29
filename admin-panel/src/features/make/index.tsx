import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { MakesDialogs } from './components/makes-dialogs'
import { MakesPrimaryButtons } from './components/makes-primary-buttons'
import MakesProvider from './context/makes-context'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={resetErrorBoundary}
        >
          <ReloadIcon className="mr-2 h-4 w-4" /> Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default function Make() {
  return (
    <MakesProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vehicle Makes</h2>
            <p className='text-muted-foreground'>
              Manage vehicle makes 
            </p>
          </div>
          <MakesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              // Reset the state when the error boundary is reset
              window.location.reload()
            }}
          >
            <DataTable columns={columns} />
          </ErrorBoundary>
        </div>
      </Main>

      <MakesDialogs />
    </MakesProvider>
  )
}