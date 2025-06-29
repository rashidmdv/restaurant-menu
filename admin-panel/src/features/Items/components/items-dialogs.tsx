import { ConfirmDialog } from '@/components/confirm-dialog'
import { useItems } from '../context/items-context'
import { ItemsMutateDialog } from './items-mutate-dialog'
import { ItemsDetailsDialog } from './items-details-dialog'
import { useState, useCallback } from 'react'

export function ItemsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteItem } = useItems()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteItem(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting variant:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteItem, setOpen, setCurrentRow])
  
  const handleDialogClose = useCallback((type: string) => {
    return () => {
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    }
  }, [setOpen, setCurrentRow])
  
  // Return null if no dialog is open and no current row
  if (!open && !currentRow) {
    return null
  }
  
  return (
    <>
      {/* Create dialog - only render when open */}
      {open === 'create' && (
        <ItemsMutateDialog
          key='item-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}


      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <ItemsDetailsDialog
              key={`item-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <ItemsMutateDialog
              key={`item-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='item-delete'
              destructive
              open={true}
              onOpenChange={() => {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 300)
              }}
              handleConfirm={handleDelete}
              className='max-w-md'
              title={`Delete Item: ${currentRow.name}?`}
              desc={
                <>
                  You are about to delete the menu item <strong>{currentRow.name}</strong>. <br />
                  This action cannot be undone.
                </>
              }
              confirmText={isDeleting ? 'Deleting...' : 'Delete'}
              confirmDisabled={isDeleting}
            />
          )}
        </>
      )}
    </>
  )
}