import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { CatalogBrand } from '../data/schema'
import { CatalogService, CatalogBrandFilters } from '@/services/brand-service'
import { handleServerError } from '@/utils/handle-server-error'

type BrandDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface BrandsPaginationState {
  page: number
  limit: number
  total: number
}

interface BrandsContextType {
  open: BrandDialogType | null
  setOpen: (str: BrandDialogType | null) => void
  currentRow: CatalogBrand | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CatalogBrand | null>>
  brands: CatalogBrand[]
  isLoading: boolean
  isError: boolean
  brandsLoading: boolean
  pagination: BrandsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<BrandsPaginationState>>
  filters: CatalogBrandFilters
  setFilters: React.Dispatch<React.SetStateAction<CatalogBrandFilters>>
  createBrand: (brand: Omit<CatalogBrand, 'id' | 'createdAt'>) => Promise<void>
  updateBrand: (id: string, brand: Partial<Omit<CatalogBrand, 'id' | 'createdAt'>>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  refreshBrands: () => void
}

const BrandsContext = React.createContext<BrandsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function BrandsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<BrandDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CatalogBrand | null>(null)
  const [pagination, setPagination] = useState<BrandsPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<CatalogBrandFilters>({
    page: 1,
    limit: 10,
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch brands (paginated)
  const {
    data: brandsData,
    isLoading,
    isError,
    refetch: refreshBrands,
  } = useQuery({
    queryKey: ['catalog-brands', filters],
    queryFn: () => CatalogService.getBrands(filters),
    keepPreviousData: true,
  })

  // Set pagination from meta
  useEffect(() => {
    if (brandsData?.meta && didMountRef.current) {
      setPagination({
        page: brandsData.meta.currentPage,
        limit: brandsData.meta.itemsPerPage,
        //total: brandsData.meta.totalItems,
        total: Array.isArray(brandsData) ? brandsData.length : brandsData?.meta?.totalItems || 0,

      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [brandsData])

  // Mutations
  const createBrandMutation = useMutation({
    mutationFn: CatalogService.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-brands'] })
      toast.success('Catalog brand created successfully')
    },
    onError: handleServerError,
  })

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, brand }: { id: string; brand: Partial<Omit<CatalogBrand, 'id' | 'createdAt'>> }) =>
      CatalogService.updateBrand(id, brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-brands'] })
      toast.success('Catalog brand updated successfully')
    },
    onError: handleServerError,
  })

  const deleteBrandMutation = useMutation({
    mutationFn: CatalogService.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-brands'] })
      toast.success('Catalog brand deleted successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createBrand = useCallback(
    async (brand: Omit<CatalogBrand, 'id' | 'createdAt'>) => {
      await createBrandMutation.mutateAsync(brand)
    },
    [createBrandMutation]
  )

  const updateBrand = useCallback(
    async (id: string, brand: Partial<Omit<CatalogBrand, 'id' | 'createdAt'>>) => {
      await updateBrandMutation.mutateAsync({ id, brand })
    },
    [updateBrandMutation]
  )

  const deleteBrand = useCallback(
    async (id: string) => {
      await deleteBrandMutation.mutateAsync(id)
    },
    [deleteBrandMutation]
  )

  return (
    <BrandsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        //brands: brandsData?.items || [],
        brands: Array.isArray(brandsData) ? brandsData : brandsData?.items || [],
        isLoading,
        isError,
        brandsLoading: isLoading, // set this explicitly
        pagination,
        setPagination,
        filters,
        setFilters,
        createBrand,
        updateBrand,
        deleteBrand,
        refreshBrands,
      }}
    >
      {children}
    </BrandsContext.Provider>
  )
}

// Hook
export const useBrands = () => {
  const brandsContext = React.useContext(BrandsContext)

  if (!brandsContext) {
    throw new Error('useBrands has to be used within <BrandsContext>')
  }

  return brandsContext
}
