import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconEdit } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCategories } from '../context/categories-context'
import { Category } from '../data/schema'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // Parse the original data with safer approach
  const original = row.original as unknown as Category
  const { setOpen, setCurrentRow } = useCategories()

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
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('details')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('update')
          }}
        >
          <IconEdit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(original)
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}