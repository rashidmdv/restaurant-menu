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
import { VehicleModel, VehicleStatus, VehicleType } from '../data/schema'
import { cn } from '@/lib/utils'
import { useModels } from '../context/models-context'
import { useQuery } from '@tanstack/react-query'
import { VehicleService } from '@/services/vehicle-service'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VehicleModel
}

// Status mapping for colors
const statusColorMap: Record<string, string> = {
  [VehicleStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [VehicleStatus.DISCONTINUED]: 'bg-red-100 text-red-800',
  [VehicleStatus.UPCOMING]: 'bg-blue-100 text-blue-800',
  [VehicleStatus.LIMITED]: 'bg-yellow-100 text-yellow-800',
  [VehicleStatus.PRODUCTION]: 'bg-indigo-100 text-indigo-800',
}

// Type/label mapping
const typeLabels: Record<string, string> = {
  [VehicleType.SEDAN]: 'Sedan',
  [VehicleType.SUV]: 'SUV',
  [VehicleType.HATCHBACK]: 'Hatchback',
  [VehicleType.TRUCK]: 'Truck',
  [VehicleType.COUPE]: 'Coupe',
}

export function ModelsDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, makes } = useModels()
  
  // Fetch model details directly from API to get latest data
  const {
    data: modelDetails,
    isLoading,
  } = useQuery({
    queryKey: ['vehicle-model', currentRow.id],
    queryFn: () => VehicleService.getModelById(currentRow.id),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Get data for display
  const model = modelDetails || currentRow
  
  // Get type and status labels
  let typeLabel = '';
  let statusLabel = '';
  let statusColor = '';
  
  // Handle different ways type/status might be available
  if (model.typeInfo && typeof model.typeInfo === 'object' && model.typeInfo.label) {
    typeLabel = model.typeInfo.label;
  } else if (model.type && typeLabels[model.type]) {
    typeLabel = typeLabels[model.type];
  }
  
  if (model.statusInfo && typeof model.statusInfo === 'object' && model.statusInfo.label) {
    statusLabel = model.statusInfo.label;
  } else if (model.status && VehicleStatus[model.status.toUpperCase()]) {
    statusLabel = model.status.charAt(0).toUpperCase() + model.status.slice(1);
    statusColor = statusColorMap[model.status] || '';
  }
  
  // Find the make
  const make = model.make || makes.find((m) => m.id === model.makeId)

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
                <span>{model.name} ({model.year})</span>
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
              {model.image && (
                <div className="rounded-md overflow-hidden h-48 bg-muted flex items-center justify-center">
                  <img 
                    src={model.image} 
                    alt={model.name} 
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
                    <span className="ml-2">{model.id}</span>
                  </div>
                  <div className="flex items-center">
                    <IconCar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Model Name:</span>
                    <span className="ml-2">{model.name}</span>
                  </div>
                  <div className="flex items-center">
                    <IconBrandToyota className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Make:</span>
                    <span className="ml-2">
                      {model.makeName || make?.name || model.makeId || '—'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Year:</span>
                    <span className="ml-2">{model.year}</span>
                  </div>
                  <div className="flex items-center">
                    <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">From Date:</span>
                    <span className="ml-2">
                      {model.fromDate ? format(new Date(model.fromDate), 'MMM dd, yyyy') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">To Date:</span>
                    <span className="ml-2">
                      {model.toDate ? format(new Date(model.toDate), 'MMM dd, yyyy') : '—'}
                    </span>
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
                  {model.description || 'No description available.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Type:</span>
                  {typeLabel && <Badge variant="outline">{typeLabel}</Badge>}
                  {!typeLabel && <span className="text-muted-foreground">—</span>}
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Active Status:</span>
                  <Badge variant={model.isActive ? 'default' : 'destructive'}>
                    {model.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created at {model.createdAt ? format(new Date(model.createdAt), 'PPpp') : '—'}
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