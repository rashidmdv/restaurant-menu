import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Reservation, createReservationSchema, statusOptions } from '../data/schema'
import { useReservations } from '../context/reservations-context'
import { handleFormError, showFormSuccess } from '@/utils/form-validation-handler'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Reservation
}

// Extend schema for update to include status
const formSchema = createReservationSchema.extend({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
})

type ReservationForm = z.infer<typeof formSchema>

export function ReservationsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createReservation, updateReservation } = useReservations()
  const formInitialized = useRef(false)

  const getDefaultValues = (): ReservationForm => {
    if (currentRow) {
      // Parse date - handle both "2025-11-27" and "2025-11-27T00:00:00Z" formats
      let reservationDate = currentRow.reservation_date || '';
      if (reservationDate.includes('T')) {
        // Extract just the date part before 'T'
        reservationDate = reservationDate.split('T')[0];
      }

      // Parse time - handle both "17:00" and "17:00:00" formats
      let reservationTime = currentRow.reservation_time || '';
      if (reservationTime.split(':').length === 3) {
        // Remove seconds if present (HH:MM:SS -> HH:MM)
        reservationTime = reservationTime.substring(0, 5);
      }

      return {
        full_name: currentRow.full_name || '',
        email: currentRow.email || '',
        phone: currentRow.phone || '',
        reservation_date: reservationDate,
        reservation_time: reservationTime,
        number_of_guests: currentRow.number_of_guests || 1,
        special_requests: currentRow.special_requests || '',
        status: currentRow.status || 'pending',
      }
    } else {
      const today = new Date().toISOString().split('T')[0]
      return {
        full_name: '',
        email: '',
        phone: '',
        reservation_date: today,
        reservation_time: '19:00',
        number_of_guests: 2,
        special_requests: '',
        status: 'pending',
      }
    }
  }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  })

  useEffect(() => {
    if (open && !formInitialized.current) {
      form.reset(getDefaultValues())
      formInitialized.current = true
    }
  }, [open, form])

  useEffect(() => {
    if (!open) {
      formInitialized.current = false
    }
  }, [open])

  const handleSubmit = async (data: ReservationForm) => {
    try {
      setLoading(true)

      if (isUpdate && currentRow) {
        await updateReservation(currentRow.id, data)
        showFormSuccess('updated', 'reservation')
      } else {
        // Remove status field for create
        const { status, ...createData } = data
        await createReservation(createData)
        showFormSuccess('created', 'reservation')
      }

      onOpenChange(false)
      setTimeout(() => {
        form.reset()
      }, 100)
    } catch (error) {
      handleFormError(
        error,
        form,
        isUpdate ? 'updating reservation' : 'creating reservation'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setTimeout(() => {
      form.reset()
    }, 100)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (open && !newOpen) {
          handleCancel()
        } else {
          onOpenChange(newOpen)
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Reservation</DialogTitle>
          <DialogDescription>
            {isUpdate ? 'Update the reservation details' : 'Create a new table reservation'}. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="reservation-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="+971501234567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reservation_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reservation_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="number_of_guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="20"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isUpdate && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="special_requests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Dietary restrictions, special occasions, seating preferences..."
                        className="min-h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="reservation-form" disabled={loading}>
            {loading ? 'Saving...' : 'Save Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
