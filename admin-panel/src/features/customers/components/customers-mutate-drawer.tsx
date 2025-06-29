// File: web/src/features/customers/components/customers-mutate-drawer.tsx

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
import { SelectDropdown } from '@/components/select-dropdown'
import { Textarea } from '@/components/ui/textarea'
import { segments, sources, statuses } from '../data/data'
import { Customer } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Customer
}

const formSchema = z.object({
  name: z.string().min(2, 'Customer name is required.'),
  phone: z.string().min(10, 'Phone number is required.'),
  email: z.string().email('Valid email is required.').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  pincode: z.string().optional().or(z.literal('')),
  status: z.string().min(1, 'Please select a status.'),
  segment: z.string().min(1, 'Please select a segment.'),
  source: z.string().min(1, 'Please select a source.'),
  notes: z.string().optional().or(z.literal('')),
})

type CustomerForm = z.infer<typeof formSchema>

export function CustomersMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  
  const defaultValues = currentRow || {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'active',
    segment: 'new',
    source: 'whatsapp',
    notes: '',
  }

  const form = useForm<CustomerForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = (data: CustomerForm) => {
    onOpenChange(false)
    form.reset()
    
    // Add other data if creating new customer
    const submittedData = isUpdate ? data : {
      ...data,
      id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      memberSince: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
      tags: [],
    }
    
    showSubmittedData(
      submittedData, 
      isUpdate ? 'Customer updated:' : 'New customer created:'
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset()
      }}
    >
      <SheetContent className="flex flex-col overflow-y-auto w-full sm:max-w-lg">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? 'Update' : 'Add New'} Customer</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update customer details by modifying the form below.'
              : 'Add a new customer by filling out the form below.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="customers-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto space-y-6 py-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Basic Information</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter customer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Address Information</h3>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter pincode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Customer Classification</h3>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select status"
                        items={statuses.map(status => ({
                          label: status.label,
                          value: status.value
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Segment</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select segment"
                        items={segments.map(segment => ({
                          label: segment.label,
                          value: segment.value
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Source</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select source"
                        items={sources.map(source => ({
                          label: source.label,
                          value: source.value
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about this customer"
                      className="min-h-24 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className="gap-2 pt-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button form="customers-form" type="submit">
            {isUpdate ? 'Update Customer' : 'Add Customer'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}