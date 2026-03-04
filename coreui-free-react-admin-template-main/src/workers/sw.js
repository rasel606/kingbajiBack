// public/sw.js (Service Worker for offline support)
const CACHE_NAME = 'notifications-v1'
const urlsToCache = ['/', '/static/js/bundle.js', '/static/css/main.css', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync here
      console.log('Background sync triggered'),
    )
  }
})

self.addEventListener('push', (event) => {
  if (event.data) {
    const notification = event.data.json()

    event.waitUntil(
      self.registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        data: notification,
      }),
    )
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          client.focus()
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            payload: event.notification.data,
          })
          return
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    }),
  )
})
