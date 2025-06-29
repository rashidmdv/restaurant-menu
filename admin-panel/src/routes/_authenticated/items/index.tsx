import { createFileRoute } from '@tanstack/react-router'
import Items from '@/features/Items'

export const Route = createFileRoute('/_authenticated/items/')({
  component:Items,
})
