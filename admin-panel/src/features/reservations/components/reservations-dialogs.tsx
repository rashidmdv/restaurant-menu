import { useReservations } from '../context/reservations-context'
import { ReservationsMutateDialog } from './reservations-mutate-dialog'
import { ReservationsDetailsDialog } from './reservations-details-dialog'
import { ReservationsDeleteDialog } from './reservations-delete-dialog'

export function ReservationsDialogs() {
  const { open, setOpen, currentRow } = useReservations()

  return (
    <>
      <ReservationsMutateDialog
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
      />
      <ReservationsMutateDialog
        open={open === 'update'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'update' : null)}
        currentRow={currentRow || undefined}
      />
      <ReservationsDetailsDialog
        open={open === 'details'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'details' : null)}
        reservation={currentRow}
      />
      <ReservationsDeleteDialog
        open={open === 'delete'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'delete' : null)}
        reservation={currentRow}
      />
    </>
  )
}
