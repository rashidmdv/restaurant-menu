import { IconDownload, IconFileImport, IconMessageCircle, IconMessageReport, IconBrandWhatsapp } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInteractions } from '../context/interactions-context'

export function InteractionsPrimaryButtons() {
  const { setOpen } = useInteractions()
  return (
    <div className='flex gap-2'>
      {/* <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='space-x-1'>
            <IconFileImport size={18} className="mr-1" />
            <span>Import/Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Data Management</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen('import')}>
            <IconFileImport size={18} className="mr-2" />
            Import Conversations
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconDownload size={18} className="mr-2" />
            Export to CSV
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconMessageReport size={18} className="mr-2" />
            Generate Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}
      
      <Button 
        variant='default' 
        className='space-x-1'
        onClick={() => window.open('https://web.whatsapp.com', '_blank')}
      >
        <IconBrandWhatsapp size={18} className="mr-1" />
        <span>Open WhatsApp Web</span>
      </Button>
      
      <Button 
        variant="default"
        className='space-x-1 bg-green-600 hover:bg-green-700 text-white'
      >
        <IconMessageCircle size={18} className="mr-1" />
        <span>Broadcast Message</span>
      </Button>
    </div>
  )
}