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
import { CatalogCategory } from '../data/schema'
import { useCategories } from '../context/categories-context'
import { CatalogService } from '@/services/category-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CatalogCategory
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  description: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  isActive: z.boolean().optional().default(true),
  // createdAt: z.string().datetime().optional(),
  // updatedAt: z.string().datetime().optional(),
})

type CatalogCategoryForm = z.infer<typeof formSchema>


export function CategoriesMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createCategory, updateCategory } = useCategories()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): CatalogCategoryForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        image: currentRow.image || '',
        description: currentRow.description || '',
        type: currentRow.type || '',
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
      }
    } else {
      return {
        name: '',
        image: '',
        description: '',
        type: '',
        isActive: true,
        // createdAt: '',
        // updatedAt: '',
      }
    }
  }

  const form = useForm<CatalogCategoryForm>({
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

  const handleSubmit = async (data: CatalogCategoryForm) => {
    try {
      setLoading(true)
      
      // Format data for submission
      const formattedData = {
        ...data,
      }
      console.log('Payload to API:', formattedData)

      
      if (isUpdate && currentRow) {
        await updateCategory(currentRow.id, formattedData)
      } else {
        await createCategory(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Catalog Category</DialogTitle>
          <DialogDescription>
            Provide details for the catalog category. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="category-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Automotive" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          const res = await CatalogService.uploadCategoryImage(file)
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
                        placeholder="Provide a description of this category" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. automotive" />
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
            form="category-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Category' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}