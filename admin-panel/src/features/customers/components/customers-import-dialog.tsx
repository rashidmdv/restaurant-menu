// File: web/src/features/customers/components/customers-import-dialog.tsx

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/utils/show-submitted-data'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export function CustomersImportDialog({ open, onOpenChange }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { file: undefined },
  })

  const fileRef = form.register('file')

  const onSubmit = () => {
    const file = form.getValues('file')

    if (file && file[0]) {
      const fileDetails = {
        name: file[0].name,
        size: file[0].size,
        type: file[0].type,
      }
      showSubmittedData(fileDetails, 'You have imported the following file:')
    }
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        form.reset()
      }}
    >
      <DialogContent className='gap-2 sm:max-w-md'>
        <DialogHeader className='text-left'>
          <DialogTitle>Import Customers</DialogTitle>
          <DialogDescription>
            Import your customers data from CSV or connect to external services.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
            <TabsTrigger value="external">External Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv">
            <Form {...form}>
              <form id='customer-import-form' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name='file'
                  render={() => (
                    <FormItem className='mb-2 space-y-1'>
                      <FormLabel>CSV File</FormLabel>
                      <FormControl>
                        <Input type='file' {...fileRef} className='h-8' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Your CSV should contain columns for: name, phone, email, address, etc.</p>
              <p className="mt-1">
                <a href="#" className="text-primary underline">Download a template</a>
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="external">
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                  </div>
                  <span>Google Contacts</span>
                </Button>
                
                <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <span>Facebook</span>
                </Button>
                
                <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <span>Contacts App</span>
                </Button>
                
                <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-5 w-5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  </div>
                  <span>Other Services</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button type='submit' form='customer-import-form'>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}