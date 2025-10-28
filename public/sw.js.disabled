const CACHE_NAME = "gym-app-v5"
const urlsToCache = [
    "/manifest.json",
    "/malibu_logo.png",
    "/icons/android/android-launchericon-192-192.png",
    "/icons/android/android-launchericon-512-512.png",
    "/icons/ios/16.png",
    "/icons/ios/32.png",
    "/icons/ios/180.png",
    "/offline.html"
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache.filter(url => url !== "/"))
            })
            .then(() => {
                console.log("Service Worker installed")
            })
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log("Deleting old cache:", cacheName)
                            return caches.delete(cacheName)
                        }
                    }),
                )
            }),
            self.clients.claim()
        ]).then(() => {
            console.log("Service Worker activated")
        })
    )
})

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return
    }

    const url = new URL(event.request.url)
    
    // Para navegación principal (recarga de página)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('/offline.html')
                })
        )
        return
    }

    // No interceptar solicitudes a la API o recursos específicos
    if (
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.includes('webpack-hmr') ||
        url.pathname.includes('hot-update') ||
        url.search.includes('_rsc=') ||
        event.request.headers.get('accept')?.includes('text/x-component')
    ) {
        return
    }

    if (url.pathname === '/manifest.json' || url.pathname.includes('.png')) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }
                
                return fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone()
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone)
                        })
                    }
                    return response
                }).catch(() => {
                    return new Response('', { status: 404 })
                })
            })
        )
    }
})

self.addEventListener("push", (event) => {
    let notificationData = {
        title: "Gimnasio App",
        body: "Nueva notificación",
        icon: "/malibu_logo.png",
        badge: "/malibu_logo.png",
        tag: "default",
        data: {},
    }

    if (event.data) {
        try {
            const data = event.data.json()
            notificationData = { ...notificationData, ...data }
        } catch (e) {
            notificationData.body = event.data.text()
        }
    }

    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        tag: notificationData.tag,
        data: notificationData.data,
        actions: notificationData.actions || [],
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false,
        vibrate: notificationData.vibrate || [200, 100, 200],
    }

    event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

self.addEventListener("notificationclick", (event) => {
    event.notification.close()

    const action = event.action
    const data = event.notification.data

    let url = "/"

    if (action) {
        switch (action) {
            case "view_workout":
                url = "/workouts"
                break
            case "view_goal":
                url = "/profile?tab=goals"
                break
            case "view_membership":
                url = "/profile?tab=membership"
                break
            case "update_progress":
                url = "/profile?tab=measurements"
                break
            default:
                url = data.url || "/"
        }
    } else if (data && data.url) {
        url = data.url
    }

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.navigate(url)
                    return client.focus()
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url)
            }
        }),
    )
})

self.addEventListener("notificationclose", (event) => {
    const data = event.notification.data
    if (data && data.trackClose) {

    }
})

self.addEventListener("message", (event) => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case "SKIP_WAITING":
                self.skipWaiting()
                break
            case "GET_VERSION":
                event.ports[0].postMessage({ version: CACHE_NAME })
                break
            case "CLEAR_CACHE":
                caches.delete(CACHE_NAME).then(() => {
                    event.ports[0].postMessage({ success: true })
                })
                break
        }
    }
})

self.addEventListener("error", (event) => {
    console.error("Service Worker: Error", event.error)
})

self.addEventListener("unhandledrejection", (event) => {
    console.error("Service Worker: Unhandled rejection", event.reason)
})
