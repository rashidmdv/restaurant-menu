import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useReservations } from '../context/reservations-context'
import { Reservation } from '../data/schema'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
}

export function ReservationsDeleteDialog({ open, onOpenChange, reservation }: Props) {
  const { deleteReservation } = useReservations()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!reservation) return

    try {
      setLoading(true)
      await deleteReservation(reservation.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting reservation:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!reservation) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the reservation for <strong>{reservation.full_name}</strong> on{' '}
            <strong>{reservation.reservation_date}</strong> at <strong>{reservation.reservation_time}</strong>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90">
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
