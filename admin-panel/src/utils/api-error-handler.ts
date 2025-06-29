import { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * Interface for API error response
 */
interface ApiErrorResponse {
  statusCode?: number
  error?: string
  message?: string | string[]
  title?: string
}

/**
 * Handle server errors from API calls
 * @param error The error object from the API call
 * @param defaultMessage Optional default message if error doesn't have a message
 */
export function handleApiError(error: unknown, defaultMessage: string = 'Something went wrong!') {
  // Log the error for debugging
  console.error('API Error:', error)

  // Default error message
  let errorMessage = defaultMessage

  if (error instanceof AxiosError) {
    const response = error.response
    const data = response?.data as ApiErrorResponse | undefined

    if (data) {
      // Handle various error message formats
      if (typeof data.message === 'string') {
        errorMessage = data.message
      } else if (Array.isArray(data.message) && data.message.length > 0) {
        errorMessage = data.message.join('. ')
      } else if (data.title) {
        errorMessage = data.title
      } else if (data.error) {
        errorMessage = data.error
      }
    }

    // Handle specific HTTP status codes
    if (response?.status === 401) {
      errorMessage = 'Your session has expired. Please log in again.'
    } else if (response?.status === 403) {
      errorMessage = 'You do not have permission to perform this action.'
    } else if (response?.status === 404) {
      errorMessage = 'The requested resource was not found.'
    } else if (response?.status === 409) {
      errorMessage = 'This operation cannot be completed due to a conflict.'
    } else if (response?.status === 422) {
      errorMessage = 'Validation failed. Please check your input and try again.'
    } else if (response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.'
    }
  }

  // Show toast notification
  toast.error(errorMessage)

  // Return the error message for further use if needed
  return errorMessage
}

/**
 * Extract validation errors from API response
 * @param error The error object from the API call
 * @returns An object with field names as keys and error messages as values
 */
export function extractValidationErrors(error: unknown): Record<string, string> {
  const validationErrors: Record<string, string> = {}

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    if (data && Array.isArray(data.message)) {
      // Process validation error messages in format: "field: error message"
      data.message.forEach(msg => {
        const match = msg.match(/^([^:]+):\s*(.+)$/)
        if (match) {
          const [, field, message] = match
          validationErrors[field.trim()] = message.trim()
        }
      })
    }
  }

  return validationErrors
}