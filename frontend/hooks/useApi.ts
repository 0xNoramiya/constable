'use client'

import { useState, useCallback } from 'react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiReturn㰎xtends UseApiState<T> {
  fetchData: (endpoint: string, options?: RequestInit) => Promise<void>
  reset: () => void
}

export function useApi<T = Record<string, unknown>>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const url = `${API_BASE_URL}${endpoint}`
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()
      setState({ data: result as T, loading: false, error: null })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      console.error('API Error:', err)
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    fetchData,
    reset,
  }
}
