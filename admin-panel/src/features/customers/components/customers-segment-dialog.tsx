// File: web/src/features/customers/components/customers-segment-dialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  IconUserCheck, 
  IconUserPlus, 
  IconUser, 
  IconUsers, 
  IconCrown,
  IconStarFilled,
  IconShoppingCart,
  IconCalendar,
  IconCash
} from '@tabler/icons-react'
import { getSegmentColor, segments } from '../data/data'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  segment: z.string().min(1, 'Please select a segment'),
  spendMin: z.string().optional(),
  spendMax: z.string().optional(),
  ordersMin: z.string().optional(),
  ordersMax: z.string().optional(),
  joinDateBefore: z.string().optional(),
  joinDateAfter: z.string().optional(),
  applyTo: z.enum(['selected', 'all', 'filtered']),
})

type SegmentForm = z.infer<typeof formSchema>

export function CustomersSegmentDialog({ open, onOpenChange }: Props) {
  const form = useForm<SegmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segment: '',
      spendMin: '',
      spendMax: '',
      ordersMin: '',
      ordersMax: '',
      joinDateBefore: '',
      joinDateAfter: '',
      applyTo: 'filtered',
    },
  })

  const selectedSegment = form.watch('segment')
  const applyTo = form.watch('applyTo')

  const onSubmit = (data: SegmentForm) => {
    showSubmittedData(data, 'Customer segment updated:')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val)
        if (!val) form.reset()
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Segment Customers</DialogTitle>
          <DialogDescription>
            Group your customers into segments based on their behavior and attributes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Predefined Segments</TabsTrigger>
            <TabsTrigger value="custom">Custom Rules</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form id="segment-form" onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="predefined" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="segment"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Choose a Segment</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-3"
                        >
                          {segments.map((segment) => (
                            <Card 
                              key={segment.value}
                              className={`cursor-pointer transition-colors ${
                                field.value === segment.value ? 'border-primary' : 'hover:border-primary/20'
                              }`}
                              onClick={() => form.setValue('segment', segment.value)}
                            >
                              <div className="flex items-start p-4">
                                <RadioGroupItem 
                                  value={segment.value} 
                                  id={segment.value}
                                  className="mt-1"
                                />
                                <div className="ml-3 flex-1">
                                  <div className="flex items-center justify-between">
                                    <label 
                                      htmlFor={segment.value}
                                      className="text-base font-medium cursor-pointer"
                                    >
                                      {segment.label}
                                    </label>
                                    <Badge className={getSegmentColor(segment.value)}>
                                      {segment.label}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {segment.value === 'vip' && 'High-value customers who spend the most'}
                                    {segment.value === 'loyal' && 'Repeat customers with consistent purchases'}
                                    {segment.value === 'regular' && 'Average customers with normal buying patterns'}
                                    {segment.value === 'new' && 'Recently acquired customers'}
                                    {segment.value === 'wholesale' && 'Bulk buyers and business customers'}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="segment"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Segment</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select segment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {segments.map((segment) => (
                              <SelectItem key={segment.value} value={segment.value}>
                                <div className="flex items-center gap-2">
                                  {segment.icon && <segment.icon className="h-4 w-4" />}
                                  {segment.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <IconShoppingCart className="h-4 w-4" />
                    Purchase Behavior
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="spendMin"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Min. Total Spent (₹)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g. 5000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="spendMax"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Max. Total Spent (₹)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g. 50000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ordersMin"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Min. Orders</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g. 2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ordersMax"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Max. Orders</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="e.g. 20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <IconCalendar className="h-4 w-4" />
                    Membership Period
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="joinDateAfter"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Joined After</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="joinDateBefore"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel>Joined Before</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <div className="border-t pt-4 mt-4">
                <FormField
                  control={form.control}
                  name="applyTo"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Apply Changes To</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="selected" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Selected customers (0)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="filtered" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Filtered customers (15)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="all" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              All customers (15)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </Tabs>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="segment-form" disabled={!selectedSegment}>
            {selectedSegment ? `Apply ${segments.find(s => s.value === selectedSegment)?.label} Segment` : 'Apply Segment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}