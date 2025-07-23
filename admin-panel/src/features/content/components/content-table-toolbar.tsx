import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconPlus, IconSearch } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { ContentSection } from '../data/schema'
import { contentSectionTypes, statusOptions } from '../data/data'
import { useContentContext } from '../context/content-context'
import { ContentTableFacetedFilter } from './content-table-faceted-filter'
import { ContentTableViewOptions } from './content-table-view-options'

interface ContentTableToolbarProps {
  table: Table<ContentSection>
}

export function ContentTableToolbar({ table }: ContentTableToolbarProps) {
  const { setMutateDialogOpen, setSelectedContent } = useContentContext()
  
  const isFiltered = table.getState().columnFilters.length > 0

  const handleAddNew = () => {
    setSelectedContent(null)
    setMutateDialogOpen(true)
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <div className='relative'>
          <IconSearch className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search content...'
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('title')?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] pl-8 lg:w-[250px]'
          />
        </div>
        {table.getColumn('section_name') && (
          <ContentTableFacetedFilter
            column={table.getColumn('section_name')}
            title='Section Type'
            options={contentSectionTypes.map(type => ({
              label: type.label,
              value: type.value,
              icon: type.icon,
            }))}
          />
        )}
        {table.getColumn('active') && (
          <ContentTableFacetedFilter
            column={table.getColumn('active')}
            title='Status'
            options={statusOptions.map(status => ({
              label: status.label,
              value: status.value,
            }))}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center space-x-2'>
        <ContentTableViewOptions table={table} />
        <Button onClick={handleAddNew} size='sm' className='h-8'>
          <IconPlus className='mr-2 h-4 w-4' />
          Add Content
        </Button>
      </div>
    </div>
  )
}