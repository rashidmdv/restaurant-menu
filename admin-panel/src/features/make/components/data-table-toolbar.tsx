import React, { useState, useEffect } from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import { DataTableViewOptions } from "./data-table-view-options"
import { Button } from "@/components/ui/button"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Input } from "@/components/ui/input"
import { Table } from "@tanstack/react-table"
import { VehicleStatus, VehicleType } from "../data/schema"
import { useMakes } from "../context/makes-context"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Status options with proper labels
const statusOptions = [
  {
    value: VehicleStatus.ACTIVE,
    label: 'Active',
  },
  {
    value: VehicleStatus.DISCONTINUED,
    label: 'Discontinued',
  },
  {
    value: VehicleStatus.UPCOMING,
    label: 'Upcoming',
  },
  {
    value: VehicleStatus.LIMITED,
    label: 'Limited',
  },
  {
    value: VehicleStatus.PRODUCTION,
    label: 'In Production',
  },
]

// Type options with proper labels
const typeOptions = [
  {
    value: VehicleType.SEDAN,
    label: 'Sedan',
  },
  {
    value: VehicleType.SUV,
    label: 'SUV',
  },
  {
    value: VehicleType.HATCHBACK,
    label: 'Hatchback',
  },
  {
    value: VehicleType.TRUCK,
    label: 'Truck',
  },
  {
    value: VehicleType.COUPE,
    label: 'Coupe',
  },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { makes, filters, setFilters, refreshMakes } = useMakes()
  const [searchValue, setSearchValue] = useState<string>("")
  const debouncedSearchValue = useDebounce(searchValue, 300)
  const [activeStatus, setActiveStatus] = useState<string>(filters.isActive === true ? "active" : 
                                                          filters.isActive === false ? "inactive" : "all")
  
  // Initialize search value from API filters
  useEffect(() => {
    if (filters.name && filters.name !== searchValue) {
      setSearchValue(filters.name)
    }
  }, [filters.name])
  
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
  
  // Initialize status filters from API filters
  // useEffect(() => {
  //   if (filters.status && !table.getColumn('status')?.getFilterValue()) {
  //     table.getColumn('status')?.setFilterValue([filters.status])
  //   }
  // }, [filters.status, table])
  
  // Initialize type filters from API filters
  // useEffect(() => {
  //   if (filters.type && !table.getColumn('type')?.getFilterValue()) {
  //     table.getColumn('type')?.setFilterValue([filters.type])
  //   }
  // }, [filters.type, table])
  
  // Handle active status change
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
    let isActiveValue: boolean | undefined = undefined
    if (value === "active") isActiveValue = true
    if (value === "inactive") isActiveValue = false
    
    // Update API filters
    setFilters(prev => ({
      ...prev,
      isActive: isActiveValue
    }))
    
    // Update table filter
    if (value === "all") {
      table.getColumn('isActive')?.setFilterValue(undefined)
    } else {
      table.getColumn('isActive')?.setFilterValue([String(isActiveValue)])
    }
  }
  
  // Initialize make filters from API filters
  // useEffect(() => {
  //   if (filters.makeId && !table.getColumn('makeId')?.getFilterValue()) {
  //     table.getColumn('makeId')?.setFilterValue([filters.makeId])
  //   }
  // }, [filters.makeId, table])
  
  // Check if any filters are active
  const isFiltered = Object.keys(filters).some(key => 
    !['page', 'limit'].includes(key) && filters[key as keyof typeof filters] !== undefined
  )
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchValue(value)
  }
  
  // Generate make options from available makes
  const makeOptions = makes.map(make => ({
    value: make.id,
    label: make.name,
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
      page: filters.page,
      limit: filters.limit
    })
    
    // Force refresh to ensure UI is in sync
    setTimeout(() => {
      refreshMakes()
    }, 50)
  }

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter makes...'
          value={searchValue}
          onChange={handleSearchChange}
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2 flex-wrap'>
          {/* {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Production Status'
              options={statusOptions}
            />
          )} */}
          {/* {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title='Type'
              options={typeOptions}
            />
          )} */}
          {table.getColumn('isActive') && (
            <Select value={activeStatus} onValueChange={handleActiveStatusChange}>
              <SelectTrigger className='h-8 w-[130px]'>
                <SelectValue placeholder="Active Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Makes</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/* {table.getColumn('makeId') && makeOptions.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('makeId')}
              title='Make'
              options={makeOptions}
            />
          )} */}
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