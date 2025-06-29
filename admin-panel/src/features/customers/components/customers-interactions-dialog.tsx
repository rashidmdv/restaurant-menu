// File: web/src/features/customers/components/customers-interactions-dialog.tsx

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  IconMessageCircle,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconSortDescending,
  IconEye,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
  IconMessageDots,
  IconCircleCheck,
  IconCircle,
  IconCircleX
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

export function CustomersInteractionsDialog({ open, onOpenChange, currentRow }: Props) {
  const [filterIntent, setFilterIntent] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Mock interaction data
  const interactions = [
    { 
      id: 'INT-8782', 
      date: '2025-05-15T09:30:00', 
      message: 'I want to order 2 cotton shirts in blue color, size M.', 
      intent: 'Add to Cart',
      status: 'Resolved',
      sentiment: 'positive',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-7868', 
      date: '2025-04-28T14:20:00', 
      message: 'Where is my order WS-2534? It\'s been 3 days already!', 
      intent: 'Order Status',
      status: 'Resolved',
      sentiment: 'negative',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-7452', 
      date: '2025-04-15T10:10:00', 
      message: 'I received the wrong product. Ordered red but got blue.', 
      intent: 'Return Request',
      status: 'Resolved',
      sentiment: 'negative',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-7113', 
      date: '2025-03-22T16:45:00', 
      message: 'Do you have this jacket in size L?', 
      intent: 'Product Query',
      status: 'Resolved',
      sentiment: 'neutral',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-6978', 
      date: '2025-03-10T12:30:00', 
      message: 'Thank you for the quick delivery! The product is excellent.', 
      intent: 'Feedback',
      status: 'Resolved',
      sentiment: 'positive',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-6751', 
      date: '2025-02-28T09:15:00', 
      message: 'I want to know if you have smart watches in stock?', 
      intent: 'Product Query',
      status: 'Resolved',
      sentiment: 'neutral',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-6542', 
      date: '2025-02-15T13:40:00', 
      message: 'Can you add one more item to my order WS-2176?', 
      intent: 'Order Modification',
      status: 'Resolved',
      sentiment: 'neutral',
      channel: 'WhatsApp'
    },
    { 
      id: 'INT-6321', 
      date: '2025-01-30T11:20:00', 
      message: 'I want to cancel my order WS-2176. I ordered the wrong size.', 
      intent: 'Cancel Order',
      status: 'Resolved',
      sentiment: 'neutral',
      channel: 'WhatsApp'
    },
  ];
  
  // Filter interactions based on intent
  const filteredInteractions = filterIntent === 'all' 
    ? interactions 
    : interactions.filter(interaction => 
        interaction.intent.toLowerCase().replace(' ', '_') === filterIntent.toLowerCase()
      );
  
  // Sort interactions by date
  const sortedInteractions = [...filteredInteractions].sort((a, b) => {
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
    
  // Helper function to get sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment.toLowerCase()) {
      case 'positive': return <IconMoodSmile className="h-4 w-4 text-green-500" />;
      case 'neutral': return <IconMoodNeutral className="h-4 w-4 text-blue-500" />;
      case 'negative': return <IconMoodSad className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'resolved': return <IconCircleCheck className="h-4 w-4 text-green-500" />;
      case 'pending': return <IconCircle className="h-4 w-4 text-yellow-500" />;
      case 'ignored': return <IconCircleX className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  // Helper function to get intent badge color
  const getIntentColor = (intent: string) => {
    switch(intent.toLowerCase()) {
      case 'add to cart': return 'bg-green-100 text-green-800';
      case 'order status': return 'bg-blue-100 text-blue-800';
      case 'product query': return 'bg-purple-100 text-purple-800';
      case 'return request': 
      case 'cancel order': return 'bg-red-100 text-red-800';
      case 'feedback': return 'bg-amber-100 text-amber-800';
      case 'order modification': return 'bg-indigo-100 text-indigo-800';
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
              <IconMessageCircle className="h-5 w-5" />
              <span>Conversations with {currentRow.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Badge>{interactions.length} Messages</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex-1 w-full sm:max-w-xs">
            <Input
              placeholder="Search conversations..."
              className="h-9"
              prefix={<IconSearch className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={filterIntent} onValueChange={setFilterIntent}>
              <SelectTrigger className="h-9 w-full sm:w-[160px]">
                <div className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4" />
                  <SelectValue placeholder="All Intents" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Intents</SelectItem>
                <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                <SelectItem value="order_status">Order Status</SelectItem>
                <SelectItem value="product_query">Product Query</SelectItem>
                <SelectItem value="return_request">Return Request</SelectItem>
                <SelectItem value="cancel_order">Cancel Order</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="order_modification">Order Modification</SelectItem>
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
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[300px]">Message</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInteractions.length > 0 ? (
                sortedInteractions.map((interaction) => (
                  <TableRow key={interaction.id} className="group">
                    <TableCell className="font-medium">{interaction.id}</TableCell>
                    <TableCell>{format(new Date(interaction.date), 'PP')}</TableCell>
                    <TableCell className="max-w-[300px] truncate" title={interaction.message}>
                      {interaction.message}
                    </TableCell>
                    <TableCell>
                      <Badge className={getIntentColor(interaction.intent)}>
                        {interaction.intent}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(interaction.status)}
                        <span>{interaction.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getSentimentIcon(interaction.sentiment)}
                        <span className="capitalize">{interaction.sentiment}</span>
                      </div>
                    </TableCell>
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
                    No conversations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {sortedInteractions.length} of {interactions.length} conversations
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
          >
            <IconMessageDots className="h-4 w-4" />
            Start New Conversation
          </Button>
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