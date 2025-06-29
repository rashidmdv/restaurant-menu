import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useBrands } from '../context/brands-context'

export function BrandsPrimaryButtons() {
  const { setOpen } = useBrands()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <IconDownload size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Add Brand</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
