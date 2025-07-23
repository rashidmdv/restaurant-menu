import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { useContentContext } from '../context/content-context'
import { contentSectionTypes } from '../data/data'

export function ContentDetailsDialog() {
  const { selectedContent, viewDialogOpen, setViewDialogOpen } = useContentContext()

  if (!selectedContent) return null

  const sectionType = contentSectionTypes.find(
    type => type.value === selectedContent.section_name
  )

  return (
    <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
      <DialogContent className='max-w-2xl max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2'>
            <span>{sectionType?.label || selectedContent.section_name}</span>
            <Badge variant={selectedContent.active ? 'default' : 'secondary'}>
              {selectedContent.active ? 'Active' : 'Inactive'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className='max-h-[60vh]'>
          <div className='space-y-4'>
            <div>
              <h4 className='font-medium mb-2'>Title</h4>
              <p className='text-sm text-muted-foreground'>
                {selectedContent.title || 'No title'}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className='font-medium mb-2'>Content</h4>
              <div className='text-sm text-muted-foreground whitespace-pre-wrap'>
                {selectedContent.content || 'No content'}
              </div>
            </div>
            
            {selectedContent.image_url && (
              <>
                <Separator />
                <div>
                  <h4 className='font-medium mb-2'>Image</h4>
                  <div className='text-sm text-muted-foreground break-all'>
                    {selectedContent.image_url}
                  </div>
                </div>
              </>
            )}
            
            {selectedContent.metadata && Object.keys(selectedContent.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className='font-medium mb-2'>Metadata</h4>
                  <pre className='text-xs bg-muted p-3 rounded-md overflow-x-auto'>
                    {JSON.stringify(selectedContent.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}
            
            <Separator />
            
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-medium mb-1'>Created</h4>
                <p className='text-muted-foreground'>
                  {format(new Date(selectedContent.created_at), 'PPpp')}
                </p>
              </div>
              <div>
                <h4 className='font-medium mb-1'>Last Updated</h4>
                <p className='text-muted-foreground'>
                  {format(new Date(selectedContent.updated_at), 'PPpp')}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}