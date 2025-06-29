import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSubCategories } from '../context/sub-categories-context'
import { SubCategoriesImportDialog } from './sub-categories-import-dialog'
import { SubCategoriesMutateDialog } from './sub-categories-mutate-dialog'
import { SubCategoriesDetailsDialog } from './sub-categories-details-dialog'
import { useState, useCallback } from 'react'

export function SubCategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, deleteSubCategory } = useSubCategories()
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    
    try {
      setIsDeleting(true)
      await deleteSubCategory(currentRow.id)
      setOpen(null)
      // Use a timeout to ensure the dialog is closed before clearing the row
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    } catch (error) {
      console.error('Error deleting sub-category:', error)
    } finally {
      setIsDeleting(false)
    }
  }, [currentRow, deleteSubCategory, setOpen, setCurrentRow])

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
        <SubCategoriesMutateDialog
          key='subcategory-create'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Import dialog - only render when open */}
      {open === 'import' && (
        <SubCategoriesImportDialog
          key='subcategory-import'
          open={true}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {/* Only render these dialogs if we have a currentRow */}
      {currentRow && (
        <>
          {/* Details dialog */}
          {open === 'details' && (
            <SubCategoriesDetailsDialog
              key={`subcategory-details-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('details')}
              currentRow={currentRow}
            />
          )}

          {/* Update dialog */}
          {open === 'update' && (
            <SubCategoriesMutateDialog
              key={`subcategory-update-${currentRow.id}`}
              open={true}
              onOpenChange={handleDialogClose('update')}
              currentRow={currentRow}
            />
          )}

          {/* Delete dialog */}
          {open === 'delete' && (
            <ConfirmDialog
              key='subcategory-delete'
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
              title={`Delete Sub-Category: ${currentRow.name}?`}
              desc={
                <>
                  You are about to delete the catalog sub-category <strong>{currentRow.name}</strong>. <br />
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