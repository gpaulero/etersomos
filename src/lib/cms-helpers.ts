/**
 * Client-side CMS helpers that fetch from the API with fallback to hardcoded defaults.
 * These are used by pages that DON'T use the context (non-page components or pages that want explicit control).
 */
import { defaultSiteContent } from '@/lib/cms-defaults'

/** Fetch all CMS content as a flat key-value map */
export async function fetchCmsContent(): Promise<Record<string, string>> {
  try {
    // Ensure seed
    await fetch('/api/cms/content/seed', { method: 'POST' }).catch(() => {})
    const res = await fetch('/api/cms/content')
    if (res.ok) {
      const data = await res.json()
      const flat: Record<string, string> = {}
      for (const section of Object.values(data)) {
        for (const [key, item] of Object.entries(section as Record<string, { value: string }>)) {
          flat[key] = item.value
        }
      }
      return flat
    }
  } catch {}
  // Fallback: build from defaults
  const fallback: Record<string, string> = {}
  for (const item of defaultSiteContent) {
    fallback[item.key] = item.value
  }
  return fallback
}

/** Helper: get string from flat map with fallback */
export function cmsValue(map: Record<string, string>, key: string, fallback: string): string {
  const v = map[key]
  return v && v.trim() ? v : fallback
}

/** Helper: parse JSON from flat map with fallback */
export function cmsJson<T>(map: Record<string, string>, key: string, fallback: T): T {
  const v = map[key]
  if (!v || !v.trim()) return fallback
  try {
    return JSON.parse(v) as T
  } catch {
    return fallback
  }
}

/** Helper: get number from flat map with fallback */
export function cmsNumber(map: Record<string, string>, key: string, fallback: number): number {
  const v = Number(map[key])
  return isNaN(v) ? fallback : v
}
