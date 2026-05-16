"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

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

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/content')
      if (res.ok) {
        const data = await res.json()
        setContent(data)
        setError(null)
      } else {
        setError('Error loading CMS')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
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
