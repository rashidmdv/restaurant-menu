import { format } from 'date-fns'
import { 
  IconCalendar, 
  IconCar,
  IconBrandToyota,
  IconPhoto,
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
import { VehicleVariant, VehicleType } from '../data/schema'
import { cn } from '@/lib/utils'
import { useVariants } from '../context/variants-context'
import { useQuery } from '@tanstack/react-query'
import { VehicleService } from '@/services/variant-service'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VehicleVariant
}

// Status mapping for colors
// const statusColorMap: Record<string, string> = {
//   [VehicleStatus.ACTIVE]: 'bg-green-100 text-green-800',
//   [VehicleStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
//   [VehicleStatus.UPCOMING]: 'bg-blue-100 text-blue-800',
//   [VehicleStatus.LIMITED]: 'bg-yellow-100 text-yellow-800',
//   [VehicleStatus.PRODUCTION]: 'bg-indigo-100 text-indigo-800',
// }

// Type/label mapping
const typeLabels: Record<string, string> = {
  [VehicleType.SEDAN]: 'Sedan',
  [VehicleType.SUV]: 'SUV',
  [VehicleType.HATCHBACK]: 'Hatchback',
  [VehicleType.TRUCK]: 'Truck',
  [VehicleType.COUPE]: 'Coupe',
}

export function VariantsDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, models } = useVariants()
  
  // Fetch variant details directly from API to get latest data
  const {
    data: variantDetails,
    isLoading,
  } = useQuery({
    queryKey: ['vehicle-variant', currentRow.id],
    queryFn: () => VehicleService.getVariantById(currentRow.id),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Get data for display
  const variant = variantDetails || currentRow
  
  // Get type and status labels
  let typeLabel = '';
  let statusLabel = '';
  let statusColor = '';
  
  // Handle different ways type/status might be available
  if (variant.typeInfo && typeof variant.typeInfo === 'object' && variant.typeInfo.label) {
    typeLabel = variant.typeInfo.label;
  } else if (variant.type && typeLabels[variant.type]) {
    typeLabel = typeLabels[variant.type];
  }
  
  // if (variant.statusInfo && typeof variant.statusInfo === 'object' && variant.statusInfo.label) {
  //   statusLabel = variant.statusInfo.label;
  // } else if (variant.status && VehicleStatus[variant.status.toUpperCase()]) {
  //   statusLabel = variant.status.charAt(0).toUpperCase() + variant.status.slice(1);
  //   statusColor = statusColorMap[variant.status] || '';
  // }
  
  // Find the model
  const model = variant.model || models.find((m) => m.id === variant.modelId)

  return (
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
                <span>{variant.name} </span>
                {statusLabel && (
                  <Badge className={cn("ml-2", statusColor || "bg-gray-100 text-gray-800")}>
                    {statusLabel}
                  </Badge>
                )}
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
              {variant.image && (
                <div className="rounded-md overflow-hidden h-48 bg-muted flex items-center justify-center">
                  <img 
                    src={variant.image} 
                    alt={variant.name} 
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
                    <span className="ml-2">{variant.id}</span>
                  </div>
                  <div className="flex items-center">
                    <IconCar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Variant Name:</span>
                    <span className="ml-2">{variant.name}</span>
                  </div>
                  <div className="flex items-center">
                    <IconBrandToyota className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Model:</span>
                    <span className="ml-2">
                      {variant.modelName || model?.name || variant.modelId || '—'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    {/* Car body icon for Body Type */}
                    <IconCar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium mr-2">Body Type:</span>
                    <span>{variant.bodyType || variant.bodytype || '—'}</span>
                  </div>
                  <div className="flex items-center">
                    {/* Engine icon for Engine Type */}
                    <svg className="h-4 w-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path d="M3 10v4a2 2 0 0 0 2 2h2v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2z" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span className="font-medium mr-2">Engine Type:</span>
                    <span>{variant.engineType || variant.enginetype || '—'}</span>
                  </div>
                  <div className="flex items-center">
                    {/* Transmission icon */}
                    <svg className="h-4 w-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                      <path d="M12 7v3m0 2v3m0 2v2" />
                    </svg>
                    <span className="font-medium mr-2">Transmission:</span>
                    <span>{variant.transmission || '—'}</span>
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
                  {variant.description || 'No description available.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Active Status:</span>
                  <Badge variant={variant.isActive ? 'default' : 'destructive'}>
                    {variant.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created at {variant.createdAt ? format(new Date(variant.createdAt), 'PPpp') : '—'}
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
  )
}