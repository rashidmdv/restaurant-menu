import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useCategories } from '../context/categories-context'

export function CategoriesPrimaryButtons() {
  const { setOpen } = useCategories()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Category</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
