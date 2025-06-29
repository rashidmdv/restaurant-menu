import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CatalogSubCategory } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<CatalogSubCategory>[] = [
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
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Category' />
      ),
      cell: ({ row }) => {
        // Get category name from different possible sources
        const category = row.original.category
        const categoryName = row.original.categoryName || (category ? category.name : null)
        const categoryId = row.original.categoryId
        
        return <span>{categoryName || categoryId || '—'}</span>
      },
      filterFn: (row, id, value) => {
        return value.includes(row.original.categoryId)
      },
    },

  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sub-Category' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return <span>{name || '—'}</span>
    },
  },

    {
    accessorKey: 'image',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Image' />
    ),
    cell: ({ row }) => {
    const image = row.getValue('image') as string
    return image ? (
      <img
        src={image}
        alt="task"
        className="h-10 w-10 rounded-md object-cover"
      />
    ) : (
      <span className="text-muted-foreground">—</span>
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
          {value}
        </div>
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]