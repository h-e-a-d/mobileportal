/**
 * Router Module - Handles hash-based routing for game pages and navigation
 * SEO-ready structure prepared for future server-side rendering
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.defaultRoute = '/';

        // Define routes
        this.setupRoutes();

        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRouteChange());

        // Handle initial route
        this.handleRouteChange();
    }

    /**
     * Setup route definitions
     */
    setupRoutes() {
        // Home route
        this.routes.set('/', {
            name: 'home',
            handler: () => this.handleHomeRoute()
        });

        // Game detail route
        this.routes.set('/game/:slug', {
            name: 'game',
            handler: (params) => this.handleGameRoute(params)
        });

        // Favorites route
        this.routes.set('/favorites', {
            name: 'favorites',
            handler: () => this.handleFavoritesRoute()
        });

        // Recently played route
        this.routes.set('/recent', {
            name: 'recent',
            handler: () => this.handleRecentRoute()
        });

        // Category route (optional)
        this.routes.set('/category/:category', {
            name: 'category',
            handler: (params) => this.handleCategoryRoute(params)
        });
    }

    /**
     * Get current path from hash with sanitization
     */
    getCurrentPath() {
        const hash = window.location.hash.slice(1); // Remove #

        if (!hash) {
            return this.defaultRoute;
        }

        // Sanitize hash to prevent XSS
        let sanitized = hash;

        // Remove dangerous characters
        sanitized = sanitized
            .replace(/[<>'"]/g, '')  // Remove HTML special chars
            .replace(/javascript:/gi, '')  // Remove javascript: protocol
            .replace(/data:/gi, '')  // Remove data: protocol
            .replace(/vbscript:/gi, '')  // Remove vbscript: protocol
            .substring(0, 200);  // Limit length

        return sanitized || this.defaultRoute;
    }

    /**
     * Parse route path and extract parameters
     */
    parseRoute(path) {
        for (const [routePath, routeConfig] of this.routes) {
            const params = this.matchRoute(routePath, path);
            if (params !== null) {
                return { routeConfig, params };
            }
        }
        return null;
    }

    /**
     * Match route pattern with path and extract parameters with validation
     */
    matchRoute(pattern, path) {
        const patternParts = pattern.split('/').filter(p => p);
        const pathParts = path.split('/').filter(p => p);

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                // This is a parameter - validate and sanitize
                const paramName = patternPart.slice(1);

                try {
                    let decodedValue = decodeURIComponent(pathPart);

                    // Validate based on parameter type
                    if (paramName === 'slug') {
                        // Slug validation using Sanitizer if available
                        if (typeof window.Sanitizer !== 'undefined') {
                            decodedValue = window.Sanitizer.sanitizeSlug(decodedValue);
                        } else {
                            // Fallback validation for slugs
                            if (!/^[a-z0-9-]+$/i.test(decodedValue) ||
                                decodedValue.includes('..') ||
                                decodedValue.includes('/') ||
                                decodedValue.includes('\\')) {
                                console.warn('[Router] Invalid slug:', decodedValue);
                                return null;
                            }
                        }
                    } else if (paramName === 'category') {
                        // Category validation
                        if (!/^[a-z0-9-]+$/i.test(decodedValue) ||
                            decodedValue.includes('..') ||
                            decodedValue.includes('/') ||
                            decodedValue.includes('\\')) {
                            console.warn('[Router] Invalid category:', decodedValue);
                            return null;
                        }
                    } else {
                        // Generic parameter validation
                        if (decodedValue.includes('..') ||
                            decodedValue.includes('<') ||
                            decodedValue.includes('>') ||
                            decodedValue.length > 100) {
                            console.warn('[Router] Invalid parameter:', decodedValue);
                            return null;
                        }
                    }

                    if (!decodedValue) {
                        return null;
                    }

                    params[paramName] = decodedValue;
                } catch (e) {
                    // Invalid URI encoding
                    console.warn('[Router] URI decode error:', e);
                    return null;
                }
            } else if (patternPart !== pathPart) {
                // Parts don't match
                return null;
            }
        }

        return params;
    }

    /**
     * Handle route change
     */
    handleRouteChange() {
        const path = this.getCurrentPath();
        const routeMatch = this.parseRoute(path);

        if (routeMatch) {
            const { routeConfig, params } = routeMatch;
            this.currentRoute = routeConfig.name;

            // Call route handler
            if (routeConfig.handler) {
                routeConfig.handler(params);
            }

            // Update page title and meta tags
            this.updateMetaTags(routeConfig.name, params);

            // Track page view in analytics
            if (window.Analytics) {
                const pageTitle = document.title;
                window.Analytics.trackPageView(path, pageTitle);
            }
        } else {
            // Route not found, redirect to home
            this.navigate('/');
        }
    }

    /**
     * Navigate to a route
     */
    navigate(path, replace = false) {
        if (replace) {
            window.location.replace(`#${path}`);
        } else {
            window.location.hash = path;
        }
    }

    /**
     * Go back in history
     */
    back() {
        window.history.back();
    }

    /**
     * Handle home route
     */
    handleHomeRoute() {
        // Trigger event for app to handle
        window.dispatchEvent(new CustomEvent('route:home'));
    }

    /**
     * Handle game detail route
     */
    handleGameRoute(params) {
        const { slug } = params;

        // Trigger event for app to handle
        window.dispatchEvent(new CustomEvent('route:game', {
            detail: { slug }
        }));
    }

    /**
     * Handle favorites route
     */
    handleFavoritesRoute() {
        window.dispatchEvent(new CustomEvent('route:favorites'));
    }

    /**
     * Handle recent games route
     */
    handleRecentRoute() {
        window.dispatchEvent(new CustomEvent('route:recent'));
    }

    /**
     * Handle category route
     */
    handleCategoryRoute(params) {
        const { category } = params;

        window.dispatchEvent(new CustomEvent('route:category', {
            detail: { category }
        }));
    }

    /**
     * Update meta tags for SEO
     * Prepared for future server-side rendering
     */
    updateMetaTags(routeName, params = {}) {
        let title = 'Kloopik - Free Online Games';
        let description = 'Play 700+ free online games instantly in your browser!';

        switch (routeName) {
            case 'game':
                // Will be populated when game data is available
                title = `${params.slug} - Play on Kloopik`;
                description = `Play ${params.slug} for free on Kloopik. Start playing instantly in your browser!`;
                break;

            case 'favorites':
                title = 'My Favorites - Kloopik';
                description = 'Your favorite games on Kloopik';
                break;

            case 'recent':
                title = 'Recently Played - Kloopik';
                description = 'Games you recently played on Kloopik';
                break;

            case 'category':
                const categoryName = params.category || 'games';
                title = `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Games - Kloopik`;
                description = `Play the best ${categoryName} games on Kloopik`;
                break;
        }

        // Update title
        document.title = title;

        // Update meta description
        this.updateMetaTag('name', 'description', description);

        // Update Open Graph tags
        this.updateMetaTag('property', 'og:title', title);
        this.updateMetaTag('property', 'og:description', description);

        // Prepared for future i18n
        // this.updateLinkTag('alternate', 'hreflang', currentLanguage);
    }

    /**
     * Update or create meta tag
     */
    updateMetaTag(attribute, attributeValue, content) {
        let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, attributeValue);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    }

    /**
     * Update link tag (for hreflang, canonical, etc.)
     */
    updateLinkTag(rel, attribute, value) {
        let element = document.querySelector(`link[rel="${rel}"][${attribute}]`);

        if (!element) {
            element = document.createElement('link');
            element.setAttribute('rel', rel);
            document.head.appendChild(element);
        }

        element.setAttribute(attribute, value);
    }

    /**
     * Get current route name
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Build URL for route
     */
    buildUrl(routeName, params = {}) {
        switch (routeName) {
            case 'home':
                return '/';

            case 'game':
                return `/game/${params.slug}`;

            case 'favorites':
                return '/favorites';

            case 'recent':
                return '/recent';

            case 'category':
                return `/category/${params.category}`;

            default:
                return '/';
        }
    }

    /**
     * Update game meta tags with full game data
     * Called when game data is loaded
     */
    updateGameMetaTags(game) {
        if (!game) return;

        const title = `${game.title} - Play Free on Kloopik`;
        const description = game.description
            ? game.description.substring(0, 160)
            : `Play ${game.title} for free on Kloopik. Start playing instantly in your browser!`;

        document.title = title;
        this.updateMetaTag('name', 'description', description);
        this.updateMetaTag('property', 'og:title', title);
        this.updateMetaTag('property', 'og:description', description);

        // Update OG image if available
        if (game.images && game.images.length > 0) {
            this.updateMetaTag('property', 'og:image', game.images[0]);
        }

        // Update canonical URL (prepared for future use)
        // this.updateLinkTag('canonical', 'href', `https://kloopik.com/game/${game.slug}`);
    }
}

// Create global instance
const router = new Router();
