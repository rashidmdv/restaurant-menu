import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useItems } from '../context/items-context'

export function ItemsPrimaryButtons() {
  const { setOpen } = useItems()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Item</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
