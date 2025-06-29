// File: web/src/features/orders/components/orders-details-dialog.tsx

import { format } from 'date-fns'
import { 
  IconTruck, 
  IconUser, 
  IconPhone, 
  IconCalendar, 
  IconCash,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { paymentMethods, paymentStatuses, statuses } from '../data/data'
import { Order } from '../data/schema'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Order
}

export function OrdersDetailsDialog({ open, onOpenChange, currentRow }: Props) {
  // Find status from data
  const status = statuses.find((s) => s.value === currentRow.status)
  const paymentStatus = paymentStatuses.find((s) => s.value === currentRow.paymentStatus)
  const paymentMethod = paymentMethods.find((m) => m.value === currentRow.paymentMethod)

  // Sample order items for demo
  const orderItems = [
    { id: 1, name: 'Cotton T-Shirt (Blue, M)', price: '₹499', quantity: 1, total: '₹499' },
    { id: 2, name: 'Denim Jeans (Black, 32)', price: '₹1,299', quantity: 1, total: '₹1,299' },
    { id: 3, name: 'Sports Shoes (White, 9)', price: '₹1,799', quantity: 1, total: '₹1,799' },
  ].slice(0, currentRow.orderItems)

  // Status badge style mapping
  const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  // Payment status style mapping
  const paymentStatusColorMap: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
  }

  const orderDate = new Date(currentRow.orderDate)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order {currentRow.id}</span>
            <Badge className={cn("ml-2", statusColorMap[currentRow.status])}>
              {status?.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <IconUser className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Customer:</span>
              <span className="ml-2">{currentRow.customerName}</span>
            </div>
            <div className="flex items-center">
              <IconPhone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Phone:</span>
              <span className="ml-2">{currentRow.customerPhone}</span>
            </div>
            <div className="flex items-center">
              <IconCalendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Order Date:</span>
              <span className="ml-2">{format(orderDate, 'PPpp')}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              {paymentMethod?.icon && (
                <paymentMethod.icon className="h-4 w-4 mr-2 text-muted-foreground" />
              )}
              <span className="font-medium">Payment Method:</span>
              <span className="ml-2">{paymentMethod?.label}</span>
            </div>
            <div className="flex items-center">
              <IconCash className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Payment Status:</span>
              <Badge className={cn("ml-2", paymentStatusColorMap[currentRow.paymentStatus])}>
                {paymentStatus?.label}
              </Badge>
            </div>
            <div className="flex items-center">
              <IconTruck className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">Delivery Status:</span>
              <span className="ml-2">{status?.label}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="py-4">
          <h3 className="text-lg font-medium mb-3">Order Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right">{item.price}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Separator />

        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            Total {currentRow.orderItems} {currentRow.orderItems === 1 ? 'item' : 'items'}
          </div>
          <div className="text-xl font-bold">
            {currentRow.totalAmount}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Print Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}