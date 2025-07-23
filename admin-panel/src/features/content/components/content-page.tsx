import { useEffect } from 'react'
import { ContentProvider, useContentContext } from '../context/content-context'
import { ContentDataTable } from './content-data-table'
import { ContentDetailsDialog } from './content-details-dialog'
// import { ContentMutateDialog } from './content-mutate-dialog' // Temporarily disabled
import { ContentDeleteDialog } from './content-delete-dialog'
import { ContentMutateDialog } from './content-mutate-dialog'

function ContentPageContent() {
  const { fetchContent } = useContentContext()

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return (
    <div className='h-full flex-1 flex-col space-y-8 p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Content Management</h2>
          <p className='text-muted-foreground'>
            Manage website content sections for your restaurant homepage.
          </p>
        </div>
      </div>
      <ContentDataTable />
      <ContentDetailsDialog />
      <ContentMutateDialog />
      <ContentDeleteDialog />
    </div>
  )
}

export default function ContentManagement() {
  return (
    <ContentProvider>
      <ContentPageContent />
    </ContentProvider>
  )
}