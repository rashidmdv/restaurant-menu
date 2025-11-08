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
import { useReservations } from '../context/reservations-context'
import { Skeleton } from '@/components/ui/skeleton'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
}

export function DataTable<TData, TValue>({
  columns,
}: DataTableProps<TData, TValue>) {
  const {
    reservations,
    isLoading,
    pagination,
    setPagination,
    filters,
    setFilters,
  } = useReservations()

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'created_at',
      desc: true,
    },
  ])

  const isInitialRender = React.useRef(true)
  const filterTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // When a column filter changes, update the API filters
  React.useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current)
    }

    filterTimeoutRef.current = setTimeout(() => {
      const apiFilters: Record<string, any> = {
        limit: filters.limit,
        offset: filters.offset,
        include_count: true
      }

      // Map column filters to API filters
      for (const filter of columnFilters) {
        switch (filter.id) {
          case 'status':
            if (Array.isArray(filter.value) && filter.value.length > 0) {
              if (filter.value.length === 1) {
                apiFilters.status = filter.value[0]
              }
            }
            break
        }
      }

      if (filters.search !== undefined) {
        apiFilters.search = filters.search
      }

      if (filters.date_from !== undefined) {
        apiFilters.date_from = filters.date_from
      }

      if (filters.date_to !== undefined) {
        apiFilters.date_to = filters.date_to
      }

      setFilters(apiFilters)
    }, 300)

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current)
      }
    }
  }, [columnFilters, setFilters])

  const onPaginationChange = React.useCallback((page: number, limit: number) => {
    setPagination(prev => ({
      ...prev,
      page,
      limit
    }))
  }, [setPagination])

  const table = useReactTable({
    data: reservations as TData[],
    columns,
    pageCount: pagination.total_pages || 1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  })

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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className='h-6 w-full' />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
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
                  No results.
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
