import { createFileRoute } from '@tanstack/react-router'
import Make from '@/features/make'

export const Route = createFileRoute('/_authenticated/make/')({
  component:Make,
})
