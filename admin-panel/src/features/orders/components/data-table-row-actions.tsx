import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconPrinter, IconTruck } from '@tabler/icons-react'
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
import { useOrders } from '../context/orders-context'
import { statuses } from '../data/data'
import { orderSchema } from '../data/schema'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const order = orderSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useOrders()

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
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(order)
            setOpen('details')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(order)
            setOpen('update')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem>
          <IconPrinter className="mr-2 h-4 w-4" />
          Print Invoice
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconTruck className="mr-2 h-4 w-4" />
            Update Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {statuses.map((status) => (
              <DropdownMenuItem key={status.value} disabled={order.status === status.value}>
                <status.icon className="mr-2 h-4 w-4" />
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(order)
            setOpen('delete')
          }}
          className="text-red-600"
        >
          Delete Order
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}