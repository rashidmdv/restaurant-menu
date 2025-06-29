import { useState } from 'react'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import {
  IconCalendar,
  IconCar,
  IconBrandToyota,
  IconPhoto,
  IconId,
  IconFileDescription,
} from '@tabler/icons-react'
import { ItemService } from '@/services/item-service'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useItems } from '../context/items-context'
import { Item } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Item
}

export function ItemsDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, subcategories } = useItems()
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch item details directly from API to get latest data
  const { data: itemDetails, isLoading } = useQuery({
    queryKey: ['items', currentRow.id],
    queryFn: () => ItemService.getItemById(currentRow.id.toString()),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get data for display
  const item = itemDetails || currentRow

  // Find the subcategory
  const subcategory = item.sub_category || subcategories.find((s) => s.id === item.sub_category_id)

  return (
    <>
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className='max-w-3xl'>
          <img
            src={previewImage || ''}
            alt='Preview'
            className='h-auto max-h-[80vh] w-full rounded object-contain'
          />
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-[750px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center justify-between'>
              {isLoading ? (
                <Skeleton className='h-6 w-[240px]' />
              ) : (
                <>
                  <span>{item.name}</span>
                  <Badge
                    className={cn(
                      'ml-2',
                      item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            {isLoading ? (
              <div className='space-y-4'>
                <Skeleton className='h-48 w-full' />
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-full' />
                  </div>
                  <div className='space-y-4'>
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-full' />
                  </div>
                </div>
                <Skeleton className='h-24 w-full' />
              </div>
            ) : (
              <>
                {item.image_url && (
                  <div className='rounded-lg border bg-gray-50 p-4'>
                    <div className='flex h-48 w-full items-center justify-center overflow-hidden rounded-md border'>
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className='h-full object-contain cursor-pointer'
                        onClick={() => setPreviewImage(item.image_url!)}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/300x200?text=No+Image'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* === BASIC INFO + PRICING === */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-3'>
                    <div className='text-muted-foreground mb-1 text-sm font-semibold'>
                      Basic Info
                    </div>
                    <div className='flex items-center text-sm'>
                      <IconId className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>ID:</span>
                      <span className='ml-2'>{item.id}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <IconCar className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>Item Name:</span>
                      <span className='ml-2'>{item.name}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <IconBrandToyota className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>Sub-Category:</span>
                      <span className='ml-2'>
                        {subcategory?.name || '—'}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='font-medium'>Display Order:</span>
                      <span className='ml-2'>{item.display_order}</span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='text-muted-foreground mb-1 text-sm font-semibold'>
                      Pricing & Status
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>Price:</span>
                      <span>
                        {item.currency} {item.price?.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>Currency:</span>
                      <span>{item.currency}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>Available:</span>
                      <Badge variant={item.available ? 'default' : 'destructive'}>
                        {item.available ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* === DIETARY INFO === */}
                {item.dietary_info &&
                  typeof item.dietary_info === 'object' &&
                  Object.keys(item.dietary_info).length > 0 && (
                    <div className='mt-6'>
                      <div className='text-muted-foreground mb-2 text-sm font-semibold'>
                        Dietary Information
                      </div>
                      <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-sm'>
                        {Object.entries(item.dietary_info).map(
                          ([key, value]) => (
                            <li key={key}>
                              <span className='font-medium capitalize'>
                                {key.replace('_', ' ')}:
                              </span>{' '}
                              {String(value) || '—'}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                <Separator />

                {/* === DESCRIPTION === */}
                <div className='space-y-2'>
                  <div className='text-muted-foreground flex items-center text-sm font-semibold'>
                    <IconFileDescription className='text-muted-foreground mr-2 h-4 w-4' />
                    Description
                  </div>
                  <p className='text-muted-foreground pl-6 text-sm'>
                    {item.description || 'No description available.'}
                  </p>
                </div>

                {/* === TIMESTAMPS === */}
                <div className='mt-4 space-y-2'>
                  <div className='text-muted-foreground text-sm'>
                    <div className='flex items-center'>
                      <IconCalendar className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>Created At:</span>
                      <span className='ml-2'>
                        {item.created_at
                          ? format(new Date(item.created_at), 'PPpp')
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    <div className='flex items-center'>
                      <IconCalendar className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>Updated At:</span>
                      <span className='ml-2'>
                        {item.updated_at
                          ? format(new Date(item.updated_at), 'PPpp')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
            <Button
              onClick={() => {
                setOpen('update') // directly open edit dialog
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
