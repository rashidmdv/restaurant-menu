import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useModels } from '../context/models-context'

export function ModelsPrimaryButtons() {
  const { setOpen } = useModels()
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
        <span>Add Model</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
