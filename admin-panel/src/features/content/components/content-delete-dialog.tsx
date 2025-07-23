import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useContentContext } from '../context/content-context'

export function ContentDeleteDialog() {
  const { 
    selectedContent, 
    deleteDialogOpen, 
    setDeleteDialogOpen,
    deleteContent 
  } = useContentContext()
  
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedContent) return
    
    try {
      setIsDeleting(true)
      await deleteContent(selectedContent.id)
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsDeleting(false)
    }
  }

  if (!selectedContent) return null

  return (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Content Section</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the "{selectedContent.section_name}" 
            content section? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}