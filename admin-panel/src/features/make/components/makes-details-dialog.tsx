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
import { VehicleMake, VehicleStatus, VehicleType } from '../data/schema'
import { cn } from '@/lib/utils'
import { useMakes } from '../context/makes-context'
import { useQuery } from '@tanstack/react-query'
import { VehicleService } from '@/services/make-service'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: VehicleMake
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

export function MakesDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen, makes } = useMakes()
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  
  // Fetch make details directly from API to get latest data
  const {
    data: makeDetails,
    isLoading,
  } = useQuery({
    queryKey: ['vehicle-make', currentRow.id],
    queryFn: () => VehicleService.getMakeById(currentRow.id),
    enabled: open,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Get data for display
  const make = makeDetails || currentRow
  
  // Get type and status labels
  let typeLabel = '';
  let statusLabel = '';
  let statusColor = '';
  
  // Handle different ways type/status might be available
  if (make.typeInfo && typeof make.typeInfo === 'object' && make.typeInfo.label) {
    typeLabel = make.typeInfo.label;
  } else if (make.type && typeLabels[make.type]) {
    typeLabel = typeLabels[make.type];
  }
  
  if (make.statusInfo && typeof make.statusInfo === 'object' && make.statusInfo.label) {
    statusLabel = make.statusInfo.label;
  } else if (make.status && VehicleStatus[make.status.toUpperCase()]) {
    statusLabel = make.status.charAt(0).toUpperCase() + make.status.slice(1);
    statusColor = statusColorMap[make.status] || '';
  }
  
  // Find the make
  //const make = make.make || makes.find((m) => m.id === make.makeId)
  const parentMake = make.make || makes.find((m) => m.id === make.makeId)
  
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
                <span>{make.name}</span>
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
              {make.logo && (
                
                <div className="rounded-md overflow-hidden h-48 bg-muted flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                
                  onClick={() => setPreviewImage(make.logo)}
                >
                  
                  <img 
                    src={make.logo} 
                    alt={make.name} 
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
                    <span className="ml-2">{make.id}</span>
                  </div>
                  <div className="flex items-center">
                    <IconCar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">Make:</span>
                    <span className="ml-2">{make.name}</span>
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
                  {make.description || 'No description available.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Active Status:</span>
                  <Badge variant={make.isActive ? 'default' : 'destructive'}>
                    {make.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created at {make.createdAt ? format(new Date(make.createdAt), 'PPpp') : '—'}
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