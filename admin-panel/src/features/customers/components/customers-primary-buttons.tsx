import { IconFileImport, IconUserPlus, IconFileExport, IconUsersGroup } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCustomers } from '../context/customers-context'

export function CustomersPrimaryButtons() {
  const { setOpen } = useCustomers()
  
  return (
    <div className='flex gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='space-x-1'>
            <IconFileImport size={18} className="mr-1" />
            <span>Import/Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Customer Data</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen('import')}>
            <IconFileImport size={18} className="mr-2" />
            Import Customers
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconFileExport size={18} className="mr-2" />
            Export to CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant='outline' 
        className='space-x-1'
        onClick={() => setOpen('segment')}
      >
        <IconUsersGroup size={18} className="mr-1" />
        <span>Segment Customers</span>
      </Button>
      
      <Button 
        className='space-x-1' 
        onClick={() => setOpen('create')}
      >
        <IconUserPlus size={18} className="mr-1" />
        <span>Add Customer</span>
      </Button>
    </div>
  )
}