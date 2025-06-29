import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { CatalogItem } from '../data/schema'
import { CatalogService, CatalogItemFilters, CatalogSubCategory, CatalogBrand } from '@/services/item-service'
import { handleServerError } from '@/utils/handle-server-error'

type ItemDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface ItemsPaginationState {
  page: number
  limit: number
  total: number
}

interface ItemsContextType {
  open: ItemDialogType | null
  setOpen: (str: ItemDialogType | null) => void
  currentRow: CatalogItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CatalogItem | null>>
  items: CatalogItem[]
  isLoading: boolean
  isError: boolean
  subcategories: CatalogSubCategory[],
  subcategoriesLoading: boolean,
  brands: CatalogBrand[],
  brandsLoading: boolean,
  itemsLoading: boolean
  pagination: ItemsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<ItemsPaginationState>>
  filters: CatalogItemFilters
  setFilters: React.Dispatch<React.SetStateAction<CatalogItemFilters>>
  createItem: (item: Omit<CatalogItem, 'id' | 'createdAt'>) => Promise<void>
  updateItem: (id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refreshItems: () => void
}

const ItemsContext = React.createContext<ItemsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ItemsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ItemDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CatalogItem | null>(null)
  const [pagination, setPagination] = useState<ItemsPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<CatalogItemFilters>({
    page: 1,
    limit: 10,
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
    queryKey: ['catalog-items', filters],
    queryFn: () => CatalogService.getItems(filters),
    keepPreviousData: true,
  })

  // Fetch subcategories
  const {
      data: subcategoriesData,
      isLoading: subcategoriesLoading
    } = useQuery({
      queryKey: ['catalog-sub-categories'],
      queryFn: () => CatalogService.getSubCategories(),
    })
    
  // Fetch brands
  const { 
    data: brandsData,
    isLoading: brandsLoading
  } = useQuery({
    queryKey: ['catalog-brands'],
    queryFn: () => CatalogService.getBrands(),
  })

  // Set pagination from meta
  useEffect(() => {
    if (itemsData?.meta && didMountRef.current) {
      setPagination({
        page: itemsData.meta.currentPage,
        limit: itemsData.meta.itemsPerPage,
        //total: itemsData.meta.totalItems,
        total: Array.isArray(itemsData) ? itemsData.length : itemsData?.meta?.totalItems || 0,

      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [itemsData])

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: CatalogService.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      toast.success('Catalog item created successfully')
    },
    onError: handleServerError,
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>> }) =>
      CatalogService.updateItem(id, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      toast.success('Catalog item updated successfully')
    },
    onError: handleServerError,
  })

  const deleteItemMutation = useMutation({
    mutationFn: CatalogService.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
      toast.success('Catalog item deleted successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createItem = useCallback(
    async (item: Omit<CatalogItem, 'id' | 'createdAt'>) => {
      await createItemMutation.mutateAsync(item)
    },
    [createItemMutation]
  )

  const updateItem = useCallback(
    async (id: string, item: Partial<Omit<CatalogItem, 'id' | 'createdAt'>>) => {
      await updateItemMutation.mutateAsync({ id, item })
    },
    [updateItemMutation]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      await deleteItemMutation.mutateAsync(id)
    },
    [deleteItemMutation]
  )

  return (
    <ItemsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        //items: itemsData?.items || [],
        items: Array.isArray(itemsData) ? itemsData : itemsData?.items || [],
        isLoading,
        isError,
        subcategories: subcategoriesData || [],
        subcategoriesLoading,
        brands: brandsData || [],
        brandsLoading,
        itemsLoading: isLoading, // set this explicitly
        pagination,
        setPagination,
        filters,
        setFilters,
        createItem,
        updateItem,
        deleteItem,
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
