import { ConfirmDialog } from '@/components/confirm-dialog'
import { useVariants } from '../context/variants-context'
import { VariantsImportDialog } from './variants-import-dialog'
import { VariantsMutateDialog } from './variants-mutate-dialog'
import { VariantsDetailsDialog } from './variants-details-dialog'
import { useState, useCallback } from 'react'

export function VariantsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteVariant } = useVariants()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteVariant(currentRow.id)
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
  }, [currentRow, deleteVariant, setOpen, setCurrentRow])
  
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
        <VariantsMutateDialog
          key='variant-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <VariantsImportDialog
          key='variants-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <VariantsDetailsDialog
              key={`variant-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <VariantsMutateDialog
              key={`variant-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='variant-delete'
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
              title={`Delete Variant: ${currentRow.name} (${currentRow.year})?`}
              desc={
                <>
                  You are about to delete the vehicle variant <strong>{currentRow.name}</strong> from year <strong>{currentRow.year}</strong>. <br />
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