/**
 * Service Worker - PWA Caching Strategy
 * Provides offline support and faster repeat visits
 */

const CACHE_NAME = 'kloopik-v1';
const RUNTIME_CACHE = 'kloopik-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/cookie-consent.css',
    '/js/sanitizer.js',
    '/js/cookie-consent.js',
    '/js/analytics.js',
    '/js/storage.js',
    '/js/router.js',
    '/js/games.js',
    '/js/app.js',
    '/js/data-export.js',
    '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[ServiceWorker] Installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Delete old caches
                            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // Allow through but don't cache
        event.respondWith(fetch(request));
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!request.url.startsWith('http')) {
        return;
    }

    // Strategy: Cache first, then network
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    console.log('[ServiceWorker] Serving from cache:', request.url);

                    // Update cache in background for next time
                    event.waitUntil(
                        fetch(request)
                            .then(networkResponse => {
                                return caches.open(RUNTIME_CACHE).then(cache => {
                                    cache.put(request, networkResponse.clone());
                                    return networkResponse;
                                });
                            })
                            .catch(() => {
                                // Network failed, but we have cache
                                console.log('[ServiceWorker] Network update failed, using cache');
                            })
                    );

                    return cachedResponse;
                }

                // Not in cache, fetch from network
                console.log('[ServiceWorker] Fetching from network:', request.url);
                return fetch(request)
                    .then(networkResponse => {
                        // Cache the response for future use
                        if (request.method === 'GET' && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();

                            caches.open(RUNTIME_CACHE)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }

                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('[ServiceWorker] Fetch failed:', error);

                        // Return offline page or error response
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }

                        // For other resources, throw error
                        throw error;
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('[ServiceWorker] Clearing cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'sync-analytics') {
        event.waitUntil(
            // Sync any pending analytics
            console.log('[ServiceWorker] Syncing analytics data')
        );
    }
});

// Push notification (future feature)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received:', event);

    const options = {
        body: event.data ? event.data.text() : 'New notification from Kloopik',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('Kloopik', options)
    );
});
