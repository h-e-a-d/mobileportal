// Service Worker for Kloopik Gaming Portal
// Provides caching and offline functionality

const CACHE_NAME = 'kloopik-v1.0.0';
const STATIC_CACHE_NAME = 'kloopik-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'kloopik-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap'
];

// Game API URLs to cache dynamically
const API_URLS = [
    'https://gamemonetize.com/feed.php',
    'https://api.allorigins.win/get',
    'https://corsproxy.io/',
    'https://cors.eu.org/'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('Failed to cache static files:', error);
            })
    );
    
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete old cache versions
                    if (cacheName !== STATIC_CACHE_NAME && 
                        cacheName !== DYNAMIC_CACHE_NAME &&
                        cacheName.startsWith('kloopik-')) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients immediately
    return self.clients.claim();
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Handle API requests with network-first strategy
    if (isApiRequest(url)) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }
    
    // Handle static files with cache-first strategy
    if (isStaticFile(url)) {
        event.respondWith(cacheFirstStrategy(request));
        return;
    }
    
    // Handle game images with stale-while-revalidate strategy
    if (isGameImage(url)) {
        event.respondWith(staleWhileRevalidateStrategy(request));
        return;
    }
    
    // Default: network-first for everything else
    event.respondWith(networkFirstStrategy(request));
});

// Helper functions for URL classification
function isApiRequest(url) {
    return API_URLS.some(apiUrl => url.href.includes(apiUrl)) ||
           url.pathname.includes('feed.php') ||
           url.searchParams.has('url'); // AllOrigins proxy parameter
}

function isStaticFile(url) {
    return STATIC_FILES.some(file => url.pathname === file) ||
           url.hostname === 'fonts.googleapis.com' ||
           url.hostname === 'fonts.gstatic.com';
}

function isGameImage(url) {
    return url.pathname.includes('.jpg') || 
           url.pathname.includes('.png') || 
           url.pathname.includes('.gif') ||
           url.pathname.includes('.webp') ||
           url.hostname.includes('gamemonetize');
}

// Caching strategies
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache-first strategy failed:', error);
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match('/index.html');
            if (offlineResponse) {
                return offlineResponse;
            }
        }
        
        return new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch in background to update cache
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Fetch failed, but we might have cached version
        return cachedResponse;
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Otherwise wait for network
    return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Background sync triggered:', event.tag);
    
    if (event.tag === 'background-game-sync') {
        event.waitUntil(syncGamesInBackground());
    }
});

async function syncGamesInBackground() {
    try {
        // Sync recent games or other data when back online
        console.log('Syncing games in background...');
        
        const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=20&page=1');
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(response.url, response.clone());
            
            // Notify all clients about the sync
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'SYNC_COMPLETE',
                    data: 'Games synced successfully'
                });
            });
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
        default:
            console.log('Unknown message type:', type);
    }
});

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames
            .filter(name => name.startsWith('kloopik-'))
            .map(name => caches.delete(name))
    );
}

async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {
        staticCache: cacheNames.includes(STATIC_CACHE_NAME),
        dynamicCache: cacheNames.includes(DYNAMIC_CACHE_NAME),
        totalCaches: cacheNames.filter(name => name.startsWith('kloopik-')).length
    };
    return status;
}

console.log('Service Worker loaded successfully');