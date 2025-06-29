import { createFileRoute } from '@tanstack/react-router'
import Category from '@/features/category'

export const Route = createFileRoute('/_authenticated/category/')({
  component:Category,
})
