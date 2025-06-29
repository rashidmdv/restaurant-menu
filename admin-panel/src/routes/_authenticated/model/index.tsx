import { createFileRoute } from '@tanstack/react-router'
import Model from '@/features/model'

export const Route = createFileRoute('/_authenticated/model/')({
  component:Model,
})
