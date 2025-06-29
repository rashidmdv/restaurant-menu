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
import { VehicleModel } from '../data/schema'
import { useState } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: VehicleModel
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  year: z.string().min(4, 'Year is required.'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  isActive: z.boolean(),
  makeId: z.string().uuid('Must be a valid UUID.'),
  label: z.string().min(1, 'Category is required.'),
  status: z.string().min(1, 'Production status is required.'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

type VehicleModelForm = z.infer<typeof formSchema>

export function ModelsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow

  const defaultValues = currentRow ? {
    ...currentRow,
    image: currentRow.image || '',
    fromDate: currentRow.fromDate ? new Date(currentRow.fromDate).toISOString().split('T')[0] : '',
    toDate: currentRow.toDate ? new Date(currentRow.toDate).toISOString().split('T')[0] : '',
  } : {
    name: '',
    year: new Date().getFullYear().toString(),
    description: '',
    image: '',
    isActive: true,
    makeId: '',
    label: '',
    status: 'active',
    fromDate: '',
    toDate: '',
  }

  const form = useForm<VehicleModelForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (data: VehicleModelForm) => {
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
        //   `https://supplier-catalog-service-dev.run.app/vehicle-models/${currentRow.id}`,
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: currentRow.id },
          'Vehicle model updated:'
        )
      } else {
        // Simulate API create call  
        // const response = await axios.post(
        //   'https://supplier-catalog-service-dev.run.app/vehicle-models',
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: `MDL-${Math.floor(Math.random() * 10000)}` },
          'New vehicle model created:'
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Vehicle Model</SheetTitle>
          <SheetDescription>
            Provide details for the vehicle model. Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="model-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 py-4 overflow-y-auto"
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
                
                <FormField
                  control={form.control}
                  name="makeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="UUID of parent make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        placeholder="Provide a description of this model" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.png" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select category"
                        items={labels.map(label => ({
                          label: label.label,
                          value: label.value
                        }))}
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
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                        items={statuses.map(status => ({
                          label: status.label,
                          value: status.value
                        }))}
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

        <SheetFooter className="gap-2 pt-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button 
            form="model-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Model' : 'Create Model'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
