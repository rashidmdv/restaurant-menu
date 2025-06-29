import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { VehicleVariant, VehicleType } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

// Map for vehicle types
const vehicleTypeLabels = {
  [VehicleType.SEDAN]: 'Sedan',
  [VehicleType.SUV]: 'SUV',
  [VehicleType.HATCHBACK]: 'Hatchback',
  [VehicleType.TRUCK]: 'Truck',
  [VehicleType.COUPE]: 'Coupe',
}

// Map for vehicle statuses
// const vehicleStatusLabels = {
//   [VehicleStatus.ACTIVE]: { label: 'Active', variant: 'default' },
//   [VehicleStatus.DISCONTINUED]: { label: 'Discontinued', variant: 'destructive' },
//   [VehicleStatus.UPCOMING]: { label: 'Upcoming', variant: 'outline' },
//   [VehicleStatus.LIMITED]: { label: 'Limited', variant: 'secondary' },
//   [VehicleStatus.PRODUCTION]: { label: 'In Production', variant: 'default' },
// }

export const columns: ColumnDef<VehicleVariant>[] = [
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
    accessorKey: 'model',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Model' />
    ),
    cell: ({ row }) => {
      // Get model name from different possible sources
      const model = row.original.model
      const modelName = row.original.modelName || (model ? model.name : null)
      const modelId = row.original.modelId
      
      return <span>{modelName || modelId || '—'}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.modelId)
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Variant' />
    ),
    cell: ({ row }) => {
      // Get the vehicle type either from type or typeInfo
      const type = row.original.type as VehicleType | null | undefined
      const typeInfo = row.original.typeInfo as { value: string, label: string } | null | undefined
      
      const typeLabel = typeInfo?.label || (type ? vehicleTypeLabels[type] : null)

      return (
        <div className='flex space-x-2'>
          {typeLabel && <Badge variant='outline'>{typeLabel}</Badge>}
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
  },
  
   {
    accessorKey: 'engineType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Engine Type' />
    ),
    cell: ({ row }) => <span>{row.getValue('engineType')}</span>,
  },
  {
    accessorKey: 'transmission',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transmission' />
    ),
    cell: ({ row }) => <span>{row.getValue('transmission')}</span>,
  },
  {
    accessorKey: 'bodyType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Body Type' />
    ),
    cell: ({ row }) => <span>{row.getValue('bodyType')}</span>,
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
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]