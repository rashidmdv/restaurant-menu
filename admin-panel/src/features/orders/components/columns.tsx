// File: web/src/features/orders/components/columns.tsx

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { paymentMethods, paymentStatuses, priorities, statuses } from '../data/data'
import { Order } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order ID' />
    ),
    cell: ({ row }) => <div className='w-[80px] font-medium'>{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>{row.getValue('customerName')}</span>
          <span className='text-xs text-muted-foreground'>{row.original.customerPhone}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('orderDate'))
      return (
        <div className='flex flex-col'>
          <span>{format(date, 'MMM dd, yyyy')}</span>
          <span className='text-xs text-muted-foreground'>{format(date, 'hh:mm a')}</span>
        </div>
      )
    },
    sortingFn: 'datetime',
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex gap-2 font-medium'>
          {row.getValue('totalAmount')}
          <span className='text-xs text-muted-foreground whitespace-nowrap'>
            ({row.original.orderItems} {row.original.orderItems === 1 ? 'item' : 'items'})
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status.icon && (
            <status.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Method' />
    ),
    cell: ({ row }) => {
      const paymentMethod = paymentMethods.find(
        (method) => method.value === row.getValue('paymentMethod')
      )

      if (!paymentMethod) {
        return null
      }

      return (
        <div className='flex items-center'>
          {paymentMethod.icon && (
            <paymentMethod.icon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{paymentMethod.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Status' />
    ),
    cell: ({ row }) => {
      const status = paymentStatuses.find(
        (status) => status.value === row.getValue('paymentStatus')
      )

      if (!status) {
        return null
      }

      const statusColorMap: Record<string, string> = {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-blue-100 text-blue-800',
      }

      return (
        <div className='flex items-center'>
          <Badge className={`${statusColorMap[row.getValue('paymentStatus')]}`}>
            {status.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Priority' />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center'>
          {priority.icon && (
            <priority.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]