import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCategories } from '../context/categories-context'
import { CategoriesImportDialog } from './categories-import-dialog'
import { CategoriesMutateDialog } from './categories-mutate-dialog'
import { CategoriesDetailsDialog } from './categories-details-dialog'
import { useState, useCallback } from 'react'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteCategory } = useCategories()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteCategory(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting category:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteCategory, setOpen, setCurrentRow])
  
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
        <CategoriesMutateDialog
          key='category-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <CategoriesImportDialog
          key='categories-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <CategoriesDetailsDialog
              key={`category-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <CategoriesMutateDialog
              key={`category-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='category-delete'
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
              title={`Delete Category: ${currentRow.name}?`}
              desc={
                <>
                  You are about to delete the catalog category <strong>{currentRow.name}</strong>. <br />
                  This action cannot be undone.
                </>
              }
              confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            />
          )}
        </>
      )}
    </>
  )
}