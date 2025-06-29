import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { VehicleVariant } from '../data/schema'
import { VehicleService, VehicleVariantFilters, VehicleMake } from '@/services/variant-service'
import { handleServerError } from '@/utils/handle-server-error'

type VariantDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface VariantsPaginationState {
  page: number;
  limit: number;
  total: number;
}

interface VariantsContextType {
  open: VariantDialogType | null
  setOpen: (str: VariantDialogType | null) => void
  currentRow: VehicleVariant | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VehicleVariant | null>>
  variants: VehicleVariant[]
  isLoading: boolean
  isError: boolean
  models: VehicleMake[]
  modelsLoading: boolean
  pagination: VariantsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<VariantsPaginationState>>
  filters: VehicleVariantFilters
  setFilters: React.Dispatch<React.SetStateAction<VehicleVariantFilters>>
  createVariant: (variant: Omit<VehicleVariant, 'id' | 'createdAt'>) => Promise<void>
  updateVariant: (id: string, variant: Partial<Omit<VehicleVariant, 'id' | 'createdAt'>>) => Promise<void>
  deleteVariant: (id: string) => Promise<void>
  refreshVariants: () => void
}

const VariantsContext = React.createContext<VariantsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function VariantsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<VariantDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VehicleVariant | null>(null)
  const [pagination, setPagination] = useState<VariantsPaginationState>({
    page: 1,
    limit: 10,
    total: 0
  })
  // Initialize filters with pagination defaults
  const [filters, setFilters] = useState<VehicleVariantFilters>({
    page: 1,
    limit: 10
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch variants with pagination and filters
  const {
    data: variantsData,
    isLoading,
    isError,
    refetch: refreshVariants
  } = useQuery({
    queryKey: ['vehicle-variants', filters],
    queryFn: () => VehicleService.getVariants(filters),
    keepPreviousData: true // Keep old data while loading new data
  })

  // Fetch models for dropdown
  const {
    data: modelsData,
    isLoading: modelsLoading
  } = useQuery({
    queryKey: ['vehicle-models'],
    queryFn: () => VehicleService.getMakes(),
  })

  // Update pagination when data changes
  useEffect(() => {
    if (variantsData?.meta && didMountRef.current) {
      setPagination({
        page: variantsData.meta.currentPage,
        limit: variantsData.meta.itemsPerPage,
        total: variantsData.meta.totalItems
      })
    }
    
    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [variantsData])

  // Mutations
  const createVariantMutation = useMutation({
    mutationFn: VehicleService.createVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-variants'] })
      toast.success('Vehicle variant created successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, variant }: { id: string, variant: Partial<Omit<VehicleVariant, 'id' | 'createdAt'>> }) => 
      VehicleService.updateVariant(id, variant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-variants'] })
      toast.success('Vehicle variant updated successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  const deleteVariantMutation = useMutation({
    mutationFn: VehicleService.deleteVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-variants'] })
      toast.success('Vehicle variant deleted successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  // Helper functions
  const createVariant = useCallback(async (variant: Omit<VehicleVariant, 'id' | 'createdAt'>) => {
    await createVariantMutation.mutateAsync(variant)
  }, [createVariantMutation])

  const updateVariant = useCallback(async (id: string, variant: Partial<Omit<VehicleVariant, 'id' | 'createdAt'>>) => {
    await updateVariantMutation.mutateAsync({ id, variant })
  }, [updateVariantMutation])

  const deleteVariant = useCallback(async (id: string) => {
    await deleteVariantMutation.mutateAsync(id)
  }, [deleteVariantMutation])

  return (
    <VariantsContext.Provider value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      //variants: variantsData?.items || [],
      variants: Array.isArray(variantsData) ? variantsData : variantsData?.items || [],
      isLoading,
      isError,
      models: modelsData || [],
      modelsLoading,
      pagination,
      setPagination,
      filters,
      setFilters,
      createVariant,
      updateVariant,
      deleteVariant,
      refreshVariants
    }}>
      {children}
    </VariantsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useVariants = () => {
  const variantsContext = React.useContext(VariantsContext)

  if (!variantsContext) {
    throw new Error('useVariants has to be used within <VariantsContext>')
  }

  return variantsContext
}