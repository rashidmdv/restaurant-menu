import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconEdit, IconCheck, IconX, IconClock, IconCalendarCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useReservations } from '../context/reservations-context'
import { Reservation } from '../data/schema'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const original = row.original as unknown as Reservation
  const { setOpen, setCurrentRow, updateReservationStatus } = useReservations()

  const handleStatusChange = async (status: string) => {
    try {
      await updateReservationStatus(original.id, status)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('details')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('update')
          }}
        >
          <IconEdit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconCalendarCheck className="mr-2 h-4 w-4" />
            Change Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
              <IconClock className="mr-2 h-4 w-4 text-yellow-600" />
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('confirmed')}>
              <IconCheck className="mr-2 h-4 w-4 text-green-600" />
              Confirmed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
              <IconCalendarCheck className="mr-2 h-4 w-4 text-gray-600" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange('cancelled')}>
              <IconX className="mr-2 h-4 w-4 text-red-600" />
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
