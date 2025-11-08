import React, { useState, useEffect } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { useReservations } from '../context/reservations-context'
import { useDebounce } from '@/hooks/use-debounce'
import { statusOptions } from '../data/schema'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { filters, setFilters, refreshReservations } = useReservations()
  const [searchValue, setSearchValue] = useState<string>('')
  const debouncedSearchValue = useDebounce(searchValue, 300)

  // Apply debounced search value to API filters
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedSearchValue || undefined
    }))
  }, [debouncedSearchValue, setFilters])

  // Check if any filters are active
  const isFiltered = Object.keys(filters).some(key =>
    !['limit', 'offset', 'include_count'].includes(key) && filters[key as keyof typeof filters] !== undefined
  )

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
  }

  // Reset all filters
  const handleResetFilters = () => {
    setSearchValue('')
    table.resetColumnFilters()
    setFilters({
      limit: filters.limit,
      offset: filters.offset,
      include_count: true
    })
    setTimeout(() => {
      refreshReservations()
    }, 50)
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Search by name, email, or phone...'
          value={searchValue}
          onChange={handleSearchChange}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Status'
            options={statusOptions.map(opt => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleResetFilters}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
