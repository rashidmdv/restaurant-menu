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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useState, useEffect, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

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

export function ItemsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      setPreviewUrl(currentRow.image_url || '')
      setSelectedFile(null)
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
      setPreviewUrl('')
      setSelectedFile(null)
    }
  }, [currentRow, form])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        alert('Only JPEG, PNG, WebP and GIF images are supported')
        return
      }
      
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateFileName = (file: File): string => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase()
    return `items/${timestamp}-${randomId}.${extension}`
  }

  const uploadFileWithPresignedUrl = async (file: File): Promise<string> => {
    const fileName = generateFileName(file)
    
    // Get presigned URL - trying POST first, then GET as fallback
    let presignedResponse: Response
    
    try {
      // Try POST method first (most likely correct)
      presignedResponse = await fetch('http://127.0.0.1:8000/api/v1/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: fileName,
          content_type: file.type,
          expires_in: 15
        })
      })
    } catch (error) {
      // Fallback to GET method if POST fails
      const params = new URLSearchParams({
        key: fileName,
        content_type: file.type,
        expires_in: '15'
      })
      
      presignedResponse = await fetch(`http://127.0.0.1:8000/api/v1/upload/presigned-url?${params}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!presignedResponse.ok) {
      throw new Error('Failed to get upload URL')
    }

    const responseData = await presignedResponse.json()
    const uploadUrl = responseData.data?.url || responseData.url

    if (!uploadUrl) {
      throw new Error('Invalid response from presigned URL endpoint')
    }

    // Upload directly to S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })

    if (!uploadResponse.ok) {
      throw new Error('Upload to S3 failed')
    }

    // Return the public URL for the uploaded file
    return `https://restaurant-menu-images.s3.us-east-1.amazonaws.com/${fileName}`
  }

  // Main upload function using presigned URL approach
  const uploadFile = async (file: File): Promise<string> => {
    return await uploadFileWithPresignedUrl(file)
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    form.setValue('image_url', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const deleteUploadedImage = async (imageUrl: string) => {
    try {
      // Extract the S3 key from the full URL
      // URL format: https://restaurant-menu-images.s3.us-east-1.amazonaws.com/items/filename.jpg
      const url = new URL(imageUrl)
      const key = url.pathname.substring(1) // Remove leading slash
      
      if (key) {
        await fetch(`http://127.0.0.1:8000/api/v1/upload/image/${encodeURIComponent(key)}`, {
          method: 'DELETE',
        })
      }
    } catch {
      // Ignore cleanup errors - don't fail the form submission
    }
  }

  const onSubmit = async (data: ItemForm) => {
    try {
      setLoading(true)
      
      let finalImageUrl = data.image_url
      let uploadedImageUrl: string | null = null
      
      if (selectedFile) {
        setUploading(true)
        try {
          // Upload directly to S3 using presigned URL
          finalImageUrl = await uploadFile(selectedFile)
          uploadedImageUrl = finalImageUrl
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          if (errorMessage.includes('presigned')) {
            alert('Failed to get upload permission. Please check your connection and try again.')
          } else if (errorMessage.includes('S3')) {
            alert('Failed to upload image to storage. Please try again.')
          } else {
            alert('Failed to upload image. Please try again.')
          }
          return
        } finally {
          setUploading(false)
        }
      }
      
      try {
        if (isUpdate && currentRow) {
          await updateItem(currentRow.id, {
            name: data.name,
            description: data.description,
            price: data.price,
            currency: data.currency,
            dietary_info: data.dietary_info,
            image_url: finalImageUrl,
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
            image_url: finalImageUrl,
            sub_category_id: data.sub_category_id,
            available: data.available,
            display_order: data.display_order,
          })
        }
        
        onOpenChange(false)
        form.reset()
        setSelectedFile(null)
        setPreviewUrl('')
      } catch {
        // If item creation failed and we uploaded an image, clean it up
        if (uploadedImageUrl) {
          await deleteUploadedImage(uploadedImageUrl)
        }
        alert('An error occurred while saving the item.')
      }
    } catch {
      alert('An error occurred while saving the item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) form.reset() }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[750px]">
        <DialogHeader className="text-left">
          <DialogTitle>{isUpdate ? 'Update' : 'Create'} Item</DialogTitle>
          <DialogDescription>
            Provide details for the menu item. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="item-form"
            onSubmit={form.handleSubmit(onSubmit)}
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
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Choose Image
                          </Button>
                          {previewUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeImage}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        {previewUrl && (
                          <div className="relative w-full max-w-xs">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            {selectedFile && (
                              <div className="mt-2 text-sm text-gray-600">
                                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!previewUrl && (
                          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg">
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No image selected</p>
                            </div>
                          </div>
                        )}
                        
                        <Input
                          {...field}
                          placeholder="Or paste image URL"
                          className="text-sm"
                          onChange={(e) => {
                            field.onChange(e)
                            if (e.target.value && !selectedFile) {
                              setPreviewUrl(e.target.value)
                            }
                          }}
                        />
                      </div>
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

        <DialogFooter className="gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            form="item-form" 
            type="submit" 
            disabled={loading || uploading}
          >
            {uploading ? 'Uploading...' : loading ? 'Saving...' : isUpdate ? 'Update Item' : 'Create Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}