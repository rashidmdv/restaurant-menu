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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
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
import { VehicleModel, VehicleType, VehicleStatus } from '../data/schema'
import { useModels } from '../context/models-context'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VehicleModel
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  year: z.string().min(4, 'Year is required.'),
  description: z.string().optional().nullable(),
  image: z.string().url('Must be a valid URL.').optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
  makeId: z.string().uuid('Must be a valid UUID.'),
  type: z.nativeEnum(VehicleType).optional().nullable(),
  status: z.nativeEnum(VehicleStatus).optional().nullable(),
  fromDate: z.string().optional().nullable(),
  toDate: z.string().optional().nullable(),
})

type VehicleModelForm = z.infer<typeof formSchema>

// Status options
const statusOptions = [
  { label: 'Active', value: VehicleStatus.ACTIVE },
  { label: 'Discontinued', value: VehicleStatus.DISCONTINUED },
  { label: 'Upcoming', value: VehicleStatus.UPCOMING },
  { label: 'Limited', value: VehicleStatus.LIMITED },
  { label: 'In Production', value: VehicleStatus.PRODUCTION },
]

// Type options
const typeOptions = [
  { label: 'Sedan', value: VehicleType.SEDAN },
  { label: 'SUV', value: VehicleType.SUV },
  { label: 'Hatchback', value: VehicleType.HATCHBACK },
  { label: 'Truck', value: VehicleType.TRUCK },
  { label: 'Coupe', value: VehicleType.COUPE },
]

export function ModelsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createModel, updateModel, makes, makesLoading } = useModels()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): VehicleModelForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        year: currentRow.year || '',
        description: currentRow.description || '',
        image: currentRow.image || '',
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
        image: '',
        isActive: true,
        makeId: '',
        type: null,
        status: null,
        fromDate: '',
        toDate: '',
      }
    }
  }

  const form = useForm<VehicleModelForm>({
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

  const handleSubmit = async (data: VehicleModelForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      
      if (isUpdate && currentRow) {
        await updateModel(currentRow.id, formattedData)
      } else {
        await createModel(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Vehicle Model</DialogTitle>
          <DialogDescription>
            Provide details for the vehicle model. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="model-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Camry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
                />
                
              </div>
              <FormField
              control={form.control}
              name="makeId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Make</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={makesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={makesLoading ? "Loading makes..." : "Select make"} />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map(make => (
                        <SelectItem key={make.id} value={make.id}>
                          {make.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


              <div className="grid grid-cols-2 gap-4">
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
              </div>

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
                        placeholder="Provide a description of this model" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...rest} 
                        value={value || ''} 
                        onChange={(e) => onChange(e.target.value || null)}
                        placeholder="https://example.com/image.png" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
              
                          try {
                            const res = await VehicleService.uploadMakeLogo(file)
                            const uploadedUrl = res.url
                            form.setValue('image', uploadedUrl, { shouldValidate: true, shouldDirty: true })
                          } catch (err) {
                            console.error('File upload error:', err)
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {form.watch('image') && (
                      <img src={form.watch('image')} alt="Preview" className="mt-2 h-12 rounded" />
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
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
              </div>

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
            form="model-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Model' : 'Create Model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}