import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Item } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Item>[] = [
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
      <DataTableColumnHeader column={column} title='Item Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {name}
          </span>
        </div>
      )
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
          {value || '—'}
        </div>
      )
    },
  },

  {
    accessorKey: 'sub_category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sub-Category' />
    ),
    cell: ({ row }) => {
      const subCategory = row.original.sub_category
      const subCategoryName = subCategory ? subCategory.name : '—'
      
      return <span>{subCategoryName}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.sub_category_id.toString())
    },
  },

  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      const currency = row.original.currency || 'AED'
      return (
        <span className="font-medium">
          {currency} {price.toFixed(2)}
        </span>
      )
    },
  },

  {
    accessorKey: 'image_url',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => {
      const imageUrl = row.getValue('image_url') as string | undefined

      if (!imageUrl) {
        return <span className="text-muted-foreground italic">No image</span>
      }

      return (
        <div
          className="h-10 w-10 rounded-md overflow-hidden border border-muted shadow-sm cursor-pointer"
          title="Click to preview"
          onClick={() => window.open(imageUrl, '_blank')}
        >
          <img
            src={imageUrl}
            alt="Item"
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-150"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/40x40?text=No+Image"
            }}
          />
        </div>
      )
    },
  },

  {
    accessorKey: 'display_order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ row }) => {
      const order = row.getValue('display_order') as number
      return <span>{order}</span>
    },
  },

  {
    accessorKey: 'available',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isAvailable = row.getValue('available') as boolean
      return (
        <div className='flex w-[100px] items-center'>
          <Badge variant={isAvailable ? 'default' : 'destructive'}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const filterValues = value as string[]
      const rowValue = row.getValue(id) as boolean
      return filterValues.some(val => String(rowValue) === val)
    },
  },

  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('created_at') as string
      const date = new Date(dateStr)
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
        </div>
      )
    },
  },

  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ row }) => {
      const dateStr = row.getValue('updated_at') as string
      const date = new Date(dateStr)
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
        </div>
      )
    },
  },

  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]