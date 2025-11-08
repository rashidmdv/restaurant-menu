import React, { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { Reservation, CreateReservation, UpdateReservation } from '../data/schema'
import { ReservationService, ReservationFilters } from '@/services/reservation-service'
import { handleServerError } from '@/utils/handle-server-error'

type ReservationDialogType = 'create' | 'update' | 'delete' | 'details'

interface ReservationsPaginationState {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface ReservationsContextType {
  open: ReservationDialogType | null
  setOpen: (str: ReservationDialogType | null) => void
  currentRow: Reservation | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Reservation | null>>
  reservations: Reservation[]
  isLoading: boolean
  isError: boolean
  reservationsLoading: boolean
  pagination: ReservationsPaginationState
  setPagination: React.Dispatch<React.SetStateAction<ReservationsPaginationState>>
  filters: ReservationFilters
  setFilters: React.Dispatch<React.SetStateAction<ReservationFilters>>
  createReservation: (reservation: CreateReservation) => Promise<void>
  updateReservation: (id: number, reservation: UpdateReservation) => Promise<void>
  deleteReservation: (id: number) => Promise<void>
  updateReservationStatus: (id: number, status: string) => Promise<void>
  refreshReservations: () => void
}

const ReservationsContext = React.createContext<ReservationsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ReservationsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ReservationDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Reservation | null>(null)
  const [pagination, setPagination] = useState<ReservationsPaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  })

  const [filters, setFilters] = useState<ReservationFilters>({
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

  // Fetch reservations with pagination
  const {
    data: reservationsResponse,
    isLoading,
    isError,
    refetch: refreshReservations,
  } = useQuery({
    queryKey: ['reservations', filters],
    queryFn: () => ReservationService.getReservationsPaginated(filters),
    placeholderData: (previousData) => previousData,
  })

  // Update pagination when data changes
  useEffect(() => {
    if (reservationsResponse) {
      setPagination(prev => ({
        ...prev,
        total: reservationsResponse.total,
        total_pages: reservationsResponse.pagination.total_pages,
        has_next: reservationsResponse.pagination.has_next,
        has_prev: reservationsResponse.pagination.has_prev,
      }))
    }
  }, [reservationsResponse])

  // Mutations
  const createReservationMutation = useMutation({
    mutationFn: ReservationService.createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reservation created successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const updateReservationMutation = useMutation({
    mutationFn: ({ id, reservation }: { id: number; reservation: UpdateReservation }) =>
      ReservationService.updateReservation(id.toString(), reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reservation updated successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const deleteReservationMutation = useMutation({
    mutationFn: (id: number) => ReservationService.deleteReservation(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reservation deleted successfully')
      setOpen(null)
    },
    onError: handleServerError,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ReservationService.updateReservationStatus(id.toString(), status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      toast.success('Reservation status updated successfully')
    },
    onError: handleServerError,
  })

  // Handlers
  const createReservation = useCallback(
    async (reservation: CreateReservation) => {
      await createReservationMutation.mutateAsync(reservation)
    },
    [createReservationMutation]
  )

  const updateReservation = useCallback(
    async (id: number, reservation: UpdateReservation) => {
      await updateReservationMutation.mutateAsync({ id, reservation })
    },
    [updateReservationMutation]
  )

  const deleteReservation = useCallback(
    async (id: number) => {
      await deleteReservationMutation.mutateAsync(id)
    },
    [deleteReservationMutation]
  )

  const updateReservationStatus = useCallback(
    async (id: number, status: string) => {
      await updateStatusMutation.mutateAsync({ id, status })
    },
    [updateStatusMutation]
  )

  return (
    <ReservationsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        reservations: reservationsResponse?.data || [],
        isLoading,
        isError,
        reservationsLoading: isLoading,
        pagination,
        setPagination,
        filters,
        setFilters,
        createReservation,
        updateReservation,
        deleteReservation,
        updateReservationStatus,
        refreshReservations,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  )
}

// Hook
export const useReservations = () => {
  const reservationsContext = React.useContext(ReservationsContext)

  if (!reservationsContext) {
    throw new Error('useReservations has to be used within <ReservationsProvider>')
  }

  return reservationsContext
}
