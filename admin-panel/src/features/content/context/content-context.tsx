import React, { createContext, useContext, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ContentSection, CreateContentRequest, UpdateContentRequest } from '../data/schema'
import { ContentService } from '@/services/content-service'

interface ContentContextType {
  // Data
  content: ContentSection[]
  loading: boolean
  selectedContent: ContentSection | null
  
  // Dialog states
  viewDialogOpen: boolean
  mutateDialogOpen: boolean
  deleteDialogOpen: boolean
  
  // Actions
  setContent: (content: ContentSection[]) => void
  setLoading: (loading: boolean) => void
  setSelectedContent: (content: ContentSection | null) => void
  setViewDialogOpen: (open: boolean) => void
  setMutateDialogOpen: (open: boolean) => void
  setDeleteDialogOpen: (open: boolean) => void
  
  // API Actions
  fetchContent: () => Promise<void>
  createContent: (data: CreateContentRequest) => Promise<void>
  updateContent: (id: number, data: UpdateContentRequest) => Promise<void>
  deleteContent: (id: number) => Promise<void>
  toggleContentStatus: (id: number) => Promise<void>
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentSection[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentSection | null>(null)
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [mutateDialogOpen, setMutateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ContentService.getAllContent()
      setContent(data)
    } catch (error) {
      console.error('Failed to fetch content:', error)
      toast.error('Failed to load content sections')
    } finally {
      setLoading(false)
    }
  }, [])

  const createContent = useCallback(async (data: CreateContentRequest) => {
    try {
      const newContent = await ContentService.createContent(data)
      setContent((prev) => [...prev, newContent])
      toast.success('Content section created successfully')
      setMutateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create content:', error)
      toast.error('Failed to create content section')
      throw error
    }
  }, [])

  const updateContent = useCallback(async (id: number, data: UpdateContentRequest) => {
    try {
      const updatedContent = await ContentService.updateContent(id, data)
      setContent((prev) => 
        prev.map((item) => (item.id === id ? updatedContent : item))
      )
      toast.success('Content section updated successfully')
      setMutateDialogOpen(false)
    } catch (error) {
      console.error('Failed to update content:', error)
      toast.error('Failed to update content section')
      throw error
    }
  }, [])

  const deleteContent = useCallback(async (id: number) => {
    try {
      await ContentService.deleteContent(id)
      setContent((prev) => prev.filter((item) => item.id !== id))
      toast.success('Content section deleted successfully')
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Failed to delete content:', error)
      toast.error('Failed to delete content section')
      throw error
    }
  }, [])

  const toggleContentStatus = useCallback(async (id: number) => {
    try {
      const updatedContent = await ContentService.toggleContentStatus(id)
      setContent((prev) => 
        prev.map((item) => (item.id === id ? updatedContent : item))
      )
      toast.success(`Content section ${updatedContent.active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      console.error('Failed to toggle content status:', error)
      toast.error('Failed to update content status')
      throw error
    }
  }, [])

  const value: ContentContextType = {
    // Data
    content,
    loading,
    selectedContent,
    
    // Dialog states
    viewDialogOpen,
    mutateDialogOpen,
    deleteDialogOpen,
    
    // Actions
    setContent,
    setLoading,
    setSelectedContent,
    setViewDialogOpen,
    setMutateDialogOpen,
    setDeleteDialogOpen,
    
    // API Actions
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    toggleContentStatus,
  }

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContentContext() {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContentContext must be used within a ContentProvider')
  }
  return context
}