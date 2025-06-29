import React, { useState, useEffect } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { DataTableViewOptions } from "./data-table-view-options"
import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Input } from "@/components/ui/input"
import { Table } from "@tanstack/react-table"
import { Item } from "../data/schema"
import { useItems } from "../context/items-context"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Status options for availability
const statusOptions = [
  {
    value: 'true',
    label: 'Available',
  },
  {
    value: 'false',
    label: 'Unavailable',
  },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { subcategories, filters, setFilters, refreshItems } = useItems()
  const [searchValue, setSearchValue] = useState<string>("")
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const [activeStatus, setActiveStatus] = useState<string>(filters.available === true ? "available" : 
                                                          filters.available === false ? "unavailable" : "all")
  
  // Initialize search value from API filters
  useEffect(() => {
    if (filters.search && filters.search !== searchValue) {
      setSearchValue(filters.search)
    }
  }, [filters.search])
  
  // Apply debounced search value to table filters and API
  useEffect(() => {
    // Update table filter with the debounced value
    table.getColumn('name')?.setFilterValue(debouncedSearchValue)
    
    // Update API filter
    if (debouncedSearchValue !== undefined) {
      setFilters(prev => ({
        ...prev,
        search: debouncedSearchValue || undefined
      }))
    }
  }, [debouncedSearchValue, setFilters, table])
  
  // Initialize sub_category filters from API filters
  useEffect(() => {
    if (filters.sub_category_id && !table.getColumn('sub_category')?.getFilterValue()) {
      table.getColumn('sub_category')?.setFilterValue([filters.sub_category_id.toString()])
    }
  }, [filters.sub_category_id, table])
  
  // Handle available status change
  useEffect(() => {
    // Only update if the filter changes externally (e.g. from reset)
    if (
      (filters.available === true && activeStatus !== "available") ||
      (filters.available === false && activeStatus !== "unavailable") ||
      (filters.available === undefined && activeStatus !== "all")
    ) {
      setActiveStatus(filters.available === true ? "available" : 
                      filters.available === false ? "unavailable" : "all")
    }
  }, [filters.available, activeStatus])

  // Handle available status selection
  const handleActiveStatusChange = (value: string) => {
    setActiveStatus(value)
    
    // Update API filter
    let availableValue: boolean | undefined = undefined
    if (value === "available") availableValue = true
    if (value === "unavailable") availableValue = false
    
    // Update API filters
    setFilters(prev => ({
      ...prev,
      available: availableValue
    }))
    
    // Update table filter
    if (value === "all") {
      table.getColumn('available')?.setFilterValue(undefined)
    } else {
      table.getColumn('available')?.setFilterValue([String(availableValue)])
    }
  }



  
  // Check if any filters are active
  const isFiltered = Object.keys(filters).some(key => 
    !['page', 'limit'].includes(key) && filters[key as keyof typeof filters] !== undefined
  )
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
  }

  // Generate subcategory options from available 
  const subcategoryOptions = subcategories.map(subcategory => ({
    value: subcategory.id.toString(),
    label: subcategory.name,
  }))
  
  // Reset all filters
  const handleResetFilters = () => {
    // Clear search input
    setSearchValue("")
    
    // Reset active status
    setActiveStatus("all")
    
    // Clear all column filters in the table
    table.resetColumnFilters()
    
    // Reset API filters, keeping only pagination
    setFilters({
      limit: filters.limit,
      offset: filters.offset
    })
    
    // Force refresh to ensure UI is in sync
    setTimeout(() => {
      refreshItems()
    }, 50)
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search items...'
          value={searchValue}
          onChange={handleSearchChange}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2 flex-wrap'>
          {table.getColumn('available') && (
            <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
              <SelectTrigger className='h-8 w-[130px]'>
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Items</SelectItem>
                <SelectItem value='available'>Available</SelectItem>
                <SelectItem value='unavailable'>Unavailable</SelectItem>
              </SelectContent>
            </Select>
          )}
          {table.getColumn('sub_category') && subcategoryOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('sub_category')}
              title='Sub-Category'
              options={subcategoryOptions}
            />
          )}
        </div>
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