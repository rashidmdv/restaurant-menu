import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { Item, CreateItem, UpdateItem } from '../data/schema'
import { ItemService, ItemFilters, SubCategory } from '@/services/item-service'
import { handleServerError } from '@/utils/handle-server-error'

type ItemDialogType = 'create' | 'update' | 'delete' | 'details'

interface ItemsPaginationState {
  page: number
  limit: number
  total: number
}

interface ItemsContextType {
  open: ItemDialogType | null
  setOpen: (str: ItemDialogType | null) => void
  currentRow: Item | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Item | null>>
  items: Item[]
  isLoading: boolean
  isError: boolean
  subcategories: SubCategory[]
  subcategoriesLoading: boolean
  pagination: ItemsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<ItemsPaginationState>>
  filters: ItemFilters
  setFilters: React.Dispatch<React.SetStateAction<ItemFilters>>
  createItem: (item: CreateItem) => Promise<void>
  updateItem: (id: number, item: UpdateItem) => Promise<void>
  deleteItem: (id: number) => Promise<void>
  toggleItemAvailable: (id: number) => Promise<void>
  refreshItems: () => void
}

const ItemsContext = React.createContext<ItemsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ItemsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ItemDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Item | null>(null)
  const [pagination, setPagination] = useState<ItemsPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<ItemFilters>({
    limit: 10,
    offset: 0,
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch items (paginated)
  const {
    data: itemsData,
    isLoading,
    isError,
    refetch: refreshItems,
  } = useQuery({
    queryKey: ['items', filters],
    queryFn: () => ItemService.getItemsPaginated(filters),
    keepPreviousData: true,
  })

  // Fetch subcategories for dropdown
  const {
    data: subcategoriesData,
    isLoading: subcategoriesLoading
  } = useQuery({
    queryKey: ['subcategories'],
    queryFn: () => ItemService.getSubCategories(),
  })

  // Set pagination from response
  useEffect(() => {
    if (itemsData?.pagination && didMountRef.current) {
      setPagination({
        page: itemsData.pagination.page,
        limit: itemsData.pagination.limit,
        total: itemsData.pagination.total,
      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [itemsData])

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: ItemService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item created successfully')
    },
    onError: handleServerError,
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, item }: { id: string; item: UpdateItem }) =>
      ItemService.updateItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item updated successfully')
    },
    onError: handleServerError,
  })

  const deleteItemMutation = useMutation({
    mutationFn: ItemService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item deleted successfully')
    },
    onError: handleServerError,
  })

  const toggleAvailableItemMutation = useMutation({
    mutationFn: ItemService.toggleItemAvailable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item availability updated successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createItem = useCallback(
    async (item: CreateItem) => {
      await createItemMutation.mutateAsync(item)
    },
    [createItemMutation]
  )

  const updateItem = useCallback(
    async (id: number, item: UpdateItem) => {
      await updateItemMutation.mutateAsync({ id: id.toString(), item })
    },
    [updateItemMutation]
  )

  const deleteItem = useCallback(
    async (id: number) => {
      await deleteItemMutation.mutateAsync(id.toString())
    },
    [deleteItemMutation]
  )

  const toggleItemAvailable = useCallback(
    async (id: number) => {
      await toggleAvailableItemMutation.mutateAsync(id.toString())
    },
    [toggleAvailableItemMutation]
  )

  return (
    <ItemsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        items: itemsData?.data || [],
        isLoading,
        isError,
        subcategories: subcategoriesData || [],
        subcategoriesLoading,
        pagination,
        setPagination,
        filters,
        setFilters,
        createItem,
        updateItem,
        deleteItem,
        toggleItemAvailable,
        refreshItems,
      }}
    >
      {children}
    </ItemsContext.Provider>
  )
}

// Hook
export const useItems = () => {
  const itemsContext = React.useContext(ItemsContext)

  if (!itemsContext) {
    throw new Error('useItems has to be used within <ItemsContext>')
  }

  return itemsContext
}
