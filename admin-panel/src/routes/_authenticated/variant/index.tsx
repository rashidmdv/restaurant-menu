import { createFileRoute } from '@tanstack/react-router'
import Variant from '@/features/variant'

export const Route = createFileRoute('/_authenticated/variant/')({
  component:Variant,
})
