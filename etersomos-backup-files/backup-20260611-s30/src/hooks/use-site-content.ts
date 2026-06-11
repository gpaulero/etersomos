"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'

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
  /** Flat key→value map for use with cmsValue/cmsJson/cmsNumber helpers */
  cmsMap: Record<string, string>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  getValue: (key: string) => string
  getJson: (key: string, fallback: unknown) => unknown
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: {},
  cmsMap: {},
  loading: true,
  error: null,
  refetch: async () => {},
  getValue: (_key: string) => '',
  getJson: (_key: string, fallback: unknown) => fallback,
})

export function useSiteContent() {
  return useContext(SiteContentContext)
}

/**
 * Dispatch this custom event from the admin page (same tab) to trigger
 * an immediate refetch of CMS content on the public pages.
 * Usage: window.dispatchEvent(new CustomEvent('cms-updated'))
 */
export const CMS_UPDATED_EVENT = 'cms-updated'

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

  // Compute flat key→value map from nested content (for cmsValue/cmsJson/cmsNumber)
  const cmsMap = useMemo(() => {
    const flat: Record<string, string> = {}
    for (const section of Object.values(content)) {
      for (const [key, item] of Object.entries(section as Record<string, { value: string }>)) {
        flat[key] = item.value
      }
    }
    return flat
  }, [content])

  // Initial fetch
  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Refetch when tab becomes visible (user switches back from admin tab),
  // when a CMS update is detected via localStorage (cross-tab), or
  // when a same-tab cms-updated custom event fires (admin in same tab).
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

    // Listen for CMS updates from admin page via localStorage event (cross-tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cms_updated_at') {
        fetchContent()
      }
    }

    // Listen for same-tab CMS updates via custom event (admin embedded in same page)
    const handleCmsUpdated = () => {
      fetchContent()
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
    window.addEventListener(CMS_UPDATED_EVENT, handleCmsUpdated)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(CMS_UPDATED_EVENT, handleCmsUpdated)
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
    cmsMap,
    loading,
    error,
    refetch: fetchContent,
    getValue,
    getJson,
  }

  return React.createElement(SiteContentContext.Provider, { value: contextValue }, children)
}
