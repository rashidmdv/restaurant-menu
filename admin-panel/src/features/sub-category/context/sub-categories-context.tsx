import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { CatalogSubCategory } from '../data/schema'
import { CatalogCategory, CatalogService, CatalogSubCategoryFilters } from '@/services/sub-category-service'
import { handleServerError } from '@/utils/handle-server-error'

type SubCategoryDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface SubCategoriesPaginationState {
  page: number
  limit: number
  total: number
}

interface SubCategoriesContextType {
  open: SubCategoryDialogType | null
  setOpen: (str: SubCategoryDialogType | null) => void
  currentRow: CatalogSubCategory | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CatalogSubCategory | null>>
  subcategories: CatalogSubCategory[]
  isLoading: boolean
  isError: boolean
  categories: CatalogCategory[]
  categoriesLoading: boolean
  pagination: SubCategoriesPaginationState
  setPagination: React.Dispatch<React.SetStateAction<SubCategoriesPaginationState>>
  filters: CatalogSubCategoryFilters
  setFilters: React.Dispatch<React.SetStateAction<CatalogSubCategoryFilters>>
  createSubCategory: (subcategory: Omit<CatalogSubCategory, 'id' | 'createdAt'>) => Promise<void>
  updateSubCategory: (id: string, subcategory: Partial<Omit<CatalogSubCategory, 'id' | 'createdAt'>>) => Promise<void>
  deleteSubCategory: (id: string) => Promise<void>
  refreshSubCategories: () => void
}

const SubCategoriesContext = React.createContext<SubCategoriesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function SubCategoriesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<SubCategoryDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CatalogSubCategory | null>(null)
  const [pagination, setPagination] = useState<SubCategoriesPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<CatalogSubCategoryFilters>({
    page: 1,
    limit: 10,
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
    queryKey: ['catalog-sub-categories', filters],
    queryFn: () => CatalogService.getSubCategories(filters),
    keepPreviousData: true,
  })

    // Fetch makes for dropdown
    const {
      data: categoriesData,
      isLoading: categoriesLoading
    } = useQuery({
      queryKey: ['catalog-categories'],
      queryFn: () => CatalogService.getCategories(),
    })

  // Set pagination from meta
  useEffect(() => {
    if (subcategoriesData?.meta && didMountRef.current) {
      setPagination({
        page: subcategoriesData.meta.currentPage,
        limit: subcategoriesData.meta.itemsPerPage,
        //total: categoriesData.meta.totalItems,
        total: Array.isArray(subcategoriesData) ? subcategoriesData.length : subcategoriesData?.meta?.totalItems || 0,

      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [subcategoriesData])

  // Mutations
  const createSubCategoryMutation = useMutation({
    mutationFn: CatalogService.createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-sub-categories'] })
      toast.success('Catalog sub-category created successfully')
    },
    onError: handleServerError,
  })

  const updateSubCategoryMutation = useMutation({
    mutationFn: ({ id, subcategory }: { id: string; subcategory: Partial<Omit<CatalogSubCategory, 'id' | 'createdAt'>> }) =>
      CatalogService.updateSubCategory(id, subcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-sub-categories'] })
      toast.success('Catalog sub-category updated successfully')
    },
    onError: handleServerError,
  })

  const deleteSubCategoryMutation = useMutation({
    mutationFn: CatalogService.deleteSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-sub-categories'] })
      toast.success('Catalog sub-category deleted successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createSubCategory = useCallback(
    async (subcategory: Omit<CatalogSubCategory, 'id' | 'createdAt'>) => {
      await createSubCategoryMutation.mutateAsync(subcategory)
    },
    [createSubCategoryMutation]
  )

  const updateSubCategory = useCallback(
    async (id: string, subcategory: Partial<Omit<CatalogSubCategory, 'id' | 'createdAt'>>) => {
      await updateSubCategoryMutation.mutateAsync({ id, subcategory })
    },
    [updateSubCategoryMutation]
  )

  const deleteSubCategory = useCallback(
    async (id: string) => {
      await deleteSubCategoryMutation.mutateAsync(id)
    },
    [deleteSubCategoryMutation]
  )

  return (
    <SubCategoriesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        //categories: categoriesData?.items || [],
        subcategories: Array.isArray(subcategoriesData) ? subcategoriesData : subcategoriesData?.items || [],
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
