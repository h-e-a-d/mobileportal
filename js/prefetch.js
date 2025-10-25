/**
 * Prefetch Module
 * Smart prefetching for improved performance
 */

class PrefetchManager {
    constructor() {
        this.prefetchedCategories = new Set();
        this.prefetchedImages = new Set();
        this.prefetchQueue = [];
        this.isProcessing = false;
        this.observer = null;
    }

    /**
     * Initialize prefetch manager
     */
    init() {
        this.setupIntersectionObserver();
        this.setupHoverPrefetch();

        if (window.logger) {
            window.logger.info('[Prefetch] Initialized');
        }
    }

    /**
     * Setup Intersection Observer for lazy loading
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('[Prefetch] IntersectionObserver not supported');
            return;
        }

        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleIntersection(entry.target);
                }
            });
        }, options);
    }

    /**
     * Observe element for intersection
     */
    observe(element) {
        if (this.observer && element) {
            this.observer.observe(element);
        }
    }

    /**
     * Unobserve element
     */
    unobserve(element) {
        if (this.observer && element) {
            this.observer.unobserve(element);
        }
    }

    /**
     * Handle element intersection
     */
    handleIntersection(element) {
        // Prefetch category data if needed
        const category = element.dataset.prefetchCategory;
        if (category && !this.prefetchedCategories.has(category)) {
            this.prefetchCategory(category);
        }

        // Load image
        const img = element.querySelector('img[data-src]');
        if (img) {
            this.loadImage(img);
        }

        // Unobserve after handling
        this.unobserve(element);
    }

    /**
     * Setup hover prefetch for game cards
     */
    setupHoverPrefetch() {
        // Use event delegation
        document.addEventListener('mouseover', (e) => {
            const gameCard = e.target.closest('.game-card');
            if (gameCard && !gameCard.dataset.prefetched) {
                this.prefetchGameData(gameCard);
                gameCard.dataset.prefetched = 'true';
            }
        }, { passive: true });
    }

    /**
     * Prefetch game data on hover
     */
    prefetchGameData(gameCard) {
        const gameSlug = gameCard.dataset.gameSlug;
        if (!gameSlug) return;

        // Prefetch the game page
        const gamePageUrl = `/catalog/${gameSlug}/index.html`;
        this.addToPrefetchQueue(gamePageUrl, 'document');

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackCustomEvent('game_prefetch_hover', {
                gameSlug: gameSlug
            });
        }
    }

    /**
     * Prefetch category data
     */
    async prefetchCategory(category) {
        if (this.prefetchedCategories.has(category)) {
            return;
        }

        const categoryUrl = `/data/${category}-games.json`;

        try {
            // Use low priority fetch
            const response = await fetch(categoryUrl, {
                priority: 'low',
                credentials: 'same-origin'
            });

            if (response.ok) {
                // Read the response to cache it
                await response.json();
                this.prefetchedCategories.add(category);

                if (window.logger) {
                    window.logger.debug('[Prefetch] Prefetched category:', category);
                }
            }
        } catch (error) {
            console.error('[Prefetch] Error prefetching category:', category, error);
        }
    }

    /**
     * Load image
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src || this.prefetchedImages.has(src)) {
            return;
        }

        img.src = src;
        img.removeAttribute('data-src');
        this.prefetchedImages.add(src);

        // Handle load/error
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        }, { once: true });

        img.addEventListener('error', () => {
            img.classList.add('error');
            console.warn('[Prefetch] Image load error:', src);
        }, { once: true });
    }

    /**
     * Add URL to prefetch queue
     */
    addToPrefetchQueue(url, type = 'fetch') {
        if (!this.prefetchQueue.find(item => item.url === url)) {
            this.prefetchQueue.push({ url, type });
            this.processPrefetchQueue();
        }
    }

    /**
     * Process prefetch queue
     */
    async processPrefetchQueue() {
        if (this.isProcessing || this.prefetchQueue.length === 0) {
            return;
        }

        // Only prefetch when browser is idle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this._processPrefetch());
        } else {
            setTimeout(() => this._processPrefetch(), 100);
        }
    }

    /**
     * Internal prefetch processor
     */
    async _processPrefetch() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.prefetchQueue.length > 0) {
            const item = this.prefetchQueue.shift();

            try {
                if (item.type === 'fetch') {
                    await fetch(item.url, {
                        priority: 'low',
                        credentials: 'same-origin'
                    });
                } else if (item.type === 'document') {
                    // Use link prefetch for HTML documents
                    this.prefetchLink(item.url);
                } else if (item.type === 'image') {
                    this.prefetchImage(item.url);
                }

                // Small delay between prefetches
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.warn('[Prefetch] Error prefetching:', item.url, error);
            }
        }

        this.isProcessing = false;
    }

    /**
     * Prefetch link using <link rel="prefetch">
     */
    prefetchLink(url) {
        if (document.querySelector(`link[href="${url}"]`)) {
            return; // Already prefetched
        }

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    }

    /**
     * Prefetch image
     */
    prefetchImage(url) {
        if (this.prefetchedImages.has(url)) {
            return;
        }

        const img = new Image();
        img.src = url;
        this.prefetchedImages.add(url);
    }

    /**
     * Preload critical resources
     */
    preloadCriticalResources() {
        // Preload featured games data
        this.addToPrefetchQueue('/data/featured-games.json', 'fetch');

        // Preload categories index
        this.addToPrefetchQueue('/data/categories-index.json', 'fetch');

        if (window.logger) {
            window.logger.info('[Prefetch] Preloading critical resources');
        }
    }

    /**
     * Prefetch next page of games
     */
    prefetchNextPage(games, currentIndex) {
        const nextGames = games.slice(currentIndex, currentIndex + 12);

        nextGames.forEach(game => {
            if (game.images && game.images[0]) {
                this.addToPrefetchQueue(game.images[0], 'image');
            }
        });
    }

    /**
     * Prefetch related games
     */
    prefetchRelatedGames(gameSlug) {
        // This would prefetch the related games section
        // Implementation depends on how related games are determined
        if (window.logger) {
            window.logger.debug('[Prefetch] Prefetching related games for:', gameSlug);
        }
    }

    /**
     * Clear prefetch cache
     */
    clearCache() {
        this.prefetchedCategories.clear();
        this.prefetchedImages.clear();
        this.prefetchQueue = [];
        return true;
    }

    /**
     * Get prefetch statistics
     */
    getStats() {
        return {
            categoriesPrefetched: this.prefetchedCategories.size,
            imagesPrefetched: this.prefetchedImages.size,
            queueLength: this.prefetchQueue.length,
            isProcessing: this.isProcessing
        };
    }
}

// Create global instance
const prefetchManager = new PrefetchManager();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        prefetchManager.init();
        prefetchManager.preloadCriticalResources();
    });
} else {
    prefetchManager.init();
    prefetchManager.preloadCriticalResources();
}
