import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { Category, CreateCategory, UpdateCategory } from '../data/schema'
import { CategoryService, CategoryFilters, Pagination } from '@/services/category-service'
import { handleServerError } from '@/utils/handle-server-error'

type CategoryDialogType = 'create' | 'update' | 'delete' | 'details'

interface CategoriesPaginationState {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface CategoriesContextType {
  open: CategoryDialogType | null
  setOpen: (str: CategoryDialogType | null) => void
  currentRow: Category | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Category | null>>
  categories: Category[]
  isLoading: boolean
  isError: boolean
  categoriesLoading: boolean
  pagination: CategoriesPaginationState
  setPagination: React.Dispatch<React.SetStateAction<CategoriesPaginationState>>
  filters: CategoryFilters
  setFilters: React.Dispatch<React.SetStateAction<CategoryFilters>>
  createCategory: (category: CreateCategory) => Promise<void>
  updateCategory: (id: number, category: UpdateCategory) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  toggleCategoryActive: (id: number) => Promise<void>
  refreshCategories: () => void
}

const CategoriesContext = React.createContext<CategoriesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function CategoriesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<CategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Category | null>(null)
  const [pagination, setPagination] = useState<CategoriesPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })

  const [filters, setFilters] = useState<CategoryFilters>({
    limit: 10,
    offset: 0,
    include_count: true,
  })

  // Convert pagination.page to offset for API
  useEffect(() => {
    const offset = (pagination.page - 1) * pagination.limit
    setFilters(prev => ({
      ...prev,
      limit: pagination.limit,
      offset: offset,
    }))
  }, [pagination.page, pagination.limit])

  const queryClient = useQueryClient()

  // Fetch categories with pagination
  const {
    data: categoriesResponse,
    isLoading,
    isError,
    refetch: refreshCategories,
  } = useQuery({
    queryKey: ['categories', filters],
    queryFn: () => CategoryService.getCategoriesPaginated(filters),
    placeholderData: (previousData) => previousData,
  })

  // Update pagination when data changes
  useEffect(() => {
    if (categoriesResponse) {
      setPagination(prev => ({
        ...prev,
        total: categoriesResponse.total,
        total_pages: categoriesResponse.pagination.total_pages,
        has_next: categoriesResponse.pagination.has_next,
        has_prev: categoriesResponse.pagination.has_prev,
      }))
    }
  }, [categoriesResponse])

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: CategoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: number; category: UpdateCategory }) =>
      CategoryService.updateCategory(id.toString(), category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => CategoryService.deleteCategory(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => CategoryService.toggleCategoryActive(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category status updated successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createCategory = useCallback(
    async (category: CreateCategory) => {
      await createCategoryMutation.mutateAsync(category)
    },
    [createCategoryMutation]
  )

  const updateCategory = useCallback(
    async (id: number, category: UpdateCategory) => {
      await updateCategoryMutation.mutateAsync({ id, category })
    },
    [updateCategoryMutation]
  )

  const deleteCategory = useCallback(
    async (id: number) => {
      await deleteCategoryMutation.mutateAsync(id)
    },
    [deleteCategoryMutation]
  )

  const toggleCategoryActive = useCallback(
    async (id: number) => {
      await toggleActiveMutation.mutateAsync(id)
    },
    [toggleActiveMutation]
  )

  return (
    <CategoriesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        categories: categoriesResponse?.data || [],
        isLoading,
        isError,
        categoriesLoading: isLoading,
        pagination,
        setPagination,
        filters,
        setFilters,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
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
