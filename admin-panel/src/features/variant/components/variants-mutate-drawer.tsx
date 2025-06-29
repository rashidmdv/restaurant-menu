import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { labels, statuses } from '../data/data'
import { VehicleVariant } from '../data/schema'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VehicleVariant
}

const formSchema = z.object({
  id: z.string().uuid("Variant ID must be a valid UUID"),
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

export function VariantsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow

  const defaultValues = currentRow ? {
    ...currentRow,
    image: currentRow.image || '',
    fromDate: currentRow.fromDate ? new Date(currentRow.fromDate).toISOString().split('T')[0] : '',
    toDate: currentRow.toDate ? new Date(currentRow.toDate).toISOString().split('T')[0] : '',
  } : {
    name: '',
    engineType: '',
    transmission: '',
    bodyType: '',
    description: '',
    isActive: true,
    modelId: '', 
    createdAt: '',
    updatedAt:'',
  }

  const form = useForm<VehicleVariantForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (data: VehicleVariantForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      
      // If in a real app, this would be an API call
      if (isUpdate) {
        // Simulate API update call
        // const response = await axios.put(
        //   `https://supplier-catalog-service-dev.run.app/vehicle-variants/${currentRow.id}`,
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: currentRow.id },
          'Vehicle variant updated:'
        )
      } else {
        // Simulate API create call  
        // const response = await axios.post(
        //   'https://supplier-catalog-service-dev.run.app/vehicle-variants',
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: `MDL-${Math.floor(Math.random() * 10000)}` },
          'New vehicle variant created:'
        )
      }
      
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (  
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) form.reset() }}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Vehicle Variant</SheetTitle>
          <SheetDescription>
            Provide details for the vehicle variant. Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="variant-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 py-4 overflow-y-auto"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variant Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. XLE Premium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                
                
                <FormField
                  control={form.control}
                  name="modelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="UUID of parent model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
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

        <SheetFooter className="gap-2 pt-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button 
            form="variant-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Variant' : 'Create Variant'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
