import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { SubCategory, CreateSubCategory, UpdateSubCategory } from '../data/schema'
import { SubCategoryService, SubCategoryFilters, Category } from '@/services/sub-category-service'
import { handleServerError } from '@/utils/handle-server-error'

type SubCategoryDialogType = 'create' | 'update' | 'delete' | 'details'

interface SubCategoriesPaginationState {
  page: number
  limit: number
  total: number
}

interface SubCategoriesContextType {
  open: SubCategoryDialogType | null
  setOpen: (str: SubCategoryDialogType | null) => void
  currentRow: SubCategory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<SubCategory | null>>
  subcategories: SubCategory[]
  isLoading: boolean
  isError: boolean
  categories: Category[]
  categoriesLoading: boolean
  pagination: SubCategoriesPaginationState
  setPagination: React.Dispatch<React.SetStateAction<SubCategoriesPaginationState>>
  filters: SubCategoryFilters
  setFilters: React.Dispatch<React.SetStateAction<SubCategoryFilters>>
  createSubCategory: (subcategory: CreateSubCategory) => Promise<void>
  updateSubCategory: (id: number, subcategory: UpdateSubCategory) => Promise<void>
  deleteSubCategory: (id: number) => Promise<void>
  toggleSubCategoryActive: (id: number) => Promise<void>
  refreshSubCategories: () => void
}

const SubCategoriesContext = React.createContext<SubCategoriesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function SubCategoriesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SubCategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SubCategory | null>(null)
  const [pagination, setPagination] = useState<SubCategoriesPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<SubCategoryFilters>({
    limit: 10,
    offset: 0,
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch subcategories (paginated)
  const {
    data: subcategoriesData,
    isLoading,
    isError,
    refetch: refreshSubCategories,
  } = useQuery({
    queryKey: ['sub-categories', filters],
    queryFn: () => SubCategoryService.getSubCategoriesPaginated(filters),
    keepPreviousData: true,
  })

  // Fetch categories for dropdown
  const {
    data: categoriesData,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => SubCategoryService.getCategories(),
  })

  // Set pagination from response
  useEffect(() => {
    if (subcategoriesData?.pagination && didMountRef.current) {
      setPagination({
        page: subcategoriesData.pagination.page,
        limit: subcategoriesData.pagination.limit,
        total: subcategoriesData.pagination.total,
      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [subcategoriesData])

  // Mutations
  const createSubCategoryMutation = useMutation({
    mutationFn: SubCategoryService.createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] })
      toast.success('Sub-category created successfully')
    },
    onError: handleServerError,
  })

  const updateSubCategoryMutation = useMutation({
    mutationFn: ({ id, subcategory }: { id: string; subcategory: UpdateSubCategory }) =>
      SubCategoryService.updateSubCategory(id, subcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] })
      toast.success('Sub-category updated successfully')
    },
    onError: handleServerError,
  })

  const deleteSubCategoryMutation = useMutation({
    mutationFn: SubCategoryService.deleteSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] })
      toast.success('Sub-category deleted successfully')
    },
    onError: handleServerError,
  })

  const toggleActiveSubCategoryMutation = useMutation({
    mutationFn: SubCategoryService.toggleSubCategoryActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-categories'] })
      toast.success('Sub-category status updated successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createSubCategory = useCallback(
    async (subcategory: CreateSubCategory) => {
      await createSubCategoryMutation.mutateAsync(subcategory)
    },
    [createSubCategoryMutation]
  )

  const updateSubCategory = useCallback(
    async (id: number, subcategory: UpdateSubCategory) => {
      await updateSubCategoryMutation.mutateAsync({ id: id.toString(), subcategory })
    },
    [updateSubCategoryMutation]
  )

  const deleteSubCategory = useCallback(
    async (id: number) => {
      await deleteSubCategoryMutation.mutateAsync(id.toString())
    },
    [deleteSubCategoryMutation]
  )

  const toggleSubCategoryActive = useCallback(
    async (id: number) => {
      await toggleActiveSubCategoryMutation.mutateAsync(id.toString())
    },
    [toggleActiveSubCategoryMutation]
  )

  return (
    <SubCategoriesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        subcategories: subcategoriesData?.data || [],
        isLoading,
        isError,
        categories: categoriesData || [],
        categoriesLoading,
        pagination,
        setPagination,
        filters,
        setFilters,
        createSubCategory,
        updateSubCategory,
        deleteSubCategory,
        toggleSubCategoryActive,
        refreshSubCategories,
      }}
    >
      {children}
    </SubCategoriesContext.Provider>
  )
}

// Hook
export const useSubCategories = () => {
  const subCategoriesContext = React.useContext(SubCategoriesContext)

  if (!subCategoriesContext) {
    throw new Error('useSubCategories has to be used within <SubCategoriesContext>')
  }

  return subCategoriesContext
}
