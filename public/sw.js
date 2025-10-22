const CACHE_NAME = "gym-app-v2"
const urlsToCache = [
    "/",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
    "/malibu_logo.png",
    "/malibu_logo.png",
]

// Instalar el service worker
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache)
            })
            .then(() => {
                return self.skipWaiting()
            }),
    )
})

// Activar el service worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName)
                        }
                    }),
                )
            })
            .then(() => {
                return self.clients.claim()
            }),
    )
})

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return fetch(event.request)
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Solo cachear respuestas exitosas
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                    const responseClone = networkResponse.clone()
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone)
                    })
                }
                return networkResponse
            }).catch((error) => {
                console.log("Network request failed:", error)
                return cachedResponse 
            })
            if (cachedResponse) {
                fetchPromise.catch(() => {}) 
                return cachedResponse
            }
            return fetchPromise
        })
    )
})

// Manejar notificaciones push
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

// Manejar clicks en notificaciones
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

// Manejar cierre de notificaciones
self.addEventListener("notificationclose", (event) => {
    const data = event.notification.data
    if (data && data.trackClose) {
        // Aquí podrías enviar datos de analytics
    }
})

// Manejar mensajes desde la aplicación
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

// Manejar errores
self.addEventListener("error", (event) => {
    console.error("Service Worker: Error", event.error)
})

// Manejar errores no capturados
self.addEventListener("unhandledrejection", (event) => {
    console.error("Service Worker: Unhandled rejection", event.reason)
})
