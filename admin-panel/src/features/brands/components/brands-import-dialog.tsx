import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { API } from '@/lib/api'
import { useBrands } from '../context/brands-context'

const formSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Please upload a file',
    })
    .refine(
      (files) => ['text/csv'].includes(files?.[0]?.type),
      'Please upload csv format.'
    ),
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandsImportDialog({ open, onOpenChange }: Props) {
  const [isUploading, setIsUploading] = useState(false)
  const { refreshBrands } = useBrands()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = async () => {
    try {
      setIsUploading(true)
      const file = form.getValues('file')

      if (file && file[0]) {
        // Create form data
        const formData = new FormData()
        formData.append('file', file[0])

        // Upload file
        await API.post('/catalog-brands/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })

        toast.success('Catalog brands imported successfully')
        refreshBrands()
        onOpenChange(false)
        form.reset()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to import catalog brands')
    } finally {
      setIsUploading(false)
    }
  }

  // Dropzone integration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // Create a File object that can be used with react-hook-form
      const dataTransfer = new DataTransfer()
      acceptedFiles.forEach(file => {
        dataTransfer.items.add(file)
      })
      const fileList = dataTransfer.files
      
      // Set the file in the form
      form.setValue('file', fileList, { shouldValidate: true })
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) form.reset()
      }}
    >
      <DialogContent className='gap-4 sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle>Import Catalog Brands</DialogTitle>
          <DialogDescription>
            Import catalog brands quickly from a CSV file.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id='brands-import-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='file'
              render={({ field: { ref, ...field } }) => (
                <FormItem className='mb-4 space-y-2'>
                  <FormLabel>CSV File</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-4">
                      {/* Standard file input (hidden) */}
                      <input
                        type='file'
                        {...fileRef}
                        className='hidden'
                        ref={ref}
                        accept='.csv,text/csv'
                      />
                      
                      {/* Dropzone area */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                          isDragActive 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted-foreground/20 hover:border-primary/50'
                        }`}
                      >
                        <input {...getInputProps()} />
                        {isDragActive ? (
                          <p>Drop the CSV file here...</p>
                        ) : (
                          <div>
                            <p>Drag & drop a CSV file here, or click to select</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Required format: .csv file with columns for brand, desc, logo, brandId, etc.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Show selected file */}
                      {field.value && field.value[0] && (
                        <div className="p-3 rounded bg-muted flex justify-between items-center">
                          <span className="text-sm truncate max-w-[200px]">
                            {field.value[0].name} ({(field.value[0].size / 1024).toFixed(1)} KB)
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              form.setValue('file', undefined, { shouldValidate: true })
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button 
            type='submit' 
            form='brand-import-form'
            disabled={isUploading || !form.formState.isValid}
          >
            {isUploading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}