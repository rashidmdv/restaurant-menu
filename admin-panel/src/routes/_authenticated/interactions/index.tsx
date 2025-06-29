import { createFileRoute } from '@tanstack/react-router'
import Interactions from '@/features/interactions'

export const Route = createFileRoute('/_authenticated/interactions/')({
  component: Interactions,
})