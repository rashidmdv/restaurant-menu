import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Reservation, statusColors } from '../data/schema'
import { format } from 'date-fns'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
}

export function ReservationsDetailsDialog({ open, onOpenChange, reservation }: Props) {
  if (!reservation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reservation Details</DialogTitle>
          <DialogDescription>
            View complete reservation information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm">{reservation.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant="outline" className={statusColors[reservation.status]}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <a href={`mailto:${reservation.email}`} className="text-sm text-blue-600 hover:underline">
                {reservation.email}
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <a href={`tel:${reservation.phone}`} className="text-sm text-blue-600 hover:underline">
                {reservation.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-sm font-semibold">
                {format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">{reservation.reservation_time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guests</p>
              <p className="text-sm font-semibold">
                {reservation.number_of_guests} {reservation.number_of_guests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>

          {reservation.special_requests && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Special Requests</p>
              <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {reservation.special_requests}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Created</p>
              <p className="text-xs">{format(new Date(reservation.created_at), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
              <p className="text-xs">{format(new Date(reservation.updated_at), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
