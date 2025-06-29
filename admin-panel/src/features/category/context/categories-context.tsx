import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { CatalogCategory } from '../data/schema'
import { CatalogService, CatalogCategoryFilters } from '@/services/category-service'
import { handleServerError } from '@/utils/handle-server-error'

type CategoryDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface CategoriesPaginationState {
  page: number
  limit: number
  total: number
}

interface CategoriesContextType {
  open: CategoryDialogType | null
  setOpen: (str: CategoryDialogType | null) => void
  currentRow: CatalogCategory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CatalogCategory | null>>
  categories: CatalogCategory[]
  isLoading: boolean
  isError: boolean
  categoriesLoading: boolean
  pagination: CategoriesPaginationState
  setPagination: React.Dispatch<React.SetStateAction<CategoriesPaginationState>>
  filters: CatalogCategoryFilters
  setFilters: React.Dispatch<React.SetStateAction<CatalogCategoryFilters>>
  createCategory: (category: Omit<CatalogCategory, 'id' | 'createdAt'>) => Promise<void>
  updateCategory: (id: string, category: Partial<Omit<CatalogCategory, 'id' | 'createdAt'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  refreshCategories: () => void
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function CategoriesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CatalogCategory | null>(null)
  const [pagination, setPagination] = useState<CategoriesPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<CatalogCategoryFilters>({
    page: 1,
    limit: 10,
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch categories (paginated)
  const {
    data: categoriesData,
    isLoading,
    isError,
    refetch: refreshCategories,
  } = useQuery({
    queryKey: ['catalog-categories', filters],
    queryFn: () => CatalogService.getCategories(filters),
    keepPreviousData: true,
  })

  // Set pagination from meta
  useEffect(() => {
    if (categoriesData?.meta && didMountRef.current) {
      setPagination({
        page: categoriesData.meta.currentPage,
        limit: categoriesData.meta.itemsPerPage,
        //total: categoriesData.meta.totalItems,
        total: Array.isArray(categoriesData) ? categoriesData.length : categoriesData?.meta?.totalItems || 0,

      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [categoriesData])

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: CatalogService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })
      toast.success('Catalog category created successfully')
    },
    onError: handleServerError,
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: Partial<Omit<CatalogCategory, 'id' | 'createdAt'>> }) =>
      CatalogService.updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })
      toast.success('Catalog category updated successfully')
    },
    onError: handleServerError,
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: CatalogService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })
      toast.success('Catalog category deleted successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createCategory = useCallback(
    async (category: Omit<CatalogCategory, 'id' | 'createdAt'>) => {
      await createCategoryMutation.mutateAsync(category)
    },
    [createCategoryMutation]
  )

  const updateCategory = useCallback(
    async (id: string, category: Partial<Omit<CatalogCategory, 'id' | 'createdAt'>>) => {
      await updateCategoryMutation.mutateAsync({ id, category })
    },
    [updateCategoryMutation]
  )

  const deleteCategory = useCallback(
    async (id: string) => {
      await deleteCategoryMutation.mutateAsync(id)
    },
    [deleteCategoryMutation]
  )

  return (
    <CategoriesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        //categories: categoriesData?.items || [],
        categories: Array.isArray(categoriesData) ? categoriesData : categoriesData?.items || [],
        isLoading,
        isError,
        categoriesLoading: isLoading, // set this explicitly
        pagination,
        setPagination,
        filters,
        setFilters,
        createCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  )
}

// Hook
export const useCategories = () => {
  const categoriesContext = React.useContext(CategoriesContext)

  if (!categoriesContext) {
    throw new Error('useCategories has to be used within <CategoriesContext>')
  }

  return categoriesContext
}
