// File: web/src/features/interactions/components/data-table-row-actions.tsx

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconMessageCircle, IconUserCheck, IconTag, IconChecks } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInteractions } from '../context/interactions-context'
import { interactionSchema } from '../data/schema'
import { statuses } from '../data/data'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const interaction = interactionSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useInteractions()

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
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(interaction)
            setOpen('details')
          }}
        >
          <IconEye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(interaction)
            setOpen('reply')
          }}
        >
          <IconMessageCircle className="mr-2 h-4 w-4" />
          Reply
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconChecks className="mr-2 h-4 w-4" />
            Update Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {statuses.map((status) => (
              <DropdownMenuItem key={status.value} disabled={interaction.status === status.value}>
                <status.icon className="mr-2 h-4 w-4" />
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconUserCheck className="mr-2 h-4 w-4" />
            Assign To
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              AI Bot
            </DropdownMenuItem>
            <DropdownMenuItem>
              Neha (Support)
            </DropdownMenuItem>
            <DropdownMenuItem>
              Ankit (Sales)
            </DropdownMenuItem>
            <DropdownMenuItem>
              Meera (Support)
            </DropdownMenuItem>
            <DropdownMenuItem>
              Rajiv (Customer Service)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <IconTag className="mr-2 h-4 w-4" />
            Manage Tags
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem>
              Remove Tags
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(interaction)
            setOpen('delete')
          }}
          className="text-red-600"
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