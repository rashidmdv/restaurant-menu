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
import { CatalogBrand} from '../data/schema'
import { useBrands } from '../context/brands-context'
import { CatalogService } from '@/services/brand-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CatalogBrand
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional().nullable(),
  logo: z.string().url('Must be a valid URL.').optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),


})

type CatalogBrandForm = z.infer<typeof formSchema>


export function BrandsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createBrand, updateBrand } = useBrands()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): CatalogBrandForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        description: currentRow.description || '',
        logo: currentRow.logo || '',
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
        brandId: currentRow.brandId || '',
      
      }
    } else {
      return {
        name: '',
        description: '',
        logo: '',
        isActive: true,
        brandId: '',
      }
    }
  }

  const form = useForm<CatalogBrandForm>({
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

  const handleSubmit = async (data: CatalogBrandForm) => {
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
        await updateBrand(currentRow.id, formattedData)
      } else {
        await createBrand(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Catalog Brand</DialogTitle>
          <DialogDescription>
            Provide details for the catalog brand. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="brand-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Bosch" />
                    </FormControl>
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
                        placeholder="Provide a description of this brand" 
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
                          const res = await CatalogService.uploadBrandLogo(file)
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
            form="brand-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Brand' : 'Create Brand'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}