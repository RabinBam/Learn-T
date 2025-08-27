// src/lib/firebase/analytics.ts
import app from './client'

export async function getAnalyticsBrowser() {
  if (typeof window === 'undefined') return null
  const { isSupported, getAnalytics } = await import('firebase/analytics')
  return (await isSupported()) ? getAnalytics(app) : null
}
