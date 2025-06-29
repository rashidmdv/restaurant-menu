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
  DialogClose,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { VehicleMake, VehicleType, VehicleStatus } from '../data/schema'
import { useMakes } from '../context/makes-context'
import { VehicleService } from '@/services/make-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VehicleMake
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  //year: z.string().min(4, 'Year is required.'),
  description: z.string().optional().nullable(),
  logo: z.string().url('Must be a valid URL.').optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
  //makeId: z.string().uuid('Must be a valid UUID.'),
  // type: z.nativeEnum(VehicleType).optional().nullable(),
  // status: z.nativeEnum(VehicleStatus).optional().nullable(),
  // fromDate: z.string().optional().nullable(),
  // toDate: z.string().optional().nullable(),
})

type VehicleMakeForm = z.infer<typeof formSchema>

// Status options

// Type options

export function MakesMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createMake, updateMake } = useMakes()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): VehicleMakeForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        year: currentRow.year || '',
        description: currentRow.description || '',
        logo: currentRow.logo || '',
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
        makeId: currentRow.makeId || '',
        type: currentRow.type || null,
        status: currentRow.status || null,
        fromDate: currentRow.fromDate ? new Date(currentRow.fromDate).toISOString().split('T')[0] : '',
        toDate: currentRow.toDate ? new Date(currentRow.toDate).toISOString().split('T')[0] : '',
      }
    } else {
      return {
        name: '',
        year: new Date().getFullYear().toString(),
        description: '',
        logo: '',
        isActive: true,
        makeId: '',
        type: null,
        status: null,
        fromDate: '',
        toDate: '',
      }
    }
  }

  const form = useForm<VehicleMakeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  })

  // Only reset the form when the dialog opens or currentRow changes
  useEffect(() => {
    if (open && !formInitialized.current) {
      form.reset(getDefaultValues())
      formInitialized.current = true
    }
  }, [open, form])

  // Reset form initialization flag when dialog closes
  useEffect(() => {
    if (!open) {
      formInitialized.current = false
    }
  }, [open])

  const handleSubmit = async (data: VehicleMakeForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      console.log('Payload to API:', formattedData)

      
      if (isUpdate && currentRow) {
        await updateMake(currentRow.id, formattedData)
      } else {
        await createMake(formattedData)
      }
      
      // Close dialog first
      onOpenChange(false)
      
      // Reset form after a small delay
      setTimeout(() => {
        form.reset()
      }, 100)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form after dialog is fully closed
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Vehicle Make</DialogTitle>
          <DialogDescription>
            Provide details for the vehicle make. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="make-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Camry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                
                {/* <FormField
                  control={form.control}
                  name="makeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={makesLoading ? "Loading makes..." : "Select make"}
                        disabled={makesLoading}
                        items={makes.map(make => ({
                          label: make.name,
                          value: make.id
                        }))}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                /> 
              </div> */}

              {/* <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>From Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...rest} 
                          value={value || ''} 
                          onChange={(e) => onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>To Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...rest} 
                          value={value || ''} 
                          onChange={(e) => onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

              <FormField
                control={form.control}
                name="description"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...rest} 
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value || null)}
                        placeholder="Provide a description of this make" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
  control={form.control}
  name="logo"
  render={() => (
    <FormItem>
      <FormLabel>Logo</FormLabel>
      <FormControl>
        <Input
          type="file"
          accept="logo/*"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            try {
              const res = await VehicleService.uploadMakeLogo(file)
              const uploadedUrl = res.url
              form.setValue('logo', uploadedUrl, { shouldValidate: true, shouldDirty: true })
            } catch (err) {
              console.error('File upload error:', err)
            }
          }}
        />
      </FormControl>
      <FormMessage />
      {form.watch('logo') && (
        <img src={form.watch('logo')} alt="Preview" className="mt-2 h-12 rounded" />
      )}
    </FormItem>
  )}
/>



              {/* <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <SelectDropdown
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        placeholder="Select type"
                        items={typeOptions}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production Status</FormLabel>
                      <SelectDropdown
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                        items={statusOptions}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 mt-2">
                    <FormLabel>Active</FormLabel>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            form="make-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Make' : 'Create Make'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}