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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { paymentMethods, paymentStatuses, priorities, statuses } from '../data/data'
import { Order } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Order
}

const formSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required.'),
  customerPhone: z.string().min(10, 'Valid phone number required.'),
  orderItems: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().min(1, 'At least one item is required.')
  ),
  totalAmount: z.string().min(1, 'Total amount is required'),
  status: z.string().min(1, 'Please select a status.'),
  paymentMethod: z.string().min(1, 'Please select a payment method.'),
  paymentStatus: z.string().min(1, 'Please select a payment status.'),
  priority: z.string().min(1, 'Please choose a priority.'),
})

type OrderForm = z.infer<typeof formSchema>

export function OrdersMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const defaultValues = currentRow ? {
    ...currentRow,
    orderItems: currentRow.orderItems.toString(),
  } : {
    customerName: '',
    customerPhone: '',
    orderItems: '1',
    totalAmount: '₹',
    status: '',
    paymentMethod: '',
    paymentStatus: '',
    priority: 'medium',
  }

  const form = useForm<OrderForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = (data: OrderForm) => {
    onOpenChange(false)
    form.reset()
    
    // Add timestamp and ID if creating a new order
    const submittedData = isUpdate ? data : {
      ...data,
      id: `WS-${Math.floor(Math.random() * 10000)}`,
      orderDate: new Date().toISOString(),
    }
    
    showSubmittedData(
      submittedData, 
      isUpdate ? 'Order updated:' : 'New order created:'
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
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Order</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the order by modifying the details below.'
              : 'Add a new order by filling out the form.'}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="orders-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 space-y-4 px-1 py-4 overflow-y-auto"
          >
            <div className="grid gap-4 py-2">
              <h3 className="text-sm font-medium">Customer Information</h3>
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter customer name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
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
            </div>

            <div className="grid gap-4 py-2">
              <h3 className="text-sm font-medium">Order Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="orderItems"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Number of Items</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Total Amount</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="₹0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Order Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select status"
                      items={statuses.map(status => ({
                        label: status.label,
                        value: status.value
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 py-2">
              <h3 className="text-sm font-medium">Payment Details</h3>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Payment Method</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select payment method"
                      items={paymentMethods.map(method => ({
                        label: method.label,
                        value: method.value
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Payment Status</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select payment status"
                      items={paymentStatuses.map(status => ({
                        label: status.label,
                        value: status.value
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="relative space-y-3 py-2">
                  <FormLabel>Priority</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {priorities.map(priority => (
                        <FormItem key={priority.value} className="flex items-center space-y-0 space-x-3">
                          <FormControl>
                            <RadioGroupItem value={priority.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {priority.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
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
          <Button form="orders-form" type="submit">
            {isUpdate ? 'Update Order' : 'Create Order'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}