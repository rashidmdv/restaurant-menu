import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useRef, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react'
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
import { CatalogSubCategory, VehicleType, VehicleStatus } from '../data/schema'
import { useSubCategories } from '../context/sub-categories-context'
import { CatalogService } from '@/services/sub-category-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CatalogSubCategory
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  image: z.string().url('Must be a valid URL.').optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid('Must be a valid UUID.'),
  
})
export type CatalogSubCategoryForm = z.infer<typeof formSchema>

export function SubCategoriesMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createSubCategory, updateSubCategory, categories, categoriesLoading } = useSubCategories()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): CatalogSubCategoryForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        description: currentRow.description || '',
        image: currentRow.image || '',
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
        categoryId: currentRow.category?.id || '',
               
      }
    } else {
      return {
        name: '',
        description: '',
        image: '',
        isActive: true,
        categoryId: '',
      }
    }
  }

  const form = useForm<CatalogSubCategoryForm>({
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
  if (open) {
    const defaultValues = getDefaultValues()
    form.reset(defaultValues)
  }
}, [open, currentRow])


  const handleSubmit = async (data: CatalogSubCategoryForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      
      if (isUpdate && currentRow) {
        await updateSubCategory(currentRow.id, formattedData)
      } else {
        await createSubCategory(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Catalog Sub-Category</DialogTitle>
          <DialogDescription>
            Provide details for the catalog sub-category. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="sub-category-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Category Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Brake" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                        placeholder="Provide a description of this sub-category" 
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
                render={() => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
              
                          try {
                            const res = await CatalogService.uploadSubCategoryImage(file)
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
            form="sub-category-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Sub-Category' : 'Create Sub-Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}