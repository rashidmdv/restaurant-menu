import { createFileRoute } from '@tanstack/react-router'
import SubCategory from '@/features/sub-category'

export const Route = createFileRoute('/_authenticated/sub-category/')({
  component:SubCategory,
})
