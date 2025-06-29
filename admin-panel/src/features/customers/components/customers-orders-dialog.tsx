import { useState } from 'react'
import { format } from 'date-fns'
import { 
  IconShoppingCart,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconCheck,
  IconX,
  IconClock,
  IconTruck,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Customer } from '../data/schema'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Customer
}

export function CustomersOrdersDialog({ open, onOpenChange, currentRow }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Mock order data
  const orders = [
    {
      id: 'WS-2578',
      date: '2025-05-10T15:30:00',
      items: 3,
      total: '₹2,450',
      status: 'Delivered',
      payment: 'UPI',
      products: ['Cotton T-Shirt (Blue, M)', 'Denim Jeans (Black, 32)', 'Sports Shoes (White, 9)']
    },
    {
      id: 'WS-2534',
      date: '2025-04-28T12:15:00',
      items: 1,
      total: '₹899',
      status: 'Delivered',
      payment: 'COD',
      products: ['Leather Watch (Brown)']
    },
    {
      id: 'WS-2487',
      date: '2025-04-15T09:45:00',
      items: 2,
      total: '₹1,399',
      status: 'Returned',
      payment: 'Card',
      products: ['Summer Dress (Red, S)', 'Sunglasses (Black)']
    },
    {
      id: 'WS-2386',
      date: '2025-03-22T14:20:00',
      items: 4,
      total: '₹3,899',
      status: 'Delivered',
      payment: 'UPI',
      products: ['Winter Jacket (Black, L)', 'Woolen Scarf (Gray)', 'Gloves (Black, M)', 'Beanie (Black)']
    },
    {
      id: 'WS-2299',
      date: '2025-03-10T11:05:00',
      items: 1,
      total: '₹12,999',
      status: 'Delivered',
      payment: 'Card',
      products: ['Smartphone (Black, 128GB)']
    },
    {
      id: 'WS-2176',
      date: '2025-02-17T16:45:00',
      items: 2,
      total: '₹1,250',
      status: 'Cancelled',
      payment: 'COD',
      products: ['Cotton Shirt (White, L)', 'Cotton Shirt (Blue, L)']
    },
    {
      id: 'WS-2035',
      date: '2025-01-28T09:30:00',
      items: 1,
      total: '₹2,499',
      status: 'Delivered',
      payment: 'UPI',
      products: ['Wireless Earbuds (Black)']
    },
    {
      id: 'WS-1988',
      date: '2025-01-15T13:40:00',
      items: 3,
      total: '₹4,250',
      status: 'Delivered',
      payment: 'Card',
      products: ['Running Shoes (Gray, 9)', 'Sports T-Shirt (Black, M)', 'Track Pants (Black, M)']
    },
  ];
  
  // Filter orders based on status
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());
  
  // Sort orders by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Get initials for avatar
  const initials = currentRow.name.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
    
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return <IconCheck className="h-4 w-4 text-green-500" />;
      case 'processing': 
      case 'pending': return <IconClock className="h-4 w-4 text-yellow-500" />;
      case 'shipped': return <IconTruck className="h-4 w-4 text-blue-500" />;
      case 'cancelled': 
      case 'returned': return <IconX className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'processing': 
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': 
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconShoppingCart className="h-5 w-5" />
              <span>Orders for {currentRow.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Badge>{currentRow.totalOrders} Orders</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              placeholder="Search orders..."
              className="h-9"
              prefix={<IconSearch className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-full sm:w-[140px]">
                <div className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4" />
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              {sortOrder === 'desc' ? (
                <IconSortDescending className="h-4 w-4" />
              ) : (
                <IconSortAscending className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order) => (
                  <TableRow key={order.id} className="group">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{format(new Date(order.date), 'PP')}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{order.payment}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {sortedOrders.length} of {currentRow.totalOrders} orders
          </div>
          <div className="text-sm font-medium">
            Total Spent: ₹{currentRow.totalSpent.toLocaleString('en-IN')}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}