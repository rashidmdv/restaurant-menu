import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CatalogBrand } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'



export const columns: ColumnDef<CatalogBrand>[] = [
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
  // No ID column at all - starting with the name directly
  {
  accessorKey: 'name',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='Brand' />
  ),
  cell: ({ row }) => {
    const name = row.getValue('name') as string
    return <span>{name || '—'}</span>
  },
},

  {
  accessorKey: 'description',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='Description' />
  ),
  cell: ({ row }) => {
    const value = row.getValue('description') as string
    return (
      <div
        title={value}
        className="max-w-[300px] line-clamp-2 overflow-hidden text-ellipsis whitespace-normal text-sm leading-snug"
      >
        {value}
      </div>
    )
  },
},
{
  accessorKey: 'logo',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='Logo' />
  ),
  cell: ({ row }) => {
    const image = row.getValue('logo') as string
    return image ? (
      <img
        src={image}
        alt="brand"
        className="h-10 w-10 rounded-md object-cover"
      />
    ) : (
      <span className="text-muted-foreground">—</span>
    )
  },
},

  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Active Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <div className='flex w-[100px] items-center'>
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      // Convert string representation of boolean to actual boolean for comparison
      const filterValues = value as string[];
      const rowValue = row.getValue(id) as boolean;
      return filterValues.some(val => String(rowValue) === val);
    },
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('createdAt') as string | undefined
      return dateStr ? (
        <span>{new Date(dateStr).toLocaleString()}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )
    },
  },
  {
  accessorKey: 'updatedAt',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='Updated At' />
  ),
  cell: ({ row }) => {
  const rawDate = row.getValue('createdAt')
  const dateStr = typeof rawDate === 'string' ? rawDate : undefined

  return dateStr ? (
    <span>{new Date(dateStr).toLocaleString()}</span>
  ) : (
    <span className="text-muted-foreground">—</span>
  )
},

},
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]