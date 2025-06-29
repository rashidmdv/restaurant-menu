import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from './use-debounce'

export interface TableFilters {
  [key: string]: string | number | boolean | undefined
}

export interface PaginationState {
  pageIndex: number
  pageSize: number
  totalItems?: number
  totalPages?: number
}

interface UseTableFiltersOptions {
  initialFilters?: TableFilters
  initialPagination?: PaginationState
  debounceTime?: number
  onFilterChange?: (filters: TableFilters) => void
}

export function useTableFilters({
  initialFilters = {},
  initialPagination = { pageIndex: 0, pageSize: 10 },
  debounceTime = 300,
  onFilterChange,
}: UseTableFiltersOptions = {}) {
  // State for filters and pagination
  const [filters, setFilters] = useState<TableFilters>(initialFilters)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  
  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, debounceTime)

  // Call onFilterChange when debouncedFilters change
  useEffect(() => {
    onFilterChange?.(debouncedFilters)
  }, [debouncedFilters, onFilterChange])

  // Update filters
  const updateFilter = useCallback((key: string, value: string | number | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [])

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: TableFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }))
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
    setPagination(prev => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [])

  // Update pagination
  const updatePagination = useCallback((newPagination: Partial<PaginationState>) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination,
    }))
  }, [])

  // Convert filters and pagination to API params
  const getApiParams = useCallback(() => {
    return {
      ...debouncedFilters,
      page: pagination.pageIndex + 1, // Convert 0-based to 1-based
      limit: pagination.pageSize,
    }
  }, [debouncedFilters, pagination])

  return {
    filters,
    debouncedFilters,
    pagination,
    updateFilter,
    updateFilters,
    clearFilters,
    updatePagination,
    getApiParams,
  }
}