// File: web/src/features/customers/components/customers-details-dialog.tsx

import { format } from 'date-fns'
import { 
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconCalendar,
  IconShoppingCart,
  IconTag,
  IconCash,
  IconCreditCard,
  IconNotes,
  IconBuildingStore,
  IconMap
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getSegmentColor, getSourceIcon, getStatusColor, segments, sources, statuses } from '../data/data'
import { Customer } from '../data/schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomers } from '../context/customers-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Customer
}

export function CustomersDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  const { setOpen } = useCustomers()
  
  const status = statuses.find(s => s.value === currentRow.status);
  const segment = segments.find(s => s.value === currentRow.segment);
  const source = sources.find(s => s.value === currentRow.source);
  const SourceIcon = source ? source.icon : null;
  
  const createdAt = new Date(currentRow.createdAt);
  const memberSince = new Date(currentRow.memberSince);
  const lastInteraction = currentRow.lastInteraction ? new Date(currentRow.lastInteraction) : null;
  
  // Get initials for avatar
  const initials = currentRow.name.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Some sample data for the tabs
  const recentOrders = [
    { id: 'WS-2578', date: '2025-05-10T15:30:00', items: 3, total: '₹2,450', status: 'Delivered' },
    { id: 'WS-2534', date: '2025-04-28T12:15:00', items: 1, total: '₹899', status: 'Delivered' },
    { id: 'WS-2487', date: '2025-04-15T09:45:00', items: 2, total: '₹1,399', status: 'Returned' },
  ];
  
  const recentInteractions = [
    { 
      id: 'INT-8782', 
      date: '2025-05-15T09:30:00', 
      message: 'I want to order 2 cotton shirts in blue color, size M.', 
      intent: 'Add to Cart',
      status: 'Resolved'
    },
    { 
      id: 'INT-7868', 
      date: '2025-04-28T14:20:00', 
      message: 'Where is my order WS-2534? It\'s been 3 days already!', 
      intent: 'Order Status',
      status: 'Resolved'
    },
    { 
      id: 'INT-7452', 
      date: '2025-04-15T10:10:00', 
      message: 'I received the wrong product. Ordered red but got blue.', 
      intent: 'Return Request',
      status: 'Resolved'
    },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span>{currentRow.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSegmentColor(currentRow.segment)}>
                {segment?.label || currentRow.segment}
              </Badge>
              <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(currentRow.status)} text-white`}>
                {status?.label || currentRow.status}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <IconUser className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{currentRow.name}</span>
                    </div>
                    <div className="flex items-center">
                      <IconPhone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{currentRow.phone}</span>
                    </div>
                    {currentRow.email && (
                      <div className="flex items-center">
                        <IconMail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{currentRow.email}</span>
                      </div>
                    )}
                    {currentRow.address && (
                      <div className="flex items-start">
                        <IconMapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <span className="font-medium">Address:</span>
                        <span className="ml-2">{currentRow.address}</span>
                      </div>
                    )}
                    {(currentRow.city || currentRow.state) && (
                      <div className="flex items-center">
                        <IconMap className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">
                          {[currentRow.city, currentRow.state, currentRow.pincode].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Member Since:</span>
                      <span className="ml-2">{format(memberSince, 'PPP')}</span>
                    </div>
                    <div className="flex items-center">
                      <IconBuildingStore className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Source:</span>
                      <span className="ml-2 flex items-center">
                        {SourceIcon && <SourceIcon className="h-4 w-4 mr-1 text-muted-foreground" />}
                        {source?.label || currentRow.source}
                      </span>
                    </div>
                    {lastInteraction && (
                      <div className="flex items-center">
                        <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Last Interaction:</span>
                        <span className="ml-2">{format(lastInteraction, 'PPP')}</span>
                      </div>
                    )}
                    {currentRow.tags && currentRow.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-y-1">
                        <IconTag className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Tags:</span>
                        <div className="ml-2 flex flex-wrap gap-1">
                          {currentRow.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-3">Purchase Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <IconShoppingCart className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Total Orders:</span>
                      <span className="ml-2">{currentRow.totalOrders}</span>
                    </div>
                    <div className="flex items-center">
                      <IconCash className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Total Spent:</span>
                      <span className="ml-2">₹{currentRow.totalSpent.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center">
                      <IconCreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Avg. Order Value:</span>
                      <span className="ml-2">
                        {currentRow.totalOrders > 0 
                          ? `₹${Math.round(currentRow.totalSpent / currentRow.totalOrders).toLocaleString('en-IN')}` 
                          : '₹0'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {currentRow.notes && (
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <IconNotes className="h-4 w-4 mr-2 text-muted-foreground" />
                      Notes
                    </h3>
                    <p className="text-sm">{currentRow.notes}</p>
                  </div>
                )}
                
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-3">Lifetime Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Days as Customer</p>
                      <p className="text-lg font-bold">
                        {Math.floor((new Date().getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Purchase Frequency</p>
                      <p className="text-lg font-bold">
                        {currentRow.totalOrders > 0 
                          ? `${Math.round(currentRow.totalOrders / (Math.max(1, Math.floor((new Date().getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30)))))}/mo` 
                          : '0/mo'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="pt-4">
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <h3 className="text-sm font-medium">Recent Orders</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => {
                    onOpenChange(false);
                    setOpen('orders');
                  }}
                >
                  View All Orders
                </Button>
              </div>
              <div className="p-0">
                {recentOrders.length > 0 ? (
                  <div className="divide-y">
                    {recentOrders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-4">
                        <div className="flex flex-col">
                          <div className="font-medium">{order.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(order.date), 'PP')}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="font-medium">{order.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.items} {order.items === 1 ? 'item' : 'items'}
                          </div>
                        </div>
                        <Badge 
                          className={
                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interactions" className="pt-4">
            <div className="rounded-md border">
              <div className="flex items-center justify-between p-4">
                <h3 className="text-sm font-medium">Recent Conversations</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => {
                    onOpenChange(false);
                    setOpen('interactions');
                  }}
                >
                  View All Conversations
                </Button>
              </div>
              <div className="p-0">
                {recentInteractions.length > 0 ? (
                  <div className="divide-y">
                    {recentInteractions.map((interaction, index) => (
                      <div key={index} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(interaction.date), 'PP')}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={
                                interaction.intent === 'Add to Cart' ? 'bg-green-100 text-green-800' : 
                                interaction.intent === 'Order Status' ? 'bg-blue-100 text-blue-800' : 
                                'bg-red-100 text-red-800'
                              }
                            >
                              {interaction.intent}
                            </Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {interaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm">{interaction.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => {
              onOpenChange(false);
              setOpen('update');
            }}
          >
            Edit Customer
          </Button>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}