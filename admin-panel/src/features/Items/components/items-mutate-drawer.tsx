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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Item } from '../data/schema'
import { useItems } from '../context/items-context'
import { useState, useEffect } from 'react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Item
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(150, "Name too long"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().optional().default("AED"),
  dietary_info: z.record(z.any()).optional().default({}),
  image_url: z.string().optional(),
  sub_category_id: z.number({ required_error: "Sub-category is required" }),
  available: z.boolean().optional().default(true),
  display_order: z.number().optional().default(0),
})

type ItemForm = z.infer<typeof formSchema>

export function ItemsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const { createItem, updateItem, subcategories, subcategoriesLoading } = useItems()
  const isUpdate = !!currentRow

  const defaultValues = currentRow ? {
    name: currentRow.name,
    description: currentRow.description || '',
    price: currentRow.price,
    currency: currentRow.currency || 'AED',
    dietary_info: currentRow.dietary_info || {},
    image_url: currentRow.image_url || '',
    sub_category_id: currentRow.sub_category_id,
    available: currentRow.available,
    display_order: currentRow.display_order,
  } : {
    name: '',
    description: '',
    price: 0,
    currency: 'AED',
    dietary_info: {},
    image_url: '',
    sub_category_id: 0,
    available: true,
    display_order: 0,
  }

  const form = useForm<ItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  // Reset form when currentRow changes
  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description || '',
        price: currentRow.price,
        currency: currentRow.currency || 'AED',
        dietary_info: currentRow.dietary_info || {},
        image_url: currentRow.image_url || '',
        sub_category_id: currentRow.sub_category_id,
        available: currentRow.available,
        display_order: currentRow.display_order,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        currency: 'AED',
        dietary_info: {},
        image_url: '',
        sub_category_id: 0,
        available: true,
        display_order: 0,
      })
    }
  }, [currentRow, form])

  const onSubmit = async (data: ItemForm) => {
    try {
      setLoading(true)
      
      if (isUpdate && currentRow) {
        await updateItem(currentRow.id, {
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          dietary_info: data.dietary_info,
          image_url: data.image_url,
          sub_category_id: data.sub_category_id,
          available: data.available,
          display_order: data.display_order,
        })
      } else {
        await createItem({
          name: data.name,
          description: data.description,
          price: data.price,
          currency: data.currency,
          dietary_info: data.dietary_info,
          image_url: data.image_url,
          sub_category_id: data.sub_category_id,
          available: data.available,
          display_order: data.display_order,
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Item</SheetTitle>
          <SheetDescription>
            Provide details for the menu item. Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="item-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 py-4 overflow-y-auto"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Spaghetti Carbonara" />
                    </FormControl>
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
                        placeholder="Describe the menu item" 
                        className="min-h-24"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value || 0}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AED">AED</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sub_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value?.toString() || ''}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        disabled={subcategoriesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={subcategoriesLoading ? "Loading..." : "Select sub-category"} />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map(subcategory => (
                            <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/image.jpg"
                        type="url"
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
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 mt-2">
                    <FormLabel>Available</FormLabel>
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
            form="item-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Item' : 'Create Item'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}