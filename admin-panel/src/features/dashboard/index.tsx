import { useState } from 'react'
import {
  Users,
  ShoppingBag,
  Truck,
  Bot,
  MessageSquare,
  AlertTriangle,
  Server,
  Plus,
  FileText,
  RefreshCw,
  UserCog,
  MoreVertical,
  ExternalLink,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ShoppingCart,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

// Dummy data for AI usage metrics
const aiUsageData = [
  { name: 'Mon', requests: 120, errors: 3 },
  { name: 'Tue', requests: 145, errors: 5 },
  { name: 'Wed', requests: 162, errors: 8 },
  { name: 'Thu', requests: 134, errors: 2 },
  { name: 'Fri', requests: 183, errors: 4 },
  { name: 'Sat', requests: 98, errors: 1 },
  { name: 'Sun', requests: 107, errors: 3 },
]

// Dummy data for recent WhatsApp interactions
const recentMessages = [
  {
    id: 1,
    customer: 'Ravi Sharma',
    message: 'I want to order 2 shirts in blue',
    intent: 'Add to Cart',
    timestamp: '2 mins ago',
  },
  {
    id: 2,
    customer: 'Priya Patel',
    message: 'Where is my order #WS-2534?',
    intent: 'Order Status',
    timestamp: '8 mins ago',
  },
  {
    id: 3,
    customer: 'Amit Kumar',
    message: 'Cancel my last order please',
    intent: 'Cancel Order',
    timestamp: '15 mins ago',
  },
  {
    id: 4,
    customer: 'Meena Singh',
    message: 'Do you have red color in this dress?',
    intent: 'Product Query',
    timestamp: '23 mins ago',
  },
  {
    id: 5,
    customer: 'Sanjay Gupta',
    message: 'Show me all cotton shirts under Rs. 1000',
    intent: 'Product Search',
    timestamp: '45 mins ago',
  },
]

// Dummy data for live orders
const liveOrders = [
  {
    id: 'WS-2578',
    customer: 'Akash Patel',
    items: 3,
    total: '₹2,450',
    status: 'Pending',
  },
  {
    id: 'WS-2577',
    customer: 'Divya Shah',
    items: 1,
    total: '₹899',
    status: 'Processing',
  },
  {
    id: 'WS-2576',
    customer: 'Rahul Mehta',
    items: 5,
    total: '₹5,230',
    status: 'Fulfilled',
  },
  {
    id: 'WS-2575',
    customer: 'Neha Joshi',
    items: 2,
    total: '₹1,750',
    status: 'Pending',
  },
  {
    id: 'WS-2574',
    customer: 'Vikram Singh',
    items: 2,
    total: '₹1,200',
    status: 'Failed',
  },
]

// Dummy data for low stock alerts
const lowStockItems = [
  {
    id: 1,
    name: 'Cotton Casual Shirt (M)',
    supplier: 'Fashion Hub',
    quantity: 3,
    threshold: 10,
  },
  {
    id: 2,
    name: 'Premium Jeans (32)',
    supplier: 'Denim World',
    quantity: 2,
    threshold: 5,
  },
  {
    id: 3,
    name: 'Leather Watch - Brown',
    supplier: 'TimeZone',
    quantity: 1,
    threshold: 3,
  },
]

// Dummy data for system health
const systemHealth = [
  { service: 'NestJS API', status: 'Healthy', uptime: '9d 23h 12m' },
  { service: 'FastAPI NLP Service', status: 'Healthy', uptime: '5d 14h 30m' },
  { service: 'RabbitMQ', status: 'Degraded', uptime: '12d 6h 8m' },
  { service: 'gRPC Services', status: 'Healthy', uptime: '6d 2h 44m' },
]

// Status badge color mapping
const getStatusColor = (status) => {
  const statusMap = {
    Pending: 'bg-yellow-500',
    Processing: 'bg-blue-500',
    Fulfilled: 'bg-green-500',
    Failed: 'bg-red-500',
    Healthy: 'bg-green-500',
    Degraded: 'bg-yellow-500',
    Down: 'bg-red-500',
  }
  return statusMap[status] || 'bg-gray-500'
}

// Intent badge style mapping
const getIntentStyle = (intent) => {
  const intentMap = {
    'Add to Cart': 'bg-green-100 text-green-800',
    'Order Status': 'bg-blue-100 text-blue-800',
    'Cancel Order': 'bg-red-100 text-red-800',
    'Product Query': 'bg-purple-100 text-purple-800',
    'Product Search': 'bg-indigo-100 text-indigo-800',
  }
  return intentMap[intent] || 'bg-gray-100 text-gray-800'
}

// Custom order status icon component
const OrderStatusIcon = ({ status }) => {
  switch (status) {
    case 'Pending':
      return <Clock className='h-4 w-4 text-yellow-500' />
    case 'Processing':
      return <RefreshCw className='h-4 w-4 text-blue-500' />
    case 'Fulfilled':
      return <CheckCircle2 className='h-4 w-4 text-green-500' />
    case 'Failed':
      return <XCircle className='h-4 w-4 text-red-500' />
    default:
      return null
  }
}

export default function Dashboard() {
  const [activeOrdersFilter, setActiveOrdersFilter] = useState('all')

  // Filter orders based on active filter
  const filteredOrders =
    activeOrdersFilter === 'all'
      ? liveOrders
      : liveOrders.filter(
          (order) =>
            order.status.toLowerCase() === activeOrdersFilter.toLowerCase()
        )

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main Content ===== */}
      <Main>
        <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-muted-foreground mt-1'>
              Monitor your WhatsApp Shop platform at a glance
            </p>
          </div>

          <div className='mt-4 flex items-center space-x-2 md:mt-0'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Product
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className='mr-2 h-4 w-4' />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Trigger AI Sync
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCog className='mr-2 h-4 w-4' />
                  Manage Roles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>

        {/* ===== KPI Summary Cards ===== */}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Enquiries
          </CardTitle>
          <MessageSquare className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">873</div>
          <p className="text-muted-foreground text-xs">
            +58 since yesterday
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Orders
          </CardTitle>
          <ShoppingBag className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">145</div>
          <p className="text-muted-foreground text-xs">
            +12% from yesterday
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cart Lost
          </CardTitle>
          <ShoppingCart className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24.3%</div>
          <p className="text-muted-foreground text-xs">
            -2.1% from last week
          </p>
        </CardContent>
      </Card>
    </div>
        {/* ===== AI Usage Chart + Live Orders ===== */}

        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Live Orders Table */}
          <Card className='col-span-1 lg:col-span-2'>
            <CardHeader>
              <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between'>
                <CardTitle>Recent Orders</CardTitle>
                <Tabs
                  value={activeOrdersFilter}
                  onValueChange={setActiveOrdersFilter}
                  className='w-full max-w-sm'
                >
                  <TabsList className='grid w-full grid-cols-5'>
                    <TabsTrigger value='all'>All</TabsTrigger>
                    <TabsTrigger value='pending'>Pending</TabsTrigger>
                    <TabsTrigger value='processing'>Processing</TabsTrigger>
                    <TabsTrigger value='fulfilled'>Fulfilled</TabsTrigger>
                    <TabsTrigger value='failed'>Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <CardDescription>
                Recent orders with their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <div className='inline-block min-w-full align-middle'>
                  <div className='overflow-hidden rounded-md border'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Order ID
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Customer
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Items
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Total
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Status
                          </th>
                          <th
                            scope='col'
                            className='px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase'
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200 bg-white'>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className='hover:bg-gray-50'>
                            <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
                              {order.id}
                            </td>
                            <td className='px-6 py-4 text-sm whitespace-nowrap text-gray-500'>
                              {order.customer}
                            </td>
                            <td className='px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
                              {order.items}
                            </td>
                            <td className='px-6 py-4 text-right text-sm whitespace-nowrap text-gray-500'>
                              {order.total}
                            </td>
                            <td className='px-6 py-4 text-center text-sm whitespace-nowrap'>
                              <div className='inline-flex items-center gap-1.5'>
                                <OrderStatusIcon status={order.status} />
                                <Badge
                                  className={`${getStatusColor(order.status)} text-white`}
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </td>
                            <td className='px-6 py-4 text-right text-sm font-medium whitespace-nowrap'>
                              <div className='flex justify-end space-x-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='h-8 w-8 p-0'
                                >
                                  <Eye className='h-4 w-4' />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      className='h-8 w-8 p-0'
                                    >
                                      <MoreVertical className='h-4 w-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end'>
                                    <DropdownMenuItem>
                                      View details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Update status
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      Contact customer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-muted-foreground text-sm'>
                  Showing {filteredOrders.length} of {liveOrders.length} orders
                </div>
                <Button variant='outline' size='sm'>
                  View All Orders
                  <ExternalLink className='ml-2 h-3 w-3' />
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Recent WhatsApp Interactions */}
          <Card className='col-span-1'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center justify-between'>
                <span>Recent Interactions</span>
                <Button variant='ghost' size='icon'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </CardTitle>
              <CardDescription>
                Latest WhatsApp messages from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className='flex flex-col space-y-2 rounded-md border p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>{message.customer}</div>
                      <Badge
                        variant='outline'
                        className={getIntentStyle(message.intent)}
                      >
                        {message.intent}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground line-clamp-2 text-sm'>
                      {message.message}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-xs'>
                        {message.timestamp}
                      </span>
                      <Button variant='ghost' size='sm' className='h-6 px-2'>
                        <MessageSquare className='mr-1 h-3 w-3' />
                        <span className='text-xs'>Reply</span>
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant='outline' size='sm' className='w-full'>
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Live Orders + Low Stock ===== */}
        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* AI Usage Metrics */}
          <Card className='col-span-1 lg:col-span-2'>
            <CardHeader>
              <CardTitle>AI Usage Metrics</CardTitle>
              <CardDescription>
                OpenAI requests and error rates for the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart
                    data={aiUsageData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id='colorRequests'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#8884d8'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#8884d8'
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id='colorErrors'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='#f87171'
                          stopOpacity={0.8}
                        />
                        <stop
                          offset='95%'
                          stopColor='#f87171'
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey='name' />
                    <YAxis />
                    <CartesianGrid strokeDasharray='3 3' />
                    <Tooltip />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='requests'
                      stroke='#8884d8'
                      fillOpacity={1}
                      fill='url(#colorRequests)'
                      name='API Requests'
                    />
                    <Area
                      type='monotone'
                      dataKey='errors'
                      stroke='#f87171'
                      fillOpacity={1}
                      fill='url(#colorErrors)'
                      name='Errors'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className='mt-4 flex justify-between'>
                <div className='text-center'>
                  <div className='text-muted-foreground text-sm font-medium'>
                    Total Requests
                  </div>
                  <div className='text-xl font-bold'>949</div>
                </div>
                <div className='text-center'>
                  <div className='text-muted-foreground text-sm font-medium'>
                    Avg. Response Time
                  </div>
                  <div className='text-xl font-bold'>1.2s</div>
                </div>
                <div className='text-center'>
                  <div className='text-muted-foreground text-sm font-medium'>
                    Error Rate
                  </div>
                  <div className='text-xl font-bold'>2.8%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className='col-span-1'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center'>
                <AlertTriangle className='mr-2 h-5 w-5 text-amber-500' />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>
                Items below their minimum threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className='flex flex-col space-y-2 rounded-md border p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='font-medium'>{item.name}</div>
                      <Badge
                        variant='outline'
                        className='bg-amber-100 text-amber-800'
                      >
                        {item.quantity} left
                      </Badge>
                    </div>
                    <div className='text-muted-foreground text-sm'>
                      Supplier: {item.supplier}
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground text-xs'>
                        Threshold: {item.threshold}
                      </span>
                      <Button size='sm' className='h-7'>
                        Restock
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant='outline' size='sm' className='w-full'>
                  View All Low Stock Items
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== System Health ===== */}
        {/* <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Status of all connected services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {systemHealth.map((service, idx) => (
                  <div key={idx} className="flex flex-col space-y-2 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{service.service}</div>
                      <Badge className={`${getStatusColor(service.status)} text-white`}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Uptime: {service.uptime}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Products',
    href: '/products',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Customers',
    href: '/customers',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    isActive: false,
    disabled: false,
  },
]
