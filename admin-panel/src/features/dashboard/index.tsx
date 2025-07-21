import { useState, useEffect } from 'react'
import {
  Utensils,
  BookOpen,
  Grid3x3,
  Eye,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  Plus,
  RefreshCw,
  MoreVertical,
  ChefHat,
  Star,
  AlertCircle,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
  Legend,
  PieChart,
  Pie,
  Cell,
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { 
  DashboardService, 
  type DashboardStats, 
  type RecentActivity, 
  type CategoryStats,
  type PriceDistribution 
} from '@/services/dashboard-service'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [priceDistribution, setPriceDistribution] = useState<PriceDistribution[]>([])
  const [weeklyChart, setWeeklyChart] = useState<{ name: string; items: number }[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [
        dashboardStats,
        recentData,
        categoriesData,
        priceData,
        weeklyData
      ] = await Promise.all([
        DashboardService.getDashboardStats(),
        DashboardService.getRecentActivity(),
        DashboardService.getCategoryStats(),
        DashboardService.getPriceDistribution(),
        DashboardService.getWeeklyItemsChart()
      ])

      setStats(dashboardStats)
      setRecentActivity(recentData)
      setCategoryStats(categoriesData)
      setPriceDistribution(priceData)
      setWeeklyChart(weeklyData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'item':
        return <Utensils className="h-4 w-4 text-green-600" />
      case 'category':
        return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'subcategory':
        return <Grid3x3 className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'item':
        return 'bg-green-100 text-green-800'
      case 'category':
        return 'bg-blue-100 text-blue-800'
      case 'subcategory':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <>
        <Header>
          <TopNav links={topNav} />
          <div className='ml-auto flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Restaurant Dashboard</h1>
            <p className='text-muted-foreground mt-1'>
              Monitor your menu and restaurant operations at a glance
            </p>
          </div>

          <div className='mt-4 flex items-center space-x-2 md:mt-0'>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Plus className='mr-2 h-4 w-4' />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Menu Management</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Utensils className='mr-2 h-4 w-4' />
                  Add Menu Item
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className='mr-2 h-4 w-4' />
                  Add Category
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Grid3x3 className='mr-2 h-4 w-4' />
                  Add Sub-Category
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ChefHat className='mr-2 h-4 w-4' />
                  Restaurant Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            <Button onClick={loadDashboardData}>
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              <Utensils className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems || 0}</div>
              <p className="text-muted-foreground text-xs">
                {stats?.availableItems || 0} available, {stats?.unavailableItems || 0} unavailable
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
              <p className="text-muted-foreground text-xs">
                {stats?.totalSubCategories || 0} sub-categories
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avgPrice || 0} AED</div>
              <p className="text-muted-foreground text-xs">
                Across all menu items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentItemsCount || 0}</div>
              <p className="text-muted-foreground text-xs">
                Items added this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Weekly Items Chart */}
          <Card className='col-span-1 lg:col-span-2'>
            <CardHeader>
              <CardTitle>Items Added This Week</CardTitle>
              <CardDescription>
                Daily breakdown of new menu items added
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={weeklyChart}>
                    <defs>
                      <linearGradient id='colorItems' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#8884d8' stopOpacity={0.8} />
                        <stop offset='95%' stopColor='#8884d8' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey='name' />
                    <YAxis />
                    <CartesianGrid strokeDasharray='3 3' />
                    <Tooltip />
                    <Area
                      type='monotone'
                      dataKey='items'
                      stroke='#8884d8'
                      fillOpacity={1}
                      fill='url(#colorItems)'
                      name='Items Added'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className='col-span-1'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center justify-between'>
                <span>Recent Activity</span>
                <Button variant='ghost' size='icon'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </CardTitle>
              <CardDescription>
                Latest menu updates and additions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivity.slice(0, 6).map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className='flex items-center space-x-3 rounded-md border p-3'
                  >
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className='flex items-center justify-between'>
                        <div className='font-medium truncate'>{activity.name}</div>
                        <Badge
                          variant='outline'
                          className={getActivityBadgeColor(activity.type)}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {activity.action} • {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant='outline' size='sm' className='w-full'>
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Stats and Price Distribution */}
        <div className='mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Items count and average price by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={categoryStats.slice(0, 6)}>
                    <XAxis 
                      dataKey='name' 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <CartesianGrid strokeDasharray='3 3' />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='itemCount' fill='#8884d8' name='Items Count' />
                    <Bar dataKey='avgPrice' fill='#82ca9d' name='Avg Price (AED)' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Price Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Price Distribution</CardTitle>
              <CardDescription>
                Distribution of menu items by price range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={priceDistribution}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={({ range, percentage }) => `${range}: ${percentage}%`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='count'
                    >
                      {priceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Details Table */}
        <div className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Detailed breakdown of all menu categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase'>
                        Category
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                        Total Items
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                        Available Items
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                        Avg Price
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {categoryStats.map((category) => (
                      <tr key={category.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900'>
                          {category.name}
                        </td>
                        <td className='px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
                          {category.itemCount}
                        </td>
                        <td className='px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
                          {category.availableItems}
                        </td>
                        <td className='px-6 py-4 text-center text-sm whitespace-nowrap text-gray-500'>
                          {category.avgPrice} AED
                        </td>
                        <td className='px-6 py-4 text-center text-sm whitespace-nowrap'>
                          <Badge
                            className={
                              category.availableItems === category.itemCount
                                ? 'bg-green-100 text-green-800'
                                : category.availableItems === 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {category.availableItems === category.itemCount
                              ? 'All Available'
                              : category.availableItems === 0
                              ? 'None Available'
                              : 'Partially Available'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Dashboard',
    href: '/',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Menu Items',
    href: '/items',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Categories',
    href: '/categories',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
]
