import { useState, useEffect } from 'react'

/**
 * A custom hook that returns a debounced value
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timeout on value change or unmount
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}