import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Reservation, statusColors } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const columns: ColumnDef<Reservation>[] = [
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
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Guest Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('full_name') as string
      return <span className="font-medium">{name || '—'}</span>
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => {
      const email = row.getValue('email') as string
      return (
        <a
          href={`mailto:${email}`}
          className="text-blue-600 hover:underline text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {email}
        </a>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return (
        <a
          href={`tel:${phone}`}
          className="text-blue-600 hover:underline text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {phone}
        </a>
      )
    },
  },
  {
    accessorKey: 'reservation_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('reservation_date') as string
      try {
        const date = new Date(dateStr)
        return <span className="text-sm">{format(date, 'MMM dd, yyyy')}</span>
      } catch {
        return <span className="text-sm">{dateStr}</span>
      }
    },
  },
  {
    accessorKey: 'reservation_time',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Time' />
    ),
    cell: ({ row }) => {
      const time = row.getValue('reservation_time') as string
      return <span className="text-sm font-medium">{time}</span>
    },
  },
  {
    accessorKey: 'number_of_guests',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Guests' />
    ),
    cell: ({ row }) => {
      const guests = row.getValue('number_of_guests') as number
      return (
        <span className="text-sm">
          {guests} {guests === 1 ? 'guest' : 'guests'}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Reservation['status']
      return (
        <div className='flex w-[100px] items-center'>
          <Badge variant='outline' className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const filterValues = value as string[];
      const rowValue = row.getValue(id) as string;
      return filterValues.includes(rowValue);
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('created_at') as string
      try {
        const date = new Date(dateStr)
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, 'MMM dd, yyyy HH:mm')}
          </div>
        )
      } catch {
        return <div className="text-sm text-muted-foreground">—</div>
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
