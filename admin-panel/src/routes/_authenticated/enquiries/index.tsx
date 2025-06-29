import { createFileRoute } from '@tanstack/react-router'
import Enquiries from '@/features/enquiry'

export const Route = createFileRoute('/_authenticated/enquiries/')({
  component:Enquiries,
})
