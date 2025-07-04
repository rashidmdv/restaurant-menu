import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useSubCategories } from '../context/sub-categories-context'

export function SubCategoriesPrimaryButtons() {
  const { setOpen } = useSubCategories()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Sub-Category</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
