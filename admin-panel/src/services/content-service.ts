import { API } from '@/lib/api'
import { 
  ContentSection, 
  CreateContentRequest, 
  UpdateContentRequest, 
  ContentFilter 
} from '@/features/content/data/schema'

export class ContentService {
  private static baseUrl = '/api/v1/content'

  static async getAllContent(params?: ContentFilter): Promise<ContentSection[]> {
    const queryParams = new URLSearchParams()
    
    if (params?.section_name) queryParams.append('section_name', params.section_name)
    if (params?.active !== undefined) queryParams.append('active', params.active.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.order_by) queryParams.append('order_by', params.order_by)
    if (params?.order_dir) queryParams.append('order_dir', params.order_dir)

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await API.get<{ data: ContentSection[] }>(url)
    
    return response.data.data
  }

  static async getContentById(id: number): Promise<ContentSection> {
    const response = await API.get<{ data: ContentSection }>(`${this.baseUrl}/${id}`)
    
    return response.data.data
  }

  static async getContentBySection(sectionName: string): Promise<ContentSection> {
    const response = await API.get<{ data: ContentSection }>(`${this.baseUrl}/by-key/${sectionName}`)
    
    return response.data.data
  }

  static async createContent(data: CreateContentRequest): Promise<ContentSection> {
    const response = await API.post<{ data: ContentSection }>(this.baseUrl, data)
    
    return response.data.data
  }

  static async updateContent(id: number, data: UpdateContentRequest): Promise<ContentSection> {
    const response = await API.put<{ data: ContentSection }>(`${this.baseUrl}/${id}`, data)
    
    return response.data.data
  }

  static async deleteContent(id: number): Promise<void> {
    await API.delete(`${this.baseUrl}/${id}`)
  }

  static async toggleContentStatus(id: number): Promise<ContentSection> {
    // Get current content first
    const current = await this.getContentById(id)
    
    // Toggle the active status
    return this.updateContent(id, { active: !current.active })
  }
}