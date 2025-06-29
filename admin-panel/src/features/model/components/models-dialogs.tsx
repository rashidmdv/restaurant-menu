import { ConfirmDialog } from '@/components/confirm-dialog'
import { useModels } from '../context/models-context'
import { ModelsImportDialog } from './models-import-dialog'
import { ModelsMutateDialog } from './models-mutate-dialog'
import { ModelsDetailsDialog } from './models-details-dialog'
import { useState, useCallback } from 'react'

export function ModelsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteModel } = useModels()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteModel(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting model:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteModel, setOpen, setCurrentRow])
  
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
        <ModelsMutateDialog
          key='model-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <ModelsImportDialog
          key='models-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <ModelsDetailsDialog
              key={`model-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <ModelsMutateDialog
              key={`model-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='model-delete'
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
              title={`Delete Model: ${currentRow.name} (${currentRow.year})?`}
              desc={
                <>
                  You are about to delete the vehicle model <strong>{currentRow.name}</strong> from year <strong>{currentRow.year}</strong>. <br />
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