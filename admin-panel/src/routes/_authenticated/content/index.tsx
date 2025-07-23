import { createFileRoute } from '@tanstack/react-router'
import { ContentManagement } from '@/features/content'

export const Route = createFileRoute('/_authenticated/content/')({
  component: ContentManagement,
})