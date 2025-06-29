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
import { CatalogService } from '@/services/item-service'
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
import { CatalogItem, VehicleType } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: CatalogItem
}

export function ItemsDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, subcategories, brands } = useItems()
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Fetch item details directly from API to get latest data
  const { data: itemDetails, isLoading } = useQuery({
    queryKey: ['catalog-items', currentRow.id],
    queryFn: () => CatalogService.getItemById(currentRow.id),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Get data for display
  const item = itemDetails || currentRow

  // Get type and status labels

  let statusLabel = ''
  let statusColor = ''

  // Find the subcategory and brand

  const subcategory =
    item.subCategory || subcategories.find((s) => s.id === item.subCategoryId)
  const brand = item.brand || brands.find((b) => b.id === item.brandId)

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
                  <span>{item.name} </span>
                  {statusLabel && (
                    <Badge
                      className={cn(
                        'ml-2',
                        statusColor || 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {statusLabel}
                    </Badge>
                  )}
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
                {item.images &&
                Array.isArray(item.images) &&
                item.images.length > 0 ? (
                  <div className='rounded-lg border bg-gray-50 p-4'>
                    <div className='flex gap-3 overflow-x-auto pb-1'>
                      {item.images.map((img: string, idx: number) => (
                        <div
                          key={img}
                          onClick={() => setPreviewImage(img)}
                          className='h-28 min-w-[120px] flex-shrink-0 cursor-pointer overflow-hidden rounded-md border bg-white shadow-sm transition-transform hover:scale-105'
                        >
                          <img
                            src={img}
                            alt={`${item.name} image ${idx + 1}`}
                            className='h-full w-full object-cover'
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/120x112?text=No+Image'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : item.images && typeof item.images === 'string' ? (
                  <div className='rounded-lg border bg-gray-50 p-4'>
                    <div className='flex h-48 w-full items-center justify-center overflow-hidden rounded-md border'>
                      <img
                        src={item.images}
                        alt={item.name}
                        className='h-full object-contain'
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/300x200?text=No+Image'
                        }}
                      />
                    </div>
                  </div>
                ) : null}

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
                        {item.subcategoryName ||
                          subcategory?.name ||
                          item.subCategoryId ||
                          '—'}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <IconBrandToyota className='text-muted-foreground mr-2 h-4 w-4' />
                      <span className='font-medium'>Brand:</span>
                      <span className='ml-2'>
                        {item.brandName || brand?.name || item.brandId || '—'}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='text-muted-foreground mb-1 text-sm font-semibold'>
                      Pricing & Stock
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>SKU:</span>
                      <span>{item.sku || '—'}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>Price:</span>
                      <span>
                        {item.price !== undefined ? `₹${item.price}` : '—'}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='w-32 font-medium'>Stock Quantity:</span>
                      <span>
                        {item.stockQuantity !== undefined
                          ? item.stockQuantity
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* === SPECIFICATIONS === */}
                {item.specifications &&
                  typeof item.specifications === 'object' && (
                    <div className='mt-6'>
                      <div className='text-muted-foreground mb-2 text-sm font-semibold'>
                        Specifications
                      </div>
                      <ul className='text-muted-foreground list-disc space-y-1 pl-4 text-sm'>
                        {Object.entries(item.specifications).map(
                          ([key, value]) => (
                            <li key={key}>
                              <span className='font-medium capitalize'>
                                {key}:
                              </span>{' '}
                              {value || '—'}
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

                {/* === STATUS & TIMESTAMP === */}
                <div className='mt-4 flex flex-wrap items-center gap-4'>
                  <div className='flex items-center text-sm'>
                    <span className='mr-2 font-medium'>Active Status:</span>
                    <Badge variant={item.isActive ? 'default' : 'destructive'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    Created at:{' '}
                    {item.createdAt
                      ? format(new Date(item.createdAt), 'PPpp')
                      : '—'}
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
