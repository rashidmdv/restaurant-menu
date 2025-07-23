import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ContentSection } from '../data/schema'
import { contentSectionTypes } from '../data/data'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'

export const columns: ColumnDef<ContentSection>[] = [
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
    accessorKey: 'section_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Section' />
    ),
    cell: ({ row }) => {
      const sectionName = row.getValue('section_name') as string
      const sectionType = contentSectionTypes.find(
        (type) => type.value === sectionName
      )
      
      const Icon = sectionType?.icon
      
      return (
        <div className='flex items-center space-x-2'>
          {Icon && (
            <div className={`w-2 h-2 rounded-full ${sectionType?.color || 'bg-gray-400'}`} />
          )}
          <div className='max-w-[200px]'>
            <div className='font-medium'>{sectionType?.label || sectionName}</div>
            <div className='text-xs text-muted-foreground'>
              {sectionType?.description || sectionName}
            </div>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <div className='max-w-[300px] truncate font-medium'>
          {title || 'No title'}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'content',
    header: 'Content Preview',
    cell: ({ row }) => {
      const content = row.getValue('content') as string
      return (
        <div className='max-w-[200px] truncate text-sm text-muted-foreground'>
          {content ? content.substring(0, 100) + '...' : 'No content'}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('active') as boolean
      return (
        <Badge 
          variant={isActive ? 'default' : 'secondary'}
          className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: true,
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Updated' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('updated_at') as string
      return (
        <div className='text-sm text-muted-foreground'>
          {format(new Date(date), 'MMM dd, yyyy')}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]