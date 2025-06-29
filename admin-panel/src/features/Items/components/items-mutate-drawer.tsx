import { useState } from 'react'
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
import { CatalogItem } from '../data/schema'
import { CatalogService } from '@/services/item-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CatalogItem
}

const formSchema = z.object({
  //id: z.string().uuid('Item ID must be a valid UUID'),
  name: z.string().min(1, 'Item name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().min(1, 'Description is required'),
  stockQuantity: z.union([z.string(), z.number()])
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, "Stock must be a valid number"),

  price: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Price must be a valid number"),

  specifications: z
    .object({
      material: z.string().min(1, 'Material is required'),
      position: z.string().min(1, 'Position is required'),
      warranty: z.string().min(1, 'Warranty is required'),
    }),
  images: z.array(z.string().url('Image URL must be valid')).optional(),
  isActive: z.boolean().default(true),
  subCategoryId: z.string().uuid('Subcategory ID must be a valid UUID'),
  brandId: z.string().uuid('Brand ID must be a valid UUID'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

type CatalogItemForm = z.infer<typeof formSchema>

export function ItemsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow

  const defaultValues = currentRow
    ? {
      ...currentRow,
      images: currentRow.images || '',
      fromDate: currentRow.fromDate
        ? new Date(currentRow.fromDate).toISOString().split('T')[0]
        : '',
      toDate: currentRow.toDate
        ? new Date(currentRow.toDate).toISOString().split('T')[0]
        : '',
    }
    : {
      name: '',
      sku: '',
      description: '',
      price: '',
      stockQuantity: '',
      specifications: {
        material: '',
        position: '',
        warranty: '',
      },
      images: [],
      subCategoryId: '',
      brandId: '',

      isActive: true,
    }

  const form = useForm<CatalogItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  //  to see validation errors in real-time
  console.log('form errors', form.formState.errors)

  const onSubmit = async (data: CatalogItemForm) => {
    try {
      setLoading(true)

      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate
          ? new Date(data.fromDate).toISOString()
          : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }

      // If in a real app, this would be an API call
      if (isUpdate) {
        // Simulate API update call
        // const response = await axios.put(
        //   `https://supplier-catalog-service-dev.run.app/vehicle-items/${currentRow.id}`,
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: currentRow.id },
          'Catalog item updated:'
        )
      } else {
        // Simulate API create call
        // const response = await axios.post(
        //   'https://supplier-catalog-service-dev.run.app/vehicle-items',
        //   formattedData
        // )
        showSubmittedData(
          { ...formattedData, id: `MDL-${Math.floor(Math.random() * 10000)}` },
          'New catalog item created:'
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
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset()
      }}
    >
      <SheetContent className='flex flex-col overflow-y-auto'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Catalog Item</SheetTitle>
          <SheetDescription>
            Provide details for the catalog item. Click save when done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='item-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-4 overflow-y-auto py-4'
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g. XLE Premium' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='sku'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='e.g. SKU-12345' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Provide a description of this item'
                          className='min-h-24'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          placeholder='e.g. 199.99'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='stockQuantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          placeholder='e.g. 100'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='specifications.material'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='e.g. Aluminum' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='specifications.position'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='e.g. Front Left' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='specifications.warranty'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='e.g. 2 years' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='images'
                  render={() => (
                    <FormItem>
                      <FormLabel>Images (Max 2)</FormLabel>
                      <FormControl>
                        <Input
                          type='file'
                          accept='images/*'
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files ?? [])
                            if (files.length === 0) return

                            const currentImages = form.getValues('images') || []

                            if (currentImages.length + files.length > 2) {
                              alert('You can upload a maximum of 2 images.')
                              return
                            }

                            try {
                              const uploadedUrls: string[] = []

                              for (const file of files.slice(
                                0,
                                2 - currentImages.length
                              )) {
                                const res =
                                  await CatalogService.uploadItemImage(file)
                                uploadedUrls.push(res.url)
                              }

                              const updatedImages = [
                                ...currentImages,
                                ...uploadedUrls,
                              ]

                              form.setValue('images', updatedImages, {
                                shouldValidate: true,
                                shouldDirty: true,
                              })
                            } catch (err) {
                              console.error('File upload error:', err)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.watch('images')?.length > 0 && (
                        <div className='mt-2 flex gap-2'>
                          {form
                            .watch('images')
                            .map((url: string, index: number) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className='h-12 w-12 rounded object-cover'
                              />
                            ))}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='subCategoryId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          {...field}
                          options={labels.subcategories}
                          placeholder='Select subcategory'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='brandId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <SelectDropdown
                          {...field}
                          options={labels.brands}
                          placeholder='Select brand'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='mt-2 flex items-center space-x-3'>
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

        <SheetFooter className='gap-2 pt-2'>
          <SheetClose asChild>
            <Button variant='outline'>Cancel</Button>
          </SheetClose>
          <Button form='item-form' type='submit' disabled={loading}>
            {loading ? 'Saving...' : isUpdate ? 'Update Item' : 'Create Item'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
