import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SubCategory } from '../data/schema'
import { useSubCategories } from '../context/sub-categories-context'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: SubCategory
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  category_id: z.number().min(1, 'Category is required.'),
  display_order: z.number().optional().default(0),
  active: z.boolean().default(true),
})
export type SubCategoryForm = z.infer<typeof formSchema>

export function SubCategoriesMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createSubCategory, updateSubCategory, categories, categoriesLoading } = useSubCategories()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): SubCategoryForm => {
    if (currentRow) {
      return {
        name: currentRow.name || '',
        description: currentRow.description || '',
        category_id: currentRow.category_id || 0,
        display_order: currentRow.display_order || 0,
        active: typeof currentRow.active === 'boolean' ? currentRow.active : true,
      }
    } else {
      return {
        name: '',
        description: '',
        category_id: 0,
        display_order: 0,
        active: true,
      }
    }
  }

  const form = useForm<SubCategoryForm>({
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

  const handleSubmit = async (data: SubCategoryForm) => {
    try {
      setLoading(true)
      
      // Format data for submission
      const formattedData = {
        ...data,
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
    form.reset()
    onOpenChange(false)
    formInitialized.current = false
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleCancel()
        else onOpenChange(val)
      }}
    >
      <DialogContent className="gap-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Sub-Category</DialogTitle>
          <DialogDescription>
            Fill in the sub-category details below.
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
                      <Input {...field} placeholder="e.g. Appetizers" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value?.toString() || ''}
                      onValueChange={(value) => field.onChange(Number(value))}
                      disabled={categoriesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Optional description"
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Whether this sub-category is currently active
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="sub-category-form"
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}