"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

/* ── Types ── */
export interface SiteContentData {
  [section: string]: {
    [key: string]: {
      value: string
      label: string
      type: string
      updatedAt: string
    }
  }
}

interface SiteContentContextValue {
  content: SiteContentData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getValue: (key: string) => string
  getJson: (key: string, fallback: unknown) => unknown
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: {},
  loading: true,
  error: null,
  refetch: async () => {},
  getValue: (_key: string) => '',
  getJson: (_key: string, fallback: unknown) => fallback,
})

export function useSiteContent() {
  return useContext(SiteContentContext)
}

/* ── Provider ── */
export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContentData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetchRef = useRef<number>(0)

  const fetchContent = useCallback(async () => {
    try {
      const ts = Date.now()
      const res = await fetch(`/api/cms/content?t=${ts}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data)
        setError(null)
        lastFetchRef.current = Date.now()
      } else {
        setError('Error loading CMS')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Refetch when tab becomes visible (user switches back from admin tab)
  // and when a CMS update is detected via localStorage
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refetch if more than 2 seconds since last fetch (debounce)
        const elapsed = Date.now() - lastFetchRef.current
        if (elapsed > 2000) {
          fetchContent()
        }
      }
    }

    // Listen for CMS updates from admin page via localStorage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cms_updated_at') {
        fetchContent()
      }
    }

    // Also check on window focus (covers cases where visibilitychange doesn't fire)
    const handleFocus = () => {
      const elapsed = Date.now() - lastFetchRef.current
      if (elapsed > 3000) {
        fetchContent()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchContent])

  const getValue = useCallback(
    (key: string): string => {
      for (const section of Object.values(content)) {
        if (section[key]) return section[key].value
      }
      return ''
    },
    [content]
  )

  const getJson = useCallback(
    (key: string, fallback: unknown): unknown => {
      const raw = getValue(key)
      if (!raw) return fallback
      try {
        return JSON.parse(raw)
      } catch {
        return fallback
      }
    },
    [getValue]
  )

  const contextValue: SiteContentContextValue = {
    content,
    loading,
    error,
    refetch: fetchContent,
    getValue,
    getJson,
  }

  return React.createElement(SiteContentContext.Provider, { value: contextValue }, children)
}
