import { ConfirmDialog } from '@/components/confirm-dialog'
import { useMakes } from '../context/makes-context'
import { MakesImportDialog } from './makes-import-dialog'
import { MakesMutateDialog } from './makes-mutate-dialog'
import { MakesDetailsDialog } from './makes-details-dialog'
import { useState, useCallback } from 'react'

export function MakesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteMake } = useMakes()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteMake(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting make:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteMake, setOpen, setCurrentRow])
  
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
        <MakesMutateDialog
          key='make-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <MakesImportDialog
          key='makes-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <MakesDetailsDialog
              key={`make-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <MakesMutateDialog
              key={`make-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='make-delete'
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
              title={`Delete Make: ${currentRow.name} (${currentRow.year})?`}
              desc={
                <>
                  You are about to delete the vehicle make <strong>{currentRow.name}</strong> from year <strong>{currentRow.year}</strong>. <br />
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