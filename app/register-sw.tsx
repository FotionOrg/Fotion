'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, refresh to update
                  console.log('🔄 New content available, please refresh.')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
