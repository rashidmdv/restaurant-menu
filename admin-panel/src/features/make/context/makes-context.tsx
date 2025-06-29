import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { VehicleMake } from '../data/schema'
import { VehicleService, VehicleMakeFilters } from '@/services/make-service'
import { handleServerError } from '@/utils/handle-server-error'

type MakeDialogType = 'create' | 'update' | 'delete' | 'import' | 'details'

interface MakesPaginationState {
  page: number
  limit: number
  total: number
}

interface MakesContextType {
  open: MakeDialogType | null
  setOpen: (str: MakeDialogType | null) => void
  currentRow: VehicleMake | null
  setCurrentRow: React.Dispatch<React.SetStateAction<VehicleMake | null>>
  makes: VehicleMake[]
  isLoading: boolean
  isError: boolean
  makesLoading: boolean
  pagination: MakesPaginationState
  setPagination: React.Dispatch<React.SetStateAction<MakesPaginationState>>
  filters: VehicleMakeFilters
  setFilters: React.Dispatch<React.SetStateAction<VehicleMakeFilters>>
  createMake: (make: Omit<VehicleMake, 'id' | 'createdAt'>) => Promise<void>
  updateMake: (id: string, make: Partial<Omit<VehicleMake, 'id' | 'createdAt'>>) => Promise<void>
  deleteMake: (id: string) => Promise<void>
  refreshMakes: () => void
}

const MakesContext = React.createContext<MakesContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function MakesProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<MakeDialogType>(null)
  const [currentRow, setCurrentRow] = useState<VehicleMake | null>(null)
  const [pagination, setPagination] = useState<MakesPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })

  const [filters, setFilters] = useState<VehicleMakeFilters>({
    page: 1,
    limit: 10,
  })

  const queryClient = useQueryClient()
  const didMountRef = useRef(false)

  // Fetch makes (paginated)
  const {
    data: makesData,
    isLoading,
    isError,
    refetch: refreshMakes,
  } = useQuery({
    queryKey: ['vehicle-makes', filters],
    queryFn: () => VehicleService.getMakes(filters),
    keepPreviousData: true,
  })

  // Set pagination from meta
  useEffect(() => {
    if (makesData?.meta && didMountRef.current) {
      setPagination({
        page: makesData.meta.currentPage,
        limit: makesData.meta.itemsPerPage,
        //total: makesData.meta.totalItems,
        total: Array.isArray(makesData) ? makesData.length : makesData?.meta?.totalItems || 0,

      })
    }

    if (!didMountRef.current) {
      didMountRef.current = true
    }
  }, [makesData])

  // Mutations
  const createMakeMutation = useMutation({
    mutationFn: VehicleService.createMake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] })
      toast.success('Vehicle make created successfully')
    },
    onError: handleServerError,
  })

  const updateMakeMutation = useMutation({
    mutationFn: ({ id, make }: { id: string; make: Partial<Omit<VehicleMake, 'id' | 'createdAt'>> }) =>
      VehicleService.updateMake(id, make),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] })
      toast.success('Vehicle make updated successfully')
    },
    onError: handleServerError,
  })

  const deleteMakeMutation = useMutation({
    mutationFn: VehicleService.deleteMake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-makes'] })
      toast.success('Vehicle make deleted successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createMake = useCallback(
    async (make: Omit<VehicleMake, 'id' | 'createdAt'>) => {
      await createMakeMutation.mutateAsync(make)
    },
    [createMakeMutation]
  )

  const updateMake = useCallback(
    async (id: string, make: Partial<Omit<VehicleMake, 'id' | 'createdAt'>>) => {
      await updateMakeMutation.mutateAsync({ id, make })
    },
    [updateMakeMutation]
  )

  const deleteMake = useCallback(
    async (id: string) => {
      await deleteMakeMutation.mutateAsync(id)
    },
    [deleteMakeMutation]
  )

  return (
    <MakesContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        //makes: makesData?.items || [],
        makes: Array.isArray(makesData) ? makesData : makesData?.items || [],
        isLoading,
        isError,
        makesLoading: isLoading, // set this explicitly
        pagination,
        setPagination,
        filters,
        setFilters,
        createMake,
        updateMake,
        deleteMake,
        refreshMakes,
      }}
    >
      {children}
    </MakesContext.Provider>
  )
}

// Hook
export const useMakes = () => {
  const makesContext = React.useContext(MakesContext)

  if (!makesContext) {
    throw new Error('useMakes has to be used within <MakesContext>')
  }

  return makesContext
}
