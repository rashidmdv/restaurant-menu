// File: web/src/features/customers/components/columns.tsx

import { ColumnDef } from '@tanstack/react-table'
import { format, formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { getSegmentColor, getStatusColor, segments, sources, statuses } from '../data/data'
import { Customer } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const columns: ColumnDef<Customer>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Customer' />
    ),
    cell: ({ row }) => {
      const customerName = row.getValue('name') as string
      const initials = customerName.split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
      
      return (
        <div className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='text-xs'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='flex flex-col'>
            <span className='font-medium'>{customerName}</span>
            <span className='text-xs text-muted-foreground'>{row.original.phone}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string | undefined
      return (
        <div className='truncate max-w-[180px]'>
          {email || <span className='text-muted-foreground text-xs'>Not provided</span>}
        </div>
      )
    },
  },
  {
    accessorKey: 'totalOrders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Orders' />
    ),
    cell: ({ row }) => {
      const totalOrders = row.getValue('totalOrders') as number
      return (
        <div className='font-medium text-center'>{totalOrders}</div>
      )
    },
  },
  {
    accessorKey: 'totalSpent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Spent' />
    ),
    cell: ({ row }) => {
      const totalSpent = row.getValue('totalSpent') as number
      return (
        <div className='font-medium text-right'>
          ₹{totalSpent.toLocaleString('en-IN')}
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
        (s) => s.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      return (
        <div className='flex items-center'>
          <span className={`h-2 w-2 rounded-full ${getStatusColor(row.getValue('status'))}`} />
          <span className='ml-2'>{status.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'segment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Segment' />
    ),
    cell: ({ row }) => {
      const segment = segments.find(
        (s) => s.value === row.getValue('segment')
      )

      if (!segment) {
        return null
      }

      return (
        <div className='flex items-center'>
          <Badge className={getSegmentColor(row.getValue('segment'))}>
            {segment.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'source',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    cell: ({ row }) => {
      const source = sources.find(
        (s) => s.value === row.getValue('source')
      )

      if (!source) {
        return null
      }

      const SourceIcon = source.icon

      return (
        <div className='flex items-center'>
          {SourceIcon && <SourceIcon className='mr-2 h-4 w-4 text-muted-foreground' />}
          <span>{source.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'lastInteraction',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Activity' />
    ),
    cell: ({ row }) => {
      const lastInteraction = row.getValue('lastInteraction') as string | undefined
      
      if (!lastInteraction) {
        return <span className='text-muted-foreground text-xs'>Never</span>
      }
      
      const date = new Date(lastInteraction)
      
      return (
        <div title={format(date, 'PPpp')}>
          {formatDistanceToNow(date, { addSuffix: true })}
        </div>
      )
    },
  },
  {
    accessorKey: 'memberSince',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Member Since' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('memberSince'))
      return (
        <div>{format(date, 'MMM dd, yyyy')}</div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]