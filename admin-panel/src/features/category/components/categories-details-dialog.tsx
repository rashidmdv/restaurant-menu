import { format } from 'date-fns'
import { 
  IconCategory,  
  IconId,
  IconFileDescription,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Badge
} from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Category } from '../data/schema'
import { cn } from '@/lib/utils'
import { useCategories } from '../context/categories-context'
import { useQuery } from '@tanstack/react-query'
import { CategoryService } from '@/services/category-service'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Category
}



export function CategoriesDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, categories } = useCategories();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Fetch category details directly from API to get latest data
  const {
    data: categoryDetails,
    isLoading,
  } = useQuery({
    queryKey: ['categories', currentRow.id],
    queryFn: () => CategoryService.getCategoryById(currentRow.id.toString()),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Get data for display
  const category = categoryDetails || currentRow
  
  // Find the category

  
  return (
    <>
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl">
          <img
            src={previewImage || ""}
            alt="Preview"
            className="w-full h-auto max-h-[80vh] object-contain rounded"
          />
        </DialogContent>
      </Dialog>
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isLoading ? (
              <Skeleton className="h-6 w-[240px]" />
            ) : (
              <>
                <span>{category.name}</span>
                
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <>
              {category.image && (
                <div className="rounded-md overflow-hidden h-48 bg-muted flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setPreviewImage(category.image)}
                >
                  <img
                    src={category.image}
                    alt={category.name} 
                    className="max-h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x200?text=No+Image";
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <IconId className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">ID:</span>
                    <span className="ml-2">{category.id}</span>
                  </div>
                  <div className="flex items-center">
                    <IconCategory className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Category:</span>
                    <span className="ml-2">{category.name}</span>
                  </div>
                </div>
              </div>
              <Separator />

                <div className="space-y-2">
                <div className="flex items-center">
                  <IconFileDescription className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Description:</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {category.description || 'No description available.'}
                </p>
                </div>

              

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Active Status:</span>
                  <Badge variant={category.isActive ? 'default' : 'destructive'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div>Created: {category.created_at ? format(new Date(category.created_at), 'PPpp') : '—'}</div>
                <div>Updated: {category.updated_at ? format(new Date(category.updated_at), 'PPpp') : '—'}</div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button 
            onClick={() => {
              setOpen('update'); // directly open edit dialog
            }}
            disabled={isLoading}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}