declare const self: ServiceWorkerGlobalScope

self.addEventListener('install', (_) => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('push', (event) => {
  const data = event.data?.json()

  if (!data) {
    return;
  }
  const title = data.title
  const body = data.descr ?? ''

  const options: NotificationOptions = {
    body,
    icon: '/icon-192.png',
    badge: '/icon-48.png'
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})