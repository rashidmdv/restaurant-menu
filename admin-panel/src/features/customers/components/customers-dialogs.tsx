// File: web/src/features/customers/components/customers-dialogs.tsx

import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from '../context/customers-context'
import { CustomersImportDialog } from './customers-import-dialog'
import { CustomersMutateDrawer } from './customers-mutate-drawer'
import { CustomersDetailsDialog } from './customers-details-dialog'
import { CustomersOrdersDialog } from './customers-orders-dialog'
import { CustomersInteractionsDialog } from './customers-interactions-dialog'
import { CustomersSegmentDialog } from './customers-segment-dialog'

export function CustomersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  return (
    <>
      <CustomersImportDialog
        key='customers-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      <CustomersSegmentDialog
        key='customers-segment'
        open={open === 'segment'}
        onOpenChange={() => setOpen('segment')}
      />

      {currentRow && (
        <>
          <CustomersDetailsDialog
            key={`customer-details-${currentRow.id}`}
            open={open === 'details'}
            onOpenChange={() => {
              setOpen('details')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CustomersMutateDrawer
            key={`customer-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CustomersOrdersDialog
            key={`customer-orders-${currentRow.id}`}
            open={open === 'orders'}
            onOpenChange={() => {
              setOpen('orders')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <CustomersInteractionsDialog
            key={`customer-interactions-${currentRow.id}`}
            open={open === 'interactions'}
            onOpenChange={() => {
              setOpen('interactions')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='customer-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              showSubmittedData(
                currentRow,
                'The following customer has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete Customer ${currentRow.name}?`}
            desc={
              <>
                You are about to delete <strong>{currentRow.name}</strong> from your customer database. <br />
                This action cannot be undone and will remove all customer data including order history and conversations.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}