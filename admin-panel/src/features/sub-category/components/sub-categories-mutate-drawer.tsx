import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { SubCategory } from '../data/schema'
import { useSubCategories } from '../context/sub-categories-context'
import { useState, useEffect } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: SubCategory
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  category_id: z.number({ required_error: "Category is required" }),
  display_order: z.number().optional().default(0),
  active: z.boolean().optional().default(true),
})

type SubCategoryForm = z.infer<typeof formSchema>

export function subcategoriesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const { categories, createSubCategory, updateSubCategory } = useSubCategories()
  const isUpdate = !!currentRow

  const defaultValues = currentRow ? {
    name: currentRow.name,
    description: currentRow.description || '',
    category_id: currentRow.category_id,
    display_order: currentRow.display_order,
    active: currentRow.active,
  } : {
    name: '',
    description: '',
    category_id: 0,
    display_order: 0,
    active: true,
  }

  const form = useForm<SubCategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form when currentRow changes
  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description || '',
        category_id: currentRow.category_id,
        display_order: currentRow.display_order,
        active: currentRow.active,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        category_id: 0,
        display_order: 0,
        active: true,
      })
    }
  }, [currentRow, form])

  const onSubmit = async (data: SubCategoryForm) => {
    try {
      setLoading(true)
      
      if (isUpdate && currentRow) {
        await updateSubCategory(currentRow.id, {
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          display_order: data.display_order,
          active: data.active,
        })
      } else {
        await createSubCategory({
          name: data.name,
          description: data.description,
          category_id: data.category_id,
          display_order: data.display_order,
          active: data.active,
        })
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Sub-Category</SheetTitle>
          <SheetDescription>
            Provide details for the sub-category. Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="sub-category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 py-4 overflow-y-auto"
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <SelectDropdown 
                          {...field}
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          options={categories.map(cat => ({
                            value: cat.id.toString(),
                            label: cat.name,
                          }))}
                          placeholder="Select a category" 
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
                          {...field} 
                          type="number"
                          placeholder="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
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
                name="active"
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
            form="sub-category-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Sub-Category' : 'Create Sub-Category'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
