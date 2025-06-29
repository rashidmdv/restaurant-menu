import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { CatalogItem, VehicleType } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'


export const columns: ColumnDef<CatalogItem>[] = [
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
      <DataTableColumnHeader column={column} title='Items' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'sku',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => <span>{row.getValue('sku')}</span>,    
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
       accessorKey: 'price',
       header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Price' />
       ),
       cell: ({ row }) => {
        const price = row.getValue('price');
        const priceNumber = typeof price === 'number' ? price : Number(price);
        return (
          <span>
           {isNaN(priceNumber) ? '—' : `₹${priceNumber.toFixed(2)}`}
          </span>
        )
      },
    },
      {
        accessorKey: 'stockQuantity',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Stock Quantity' />
        ),
        cell: ({ row }) => {
          const stock = Number(row.getValue('stockQuantity'));
          const isInStock = stock > 0;
          return (
            <div className="flex w-[120px] items-center">
              <Badge
                variant={isInStock ? 'default' : 'destructive'}
                className={isInStock ? 'bg-green-500 text-white hover:bg-green-600' : ''}
              >
                {isInStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
              <span className="ml-2 font-semibold">{stock}</span>
            </div>
            )
          },
        },
        
        {
          accessorKey: 'specifications',
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Specifications' />
          ),
          cell: ({ row }) => {
      const specs = row.original.specifications as Record<string, string> | undefined;
      if (!specs) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex flex-col gap-1 text-xs">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key}>
              <span className="font-semibold">{key}:</span> {value}
            </div>
          ))}
        </div>
      )
        },
        },

        {
  accessorKey: 'images',
  header: ({ column }) => (
    <DataTableColumnHeader column={column} title='Image' />
  ),
  cell: ({ row }) => {
    const images = row.getValue('images') as string[] | string | undefined;
    const imageList = Array.isArray(images) ? images : images ? [images] : [];

    const image = imageList[0];

    if (!image) {
      return <span className="text-muted-foreground italic">No image</span>;
    }

    return (
      <div
        className="h-10 w-10 rounded-md overflow-hidden border border-muted shadow-sm cursor-pointer"
        title="Click to preview"
        onClick={() => window.open(image, '_blank')}
      >
        <img
          src={image}
          alt="Item"
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-150"
        />
      </div>
    );
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
    accessorKey: 'sub-category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Sub-Category' />
    ),
    cell: ({ row }) => {
      // Get sub-category name from different possible sources
      const subcategory = row.original.subCategory
      const subcategoryName = row.original.subcategoryName || (subcategory ? subcategory.name : null)
      const subcategoryId = row.original.subCategoryId

      return <span>{subcategoryName || subcategoryId || '—'}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.subCategoryId)
    },
  },
  
    {
    accessorKey: 'catalog-brand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Catalog Brand' />
    ),
    cell: ({ row }) => {
      // Get catalog brand name from different possible sources
      const brand = row.original.brand
      const brandName = row.original.brandName || (brand ? brand.name : null)
      const brandId = row.original.brandId

      return <span>{brandName || brandId || '—'}</span>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.brandId)
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