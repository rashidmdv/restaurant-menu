import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEye, IconEdit, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { ContentSection } from '../data/schema'
import { useContentContext } from '../context/content-context'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const content = row.original as ContentSection
  const { 
    setSelectedContent, 
    setViewDialogOpen,
    setMutateDialogOpen,
    setDeleteDialogOpen,
    toggleContentStatus,
  } = useContentContext()

  const handleView = () => {
    setSelectedContent(content)
    setViewDialogOpen(true)
  }

  const handleEdit = () => {
    setSelectedContent(content)
    setMutateDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedContent(content)
    setDeleteDialogOpen(true)
  }

  const handleToggleStatus = async () => {
    await toggleContentStatus(content.id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuItem onClick={handleView} className='cursor-pointer'>
          <IconEye className='mr-2 h-4 w-4' />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit} className='cursor-pointer'>
          <IconEdit className='mr-2 h-4 w-4' />
          Edit Content
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleStatus} className='cursor-pointer'>
          {content.active ? (
            <>
              <IconToggleLeft className='mr-2 h-4 w-4' />
              Deactivate
            </>
          ) : (
            <>
              <IconToggleRight className='mr-2 h-4 w-4' />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete} 
          className='cursor-pointer text-red-600 focus:text-red-600'
        >
          <IconTrash className='mr-2 h-4 w-4' />
          Delete Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}