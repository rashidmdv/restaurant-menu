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
import { CatalogItem, VehicleType } from '../data/schema'
import { useItems } from '../context/items-context'
import { de, sk } from '@faker-js/faker'
import { CatalogService } from '@/services/item-service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CatalogItem
}

// Create form schema that matches backend DTO
const formSchema = z.object({
  //id: z.string().uuid("Item ID must be a valid UUID"),
  name: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().min(1, 'Description is required'),
  stockQuantity: z.union([z.string(), z.number()])
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, "Stock must be a valid number"),

  price: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Price must be a valid number"),

  specifications: z.object({
    material: z.string().min(1, "Material is required"),
    position: z.string().min(1, "Position is required"),
    warranty: z.string().min(1, "Warranty is required"),
  }),
  images: z.array(z.string().url("Image URL must be valid")).optional(),
  isActive: z.boolean().default(true),
  subCategoryId: z.string().uuid("Subcategory ID must be a valid UUID"),
  brandId: z.string().uuid("Brand ID must be a valid UUID"),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
})

type CatalogItemForm = z.infer<typeof formSchema>

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

export function ItemsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const isUpdate = !!currentRow
  const { createItem, updateItem, subcategories, brands, subcategoriesLoading, brandsLoading } = useItems()
  const formInitialized = useRef(false)

  // Create default values once
  const getDefaultValues = (): CatalogItemForm => {
       if (currentRow) {
        return {
        //id: z.string().uuid("Item ID must be a valid UUID"),
        name: currentRow.name || '',
        sku: currentRow.sku || '',
        description: currentRow.description || '',
        price: currentRow.price || '',
        stockQuantity: currentRow.stockQuantity || '',
        specifications: {
          material: currentRow.specifications?.material || '',
          position: currentRow.specifications?.position || '',
          warranty: currentRow.specifications?.warranty || '',
        },
        images: currentRow.images || [],
        isActive: typeof currentRow.isActive === 'boolean' ? currentRow.isActive : true,
        subCategoryId: currentRow.subCategoryId || currentRow.subCategory?.id || '',
        brandId: currentRow.brandId || currentRow.brand?.id || '',
        fromDate: currentRow.fromDate ? new Date(currentRow.fromDate).toISOString().split('T')[0] : '',
        toDate: currentRow.toDate ? new Date(currentRow.toDate).toISOString().split('T')[0] : '',
      }
    } else {
      return {
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
        isActive: true,
        subCategoryId: '',
        brandId: '',
        fromDate: '',
        toDate: '',
      }
    }
  }

  const form = useForm<CatalogItemForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),

  })

  // Only reset the form when the dialog opens or currentRow changes
useEffect(() => {
  if (
    open &&
    currentRow && 
    !formInitialized.current &&
    !brandsLoading && brands.length > 0 &&
    !subcategoriesLoading && subcategories.length > 0
  ) {
    form.reset(getDefaultValues());
    formInitialized.current = true;
  }
}, [open, currentRow, brandsLoading, brands, subcategoriesLoading, subcategories]);


  // Reset form initialization flag when dialog closes
  useEffect(() => {
    if (!open) {
      formInitialized.current = false
    }
  }, [open])

  const handleSubmit = async (data: CatalogItemForm) => {
    try {
      setLoading(true)
      
      // Format dates for submission
      const formattedData = {
        ...data,
        fromDate: data.fromDate ? new Date(data.fromDate).toISOString() : undefined,
        toDate: data.toDate ? new Date(data.toDate).toISOString() : undefined,
      }
      
      if (isUpdate && currentRow) {
        await updateItem(currentRow.id, formattedData)
      } else {
        await createItem(formattedData)
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
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Catalog Item</DialogTitle>
          <DialogDescription>
            Provide details for the catalog item. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="item-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Bosch Brake Pad Set" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. BP1234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="e.g. 100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="e.g. 29.99" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />    
              <FormField
                control={form.control}
                name="specifications.material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Ceramic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />    
              <FormField
                control={form.control}
                name="specifications.position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Front, Rear" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specifications.warranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warranty</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. 2 years" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel>Images (Max 2)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length === 0) return;

                          const currentImages = form.getValues('images') || [];

                          const maxImages = 2;
                          const allowedUploads = maxImages - currentImages.length;
                          const filesToUpload = files.slice(0, allowedUploads);

                          if (filesToUpload.length < files.length) {
                            alert(`You can only upload ${allowedUploads} more image(s).`);
                          }


                          try {
                            const uploadedUrls: string[] = [];

                            for (const file of filesToUpload) {
                              const res = await CatalogService.uploadItemImage(file);
                              uploadedUrls.push(res.url);
                            }


                            const updatedImages = [...currentImages, ...uploadedUrls];

                            form.setValue('images', updatedImages, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          } catch (err) {
                            console.error('File upload error:', err);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {form.watch('images')?.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {form.watch('images').map((url: string, index: number) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="h-12 w-12 rounded object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedImages = form.watch('images')?.filter((_, i) => i !== index) || [];
                                form.setValue('images', updatedImages, {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                });
                              }}
                              className="absolute top-[-8px] right-[-8px] bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Sub-Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={subcategoriesLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={subcategoriesLoading ? "Loading subcategories..." : "Select subcategory"} />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map(subcategory => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
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
                name="brandId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Brand</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={brandsLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select brand"} />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map(brand => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
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
                        placeholder="Provide a description of this item" 
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
            form="item-form" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Saving...' : isUpdate ? 'Update Item' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}