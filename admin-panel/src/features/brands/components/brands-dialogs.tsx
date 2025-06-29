import { ConfirmDialog } from '@/components/confirm-dialog'
import { useBrands } from '../context/brands-context'
import { BrandsImportDialog } from './brands-import-dialog'
import { BrandsMutateDialog } from './brands-mutate-dialog'
import { BrandsDetailsDialog } from './brands-details-dialog'
import { useState, useCallback } from 'react'

export function BrandsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteBrand } = useBrands()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteBrand(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting brand:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteBrand, setOpen, setCurrentRow])
  
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
        <BrandsMutateDialog
          key='brand-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <BrandsImportDialog
          key='brand-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <BrandsDetailsDialog
              key={`brand-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <BrandsMutateDialog
              key={`brand-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='brand-delete'
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
              title={`Delete Brand: ${currentRow.name} (${currentRow.year})?`}
              desc={
                <>
                  You are about to delete the catalog brand <strong>{currentRow.name}</strong> from year <strong>{currentRow.year}</strong>. <br />
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