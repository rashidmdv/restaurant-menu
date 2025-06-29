// File: web/src/features/orders/components/orders-dialogs.tsx

import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useOrders } from '../context/orders-context'
import { OrdersImportDialog } from './orders-import-dialog'
import { OrdersMutateDrawer } from './orders-mutate-drawer'
import { OrdersDetailsDialog } from './orders-details-dialog'

export function OrdersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useOrders()
  return (
    <>
      <OrdersMutateDrawer
        key='order-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <OrdersImportDialog
        key='orders-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>
          <OrdersDetailsDialog
            key={`order-details-${currentRow.id}`}
            open={open === 'details'}
            onOpenChange={() => {
              setOpen('details')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <OrdersMutateDrawer
            key={`order-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='order-delete'
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
                'The following order has been deleted:'
              )
            }}
            className='max-w-md'
            title={`Delete Order ${currentRow.id}?`}
            desc={
              <>
                You are about to delete order <strong>{currentRow.id}</strong> from {currentRow.customerName}. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}