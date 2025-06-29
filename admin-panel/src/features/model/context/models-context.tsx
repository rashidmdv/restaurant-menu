import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { VehicleModel } from '../data/schema'
import { VehicleService, VehicleModelFilters, VehicleMake } from '@/services/vehicle-service'
import { handleServerError } from '@/utils/handle-server-error'

type ModelDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface ModelsPaginationState {
  page: number;
  limit: number;
  total: number;
}

interface ModelsContextType {
  open: ModelDialogType | null
  setOpen: (str: ModelDialogType | null) => void
  currentRow: VehicleModel | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VehicleModel | null>>
  models: VehicleModel[]
  isLoading: boolean
  isError: boolean
  makes: VehicleMake[]
  makesLoading: boolean
  pagination: ModelsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<ModelsPaginationState>>
  filters: VehicleModelFilters
  setFilters: React.Dispatch<React.SetStateAction<VehicleModelFilters>>
  createModel: (model: Omit<VehicleModel, 'id' | 'createdAt'>) => Promise<void>
  updateModel: (id: string, model: Partial<Omit<VehicleModel, 'id' | 'createdAt'>>) => Promise<void>
  deleteModel: (id: string) => Promise<void>
  refreshModels: () => void
}

const ModelsContext = React.createContext<ModelsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ModelsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ModelDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VehicleModel | null>(null)
  const [pagination, setPagination] = useState<ModelsPaginationState>({
    page: 1,
    limit: 10,
    total: 0
  })
  // Initialize filters with pagination defaults
  const [filters, setFilters] = useState<VehicleModelFilters>({
    page: 1,
    limit: 10
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch models with pagination and filters
  const {
    data: modelsData,
    isLoading,
    isError,
    refetch: refreshModels
  } = useQuery({
    queryKey: ['vehicle-models', filters],
    queryFn: () => VehicleService.getModels(filters),
    keepPreviousData: true // Keep old data while loading new data
  })

  // Fetch makes for dropdown
  const {
    data: makesData,
    isLoading: makesLoading
  } = useQuery({
    queryKey: ['vehicle-makes'],
    queryFn: () => VehicleService.getMakes(),
  })

  // Update pagination when data changes
  useEffect(() => {
    if (modelsData?.meta && didMountRef.current) {
      setPagination({
        page: modelsData.meta.currentPage,
        limit: modelsData.meta.itemsPerPage,
        total: modelsData.meta.totalItems
      })
    }
    
    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [modelsData])

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: VehicleService.createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] })
      toast.success('Vehicle model created successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  const updateModelMutation = useMutation({
    mutationFn: ({ id, model }: { id: string, model: Partial<Omit<VehicleModel, 'id' | 'createdAt'>> }) => 
      VehicleService.updateModel(id, model),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] })
      toast.success('Vehicle model updated successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  const deleteModelMutation = useMutation({
    mutationFn: VehicleService.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-models'] })
      toast.success('Vehicle model deleted successfully')
    },
    onError: (error) => {
      handleServerError(error)
    }
  })

  // Helper functions
  const createModel = useCallback(async (model: Omit<VehicleModel, 'id' | 'createdAt'>) => {
    await createModelMutation.mutateAsync(model)
  }, [createModelMutation])

  const updateModel = useCallback(async (id: string, model: Partial<Omit<VehicleModel, 'id' | 'createdAt'>>) => {
    await updateModelMutation.mutateAsync({ id, model })
  }, [updateModelMutation])

  const deleteModel = useCallback(async (id: string) => {
    await deleteModelMutation.mutateAsync(id)
  }, [deleteModelMutation])

  return (
    <ModelsContext.Provider value={{
      open,
      setOpen,
      currentRow,
      setCurrentRow,
      models: modelsData?.items || [],
      isLoading,
      isError,
      makes: makesData || [],
      makesLoading,
      pagination,
      setPagination,
      filters,
      setFilters,
      createModel,
      updateModel,
      deleteModel,
      refreshModels
    }}>
      {children}
    </ModelsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModels = () => {
  const modelsContext = React.useContext(ModelsContext)

  if (!modelsContext) {
    throw new Error('useModels has to be used within <ModelsContext>')
  }

  return modelsContext
}