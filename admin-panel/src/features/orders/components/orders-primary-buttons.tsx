// File: web/src/features/orders/components/orders-primary-buttons.tsx

import { IconPlus, IconFileImport, IconClipboardCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useOrders } from '../context/orders-context'

export function OrdersPrimaryButtons() {
  const { setOpen } = useOrders()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <IconFileImport size={18} className="mr-1" />
        <span>Import</span>
      </Button>
      <Button 
        variant='outline'
        className='space-x-1'
        onClick={() => window.print()}
      >
        <IconClipboardCheck size={18} className="mr-1" />
        <span>Export</span>
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <IconPlus size={18} className="mr-1" />
        <span>New Order</span>
      </Button>
    </div>
  )
}