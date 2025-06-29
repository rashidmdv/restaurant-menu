import React, { useState, useEffect } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { DataTableViewOptions } from "./data-table-view-options"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { Table } from "@tanstack/react-table"
// Remove unused vehicle imports
import { useCategories } from "../context/categories-context"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"



interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { categories, filters, setFilters, refreshCategories } = useCategories()
  const [searchValue, setSearchValue] = useState<string>("")
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const [activeStatus, setActiveStatus] = useState<string>(filters.active === true ? "active" : 
                                                          filters.active === false ? "inactive" : "all")
  
  // Initialize search value from API filters
  useEffect(() => {
    if (filters.name && filters.name !== searchValue) {
      setSearchValue(filters.name)
    }
  }, [filters.name, searchValue])
  
  // Apply debounced search value to table filters and API
  useEffect(() => {
    // Update table filter with the debounced value
    table.getColumn('name')?.setFilterValue(debouncedSearchValue)
    
    // Update API filter
    if (debouncedSearchValue !== undefined) {
      setFilters(prev => ({
        ...prev,
        name: debouncedSearchValue || undefined
      }))
    }
  }, [debouncedSearchValue, setFilters, table])
  


  useEffect(() => {
    // Only update if the filter changes externally (e.g. from reset)
    if (
      (filters.isActive === true && activeStatus !== "active") ||
      (filters.isActive === false && activeStatus !== "inactive") ||
      (filters.isActive === undefined && activeStatus !== "all")
    ) {
      setActiveStatus(filters.isActive === true ? "active" : 
                      filters.isActive === false ? "inactive" : "all")
    }
  }, [filters.isActive, activeStatus])

  // Handle active status selection
  const handleActiveStatusChange = (value: string) => {
    setActiveStatus(value)
    
    // Update API filter
    let activeValue: boolean | undefined = undefined
    if (value === "active") activeValue = true
    if (value === "inactive") activeValue = false
    
    // Update API filters
    setFilters(prev => ({
      ...prev,
      active: activeValue
    }))
    
    // Update table filter
    if (value === "all") {
      table.getColumn('active')?.setFilterValue(undefined)
    } else {
      table.getColumn('active')?.setFilterValue([String(activeValue)])
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
  
  // Category options removed - not used in this component
  
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
      page: filters.page,
      limit: filters.limit
    })
    
    // Force refresh to ensure UI is in sync
    setTimeout(() => {
      refreshCategories()
    }, 50)
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter categories...'
          value={searchValue}
          onChange={handleSearchChange}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2 flex-wrap'>
          {table.getColumn('active') && (
            <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
              <SelectTrigger className='h-8 w-[130px]'>
                <SelectValue placeholder="Active Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
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