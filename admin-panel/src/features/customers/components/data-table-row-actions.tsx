// File: web/src/features/customers/components/data-table-row-actions.tsx

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconShoppingCart, IconMessageCircle, IconTag, IconUserEdit, IconUserMinus, IconCrown, IconUserCheck } from '@tabler/icons-react'
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
import { useCustomers } from '../context/customers-context'
import { customerSchema } from '../data/schema'
import { segments } from '../data/data'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const customer = customerSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useCustomers()

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
            setCurrentRow(customer)
            setOpen('details')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(customer)
            setOpen('update')
          }}
        >
          <IconUserEdit className="mr-2 h-4 w-4" />
          Edit Customer
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(customer)
            setOpen('orders')
          }}
        >
          <IconShoppingCart className="mr-2 h-4 w-4" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(customer)
            setOpen('interactions')
          }}
        >
          <IconMessageCircle className="mr-2 h-4 w-4" />
          View Conversations
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconCrown className="mr-2 h-4 w-4" />
            Update Segment
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {segments.map((segment) => (
              <DropdownMenuItem key={segment.value} disabled={customer.segment === segment.value}>
                <segment.icon className="mr-2 h-4 w-4" />
                {segment.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconTag className="mr-2 h-4 w-4" />
            Manage Tags
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem>
              Remove Tags
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            // Handle block/unblock logic
          }}
          className={customer.status === 'blocked' ? "text-green-600" : "text-amber-600"}
        >
          {customer.status === 'blocked' ? (
            <>
              <IconUserCheck className="mr-2 h-4 w-4" />
              Unblock Customer
            </>
          ) : (
            <>
              <IconUserMinus className="mr-2 h-4 w-4" />
              Block Customer
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(customer)
            setOpen('delete')
          }}
          className="text-red-600"
        >
          Delete Customer
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}