import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useReservations } from '../context/reservations-context'

export function ReservationsPrimaryButtons() {
  const { setOpen } = useReservations()

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => setOpen('create')} size="sm">
        <IconPlus className="mr-2 h-4 w-4" />
        Create Reservation
      </Button>
    </div>
  )
}
