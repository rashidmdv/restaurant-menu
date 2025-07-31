import { ZodError } from 'zod'
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { toast } from 'sonner'
import { handleApiError, extractValidationErrors } from './api-error-handler'

/**
 * Handle client-side validation errors from Zod
 * @param error The Zod validation error
 * @param form The react-hook-form instance
 * @returns boolean indicating if errors were set
 */
export function handleZodValidationError<T extends FieldValues>(
  error: ZodError,
  form: UseFormReturn<T>
): boolean {
  const errors = error.flatten()
  let hasErrors = false

  // Set field errors
  Object.entries(errors.fieldErrors).forEach(([field, messages]) => {
    if (messages && messages.length > 0) {
      form.setError(field as Path<T>, {
        type: 'validation',
        message: messages[0],
      })
      hasErrors = true
    }
  })

  // Handle form-level errors
  if (errors.formErrors.length > 0) {
    toast.error(errors.formErrors[0])
    hasErrors = true
  }

  return hasErrors
}

/**
 * Handle server-side validation errors and set them on form fields
 * @param error The API error
 * @param form The react-hook-form instance
 * @param defaultMessage Default error message if no specific validation errors found
 */
export function handleServerValidationError<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  defaultMessage: string = 'Validation failed. Please check your input.'
): void {
  // Extract field-specific validation errors
  const validationErrors = extractValidationErrors(error)
  
  let hasFieldErrors = false
  
  // Set field errors from server response
  Object.entries(validationErrors).forEach(([field, message]) => {
    form.setError(field as Path<T>, {
      type: 'server',
      message,
    })
    hasFieldErrors = true
  })

  // If no field-specific errors, show general error
  if (!hasFieldErrors) {
    handleApiError(error, defaultMessage)
  }
}

/**
 * Comprehensive form error handler that handles both client and server errors
 * @param error The error (can be Zod error or API error)
 * @param form The react-hook-form instance
 * @param context Context for error messages (e.g., 'creating category', 'updating item')
 */
export function handleFormError<T extends FieldValues>(
  error: unknown,
  form: UseFormReturn<T>,
  context: string = 'processing form'
): void {
  if (error instanceof ZodError) {
    // Client-side validation error
    handleZodValidationError(error, form)
  } else {
    // Server-side error
    handleServerValidationError(error, form, `Error ${context}. Please try again.`)
  }
}

/**
 * Show success message for form operations
 * @param action The action performed (e.g., 'created', 'updated', 'deleted')
 * @param entity The entity type (e.g., 'category', 'item', 'content section')
 */
export function showFormSuccess(action: string, entity: string): void {
  toast.success(`Successfully ${action} ${entity}`)
}

/**
 * Clear all form errors
 * @param form The react-hook-form instance
 */
export function clearFormErrors<T extends FieldValues>(form: UseFormReturn<T>): void {
  form.clearErrors()
}

/**
 * Validate form data with Zod schema and handle errors
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @param form React Hook Form instance
 * @returns boolean indicating if validation passed
 */
export function validateFormData<T extends FieldValues, S>(
  schema: any,
  data: S,
  form: UseFormReturn<T>
): boolean {
  try {
    schema.parse(data)
    return true
  } catch (error) {
    if (error instanceof ZodError) {
      handleZodValidationError(error, form)
    }
    return false
  }
}