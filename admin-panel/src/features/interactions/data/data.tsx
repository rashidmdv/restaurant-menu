import {
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconMessageCircle,
  IconMessageCircleQuestion,
  IconShoppingCart,
  IconInfoCircle,
  IconAlertTriangle,
  IconThumbUp,
  IconThumbDown,
  IconMoodSmile,
  IconMoodNeutral,
  IconMoodSad,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTelegram,
} from '@tabler/icons-react'

export const statuses = [
  {
    value: 'new',
    label: 'New',
    icon: IconCircle,
  },
  {
    value: 'processing',
    label: 'Processing',
    icon: IconClock,
  },
  {
    value: 'resolved',
    label: 'Resolved',
    icon: IconCircleCheck,
  },
  {
    value: 'pending',
    label: 'Pending',
    icon: IconClock,
  },
  {
    value: 'ignored',
    label: 'Ignored',
    icon: IconCircleX,
  },
]

export const intents = [
  {
    value: 'add_to_cart',
    label: 'Add to Cart',
    icon: IconShoppingCart,
  },
  {
    value: 'order_status',
    label: 'Order Status',
    icon: IconInfoCircle,
  },
  {
    value: 'product_query',
    label: 'Product Query',
    icon: IconMessageCircleQuestion,
  },
  {
    value: 'cancel_order',
    label: 'Cancel Order',
    icon: IconCircleX,
  },
  {
    value: 'return_request',
    label: 'Return Request',
    icon: IconAlertTriangle,
  },
  {
    value: 'general_inquiry',
    label: 'General Inquiry',
    icon: IconMessageCircle,
  },
  {
    value: 'complaint',
    label: 'Complaint',
    icon: IconThumbDown,
  },
  {
    value: 'feedback',
    label: 'Feedback',
    icon: IconThumbUp,
  },
]

export const sentiments = [
  {
    value: 'positive',
    label: 'Positive',
    icon: IconMoodSmile,
  },
  {
    value: 'neutral',
    label: 'Neutral',
    icon: IconMoodNeutral,
  },
  {
    value: 'negative',
    label: 'Negative',
    icon: IconMoodSad,
  },
]

export const channels = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: IconBrandWhatsapp,
  },
  {
    value: 'facebook',
    label: 'Facebook',
    icon: IconBrandFacebook,
  },
  {
    value: 'instagram',
    label: 'Instagram',
    icon: IconBrandInstagram,
  },
  {
    value: 'telegram',
    label: 'Telegram',
    icon: IconBrandTelegram,
  },
]

export function getSentimentFromScore(score: number): string {
  if (score >= 0.4) return 'positive'
  if (score <= -0.4) return 'negative'
  return 'neutral'
}

export function getIntentColor(intent: string): string {
  const intentColorMap: Record<string, string> = {
    add_to_cart: 'bg-green-100 text-green-800',
    order_status: 'bg-blue-100 text-blue-800',
    product_query: 'bg-purple-100 text-purple-800',
    cancel_order: 'bg-red-100 text-red-800',
    return_request: 'bg-orange-100 text-orange-800',
    general_inquiry: 'bg-gray-100 text-gray-800',
    complaint: 'bg-red-100 text-red-800',
    feedback: 'bg-indigo-100 text-indigo-800',
  }
  return intentColorMap[intent] || 'bg-gray-100 text-gray-800'
}

export function getStatusColor(status: string): string {
  const statusColorMap: Record<string, string> = {
    new: 'bg-blue-500',
    processing: 'bg-yellow-500',
    resolved: 'bg-green-500',
    pending: 'bg-indigo-500',
    ignored: 'bg-gray-500',
  }
  return statusColorMap[status] || 'bg-gray-500'
}

export function getSentimentColor(sentiment: string): string {
  const sentimentColorMap: Record<string, string> = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-blue-100 text-blue-800',
    negative: 'bg-red-100 text-red-800',
  }
  return sentimentColorMap[sentiment] || 'bg-gray-100 text-gray-800'
}