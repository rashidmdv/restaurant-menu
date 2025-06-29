import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
import { VehicleVariant, VehicleType } from '../data/schema'
import { useVariants } from '../context/variants-context'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VehicleVariant
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  //id: z.string().uuid("Variant ID must be a valid UUID"),
  name: z.string().min(1, "Variant name is required"),
  engineType: z.string().min(1, "Engine type is required"),
  transmission: z.string().min(1, "Transmission is required"),
  bodyType: z.string().min(1, "Body type is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  modelId: z.string().uuid("Model ID must be a valid UUID"), 
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

type VehicleVariantForm = z.infer<typeof formSchema>

// Status options
// const statusOptions = [
//   { label: 'Active', value: VehicleStatus.ACTIVE },
//   { label: 'Discontinued', value: VehicleStatus.DISCONTINUED },
//   { label: 'Upcoming', value: VehicleStatus.UPCOMING },
//   { label: 'Limited', value: VehicleStatus.LIMITED },
//   { label: 'In Production', value: VehicleStatus.PRODUCTION },
// ]

// Type options
const typeOptions = [
  { label: 'Sedan', value: VehicleType.SEDAN },
  { label: 'SUV', value: VehicleType.SUV },
  { label: 'Hatchback', value: VehicleType.HATCHBACK },
  { label: 'Truck', value: VehicleType.TRUCK },
  { label: 'Coupe', value: VehicleType.COUPE },
]

export function VariantsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createVariant, updateVariant, models, modelsLoading } = useVariants()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): VehicleVariantForm => {
    if (currentRow) {
      return {
        //id: z.string().uuid("Variant ID must be a valid UUID"),
        name: currentRow.name || '',
        engineType: currentRow.engineType || '',
        transmission: currentRow.transmission || '',
        bodyType: currentRow.bodyType || '',
        description: currentRow.description || '',
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
        modelId: currentRow.model?.id || '',
        type: currentRow.type || null,
        fromDate: currentRow.fromDate ? new Date(currentRow.fromDate).toISOString().split('T')[0] : '',
        toDate: currentRow.toDate ? new Date(currentRow.toDate).toISOString().split('T')[0] : '',
      }
    } else {
      return {
        name: '',
        engineType: '',
        transmission: '',
        bodyType:'',
        description: '',
        isActive: true,
        modelId: '',
        type: null,
        fromDate: '',
        toDate: '',
      }
    }
  }

  const form = useForm<VehicleVariantForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),

  })

  // Only reset the form when the dialog opens or currentRow changes
  useEffect(() => {
  if (open && !formInitialized.current && !modelsLoading && models.length > 0) {
    form.reset(getDefaultValues())
    formInitialized.current = true
  }
}, [open, modelsLoading, models])


  // Reset form initialization flag when dialog closes
  useEffect(() => {
    if (!open) {
      formInitialized.current = false
    }
  }, [open])

  const handleSubmit = async (data: VehicleVariantForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      
      if (isUpdate && currentRow) {
        await updateVariant(currentRow.id, formattedData)
      } else {
        await createVariant(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Vehicle Variant</DialogTitle>
          <DialogDescription>
            Provide details for the vehicle variant. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="variant-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Camry" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="engineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engine Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. V6, Electric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transmission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transmission</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Automatic, Manual" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

     
              <FormField
                control={form.control}
                name="bodyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Sedan, SUV" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
              control={form.control}
              name="modelId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Model</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={modelsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select model"} />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />


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
                        placeholder="Provide a description of this variant" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


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
            form="variant-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Variant' : 'Create Variant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}