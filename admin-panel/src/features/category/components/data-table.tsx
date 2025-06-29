import * as React from 'react'
import {
   ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { useCategories } from '../context/categories-context'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const { 
    categories, 
    isLoading, 
    pagination, 
    filters, 
    setFilters,
    refreshCategories
  } = useCategories()

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'created_at',
      desc: true,
    },
  ])

  // Use a ref to track if this is an initial render
  const isInitialRender = React.useRef(true)
  const filterTimeoutRef = React.useRef<NodeJS.Timeout>()

  // When a column filter changes, update the API filters
  React.useEffect(() => {
    // Skip the first render to avoid double loading
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    // Clear any existing timeout to debounce rapid changes
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }

    // Set a timeout to debounce filter changes
    filterTimeoutRef.current = setTimeout(() => {
      // Process column filters to API filters
      const apiFilters: Record<string, any> = {
        // Keep pagination
        page: filters.page,
        limit: filters.limit
      }

      // Map column filters to API filters
      for (const filter of columnFilters) {
        switch (filter.id) {
          case 'name':
            apiFilters.name = filter.value as string
            break
          case 'active':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              if (filter.value.length === 1) {
                // Single selection - convert string to boolean
                apiFilters.active = filter.value[0] === 'true'
              } else {
                // Multiple selection (both true and false) - don't filter by active
                apiFilters.active = undefined
              }
            }
            break
          case 'display_order':
            if (filter.value) {
              apiFilters.display_order = Number(filter.value)
            }
            break
          // Add other filters as needed
        }
      }

      // Update API filters and trigger a refresh
      setFilters(apiFilters)
    }, 300) // 300ms debounce

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [columnFilters, filters.page, filters.limit, setFilters])

  // Update pagination state
  const onPaginationChange = React.useCallback((page: number, limit: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit
    }))
  }, [setFilters])
  const table = useReactTable({
    data: categories as TData[],
    columns,
    pageCount: Math.ceil(pagination.total / pagination.limit) || 1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: pagination.page - 1, // convert 1-based to 0-based
        pageSize: pagination.limit,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newPagination = updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
        })
        onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize)
      }
    },
    manualPagination: true, // Tell table we're handling pagination via API
    manualFiltering: true, // Tell table we're handling filtering via API
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (isLoading) {
    // Calculate the number of visible columns for loading skeletons
    const visibleColumnsCount = table.getAllColumns().filter(c => c.getIsVisible()).length || columns.length;
    
    return (
      <div className='space-y-4'>
        <DataTableToolbar table={table} />
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {Array.from({ length: pagination.limit || 5 }).map((_, index) => (
                <TableRow key={`loading-row-${index}`}>
                  {Array.from({ length: visibleColumnsCount }).map((_, cellIndex) => {
                    if (cellIndex === 0) {
                      // First column (checkbox)
                      return (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`} className="pl-4 w-12">
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                      );
                    } else if (cellIndex === 1) {
                      // Name column (wider)
                      return (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-40" />
                          </div>
                        </TableCell>
                      );
                    } else if (cellIndex === visibleColumnsCount - 1) {
                      // Actions column
                      return (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`} className="w-10">
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                      );
                    } else {
                      // Other columns
                      return (
                        <TableCell key={`loading-cell-${index}-${cellIndex}`}>
                          <Skeleton className="h-5 w-24" />
                        </TableCell>
                      );
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination 
          table={table} 
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination 
        table={table} 
        pagination={pagination}
        onPaginationChange={onPaginationChange}
      />
    </div>
  )
}