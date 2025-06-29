import { createFileRoute } from '@tanstack/react-router'
import Brands from '@/features/brands'

export const Route = createFileRoute('/_authenticated/brands/')({
  component:Brands,
})
