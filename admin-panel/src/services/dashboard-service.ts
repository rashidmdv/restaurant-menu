export interface DashboardStats {
  totalCategories: number
  totalSubCategories: number
  totalItems: number
  availableItems: number
  unavailableItems: number
  avgPrice: number
  recentItemsCount: number
  recentCategoriesCount: number
}

export interface RecentActivity {
  id: number
  type: 'item' | 'category' | 'subcategory'
  name: string
  action: 'created' | 'updated'
  createdAt: string
  updatedAt: string
}

export interface CategoryStats {
  id: number
  name: string
  itemCount: number
  availableItems: number
  avgPrice: number
}

export interface PriceDistribution {
  range: string
  count: number
  percentage: number
}

import { API } from '@/lib/api'

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const response = await API.get('/v1/dashboard/stats')
    const stats = response.data.data
    
    // Transform backend snake_case to frontend camelCase
    return {
      totalCategories: stats.total_categories,
      totalSubCategories: stats.total_sub_categories,
      totalItems: stats.total_items,
      availableItems: stats.available_items,
      unavailableItems: stats.unavailable_items,
      avgPrice: stats.average_price,
      recentItemsCount: stats.recent_items_count,
      recentCategoriesCount: stats.recent_categories_count
    }
  }

  static async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await API.get('/v1/dashboard/activity')
    
    // Transform backend snake_case to frontend camelCase
    return response.data.data.map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      name: activity.name,
      action: activity.action,
      createdAt: activity.created_at,
      updatedAt: activity.updated_at
    }))
  }

  static async getCategoryStats(): Promise<CategoryStats[]> {
    const response = await API.get('/v1/dashboard/categories')
    
    // Transform backend snake_case to frontend camelCase
    return response.data.data.map((category: any) => ({
      id: category.id,
      name: category.name,
      itemCount: category.item_count,
      availableItems: category.available_items,
      avgPrice: category.average_price
    }))
  }

  static async getPriceDistribution(): Promise<PriceDistribution[]> {
    const response = await API.get('/v1/dashboard/price-distribution')
    return response.data.data
  }

  static async getWeeklyItemsChart(): Promise<{ name: string; items: number }[]> {
    const response = await API.get('/v1/dashboard/weekly-items')
    
    // Transform backend format to frontend expected format
    return response.data.data.map((item: any) => ({
      name: item.day,
      items: item.count
    }))
  }
}