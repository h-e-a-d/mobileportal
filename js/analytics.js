/**
 * Analytics Module
 * Handles all analytics tracking via Google Tag Manager (GTM)
 * Monitors business metrics and user behavior for performance analysis
 */

class Analytics {
    constructor() {
        this.dataLayer = window.dataLayer || [];
        this.sessionStart = Date.now();
        this.currentPage = null;
        this.currentGame = null;
        this.gameStartTime = null;

        // Initialize session tracking
        this.initSession();

        console.log('[Analytics] Module initialized');
    }

    /**
     * Initialize session tracking
     */
    initSession() {
        // Check if returning visitor
        const lastVisit = localStorage.getItem('analytics_last_visit');
        const visitCount = parseInt(localStorage.getItem('analytics_visit_count') || '0') + 1;

        localStorage.setItem('analytics_visit_count', visitCount.toString());
        localStorage.setItem('analytics_last_visit', Date.now().toString());

        this.push({
            event: 'session_start',
            session_data: {
                visit_count: visitCount,
                is_returning: visitCount > 1,
                time_since_last_visit: lastVisit ? Date.now() - parseInt(lastVisit) : null
            }
        });

        // Track session end on page unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
        });
    }

    /**
     * Push data to GTM dataLayer
     * @param {Object} data - Data to push
     */
    push(data) {
        try {
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push(data);
                console.log('[Analytics] Event tracked:', data.event);
            } else {
                console.warn('[Analytics] GTM dataLayer not available');
            }
        } catch (error) {
            console.error('[Analytics] Error pushing to dataLayer:', error);
        }
    }

    // ========================================
    // PAGE TRACKING
    // ========================================

    /**
     * Track page view
     * @param {string} path - Page path
     * @param {string} title - Page title
     */
    trackPageView(path, title) {
        this.currentPage = path;

        this.push({
            event: 'page_view',
            page_data: {
                path: path,
                title: title,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // GAME TRACKING
    // ========================================

    /**
     * Track when a game is played
     * @param {Object} game - Game object
     */
    trackGamePlay(game) {
        this.currentGame = game;
        this.gameStartTime = Date.now();

        this.push({
            event: 'game_play',
            game_data: {
                game_id: game.id,
                game_name: game.name,
                game_slug: game.slug,
                category: game.category,
                categories: game.categories || [],
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track when a game is closed
     * @param {Object} game - Game object
     */
    trackGameClose(game) {
        const playDuration = this.gameStartTime ? Date.now() - this.gameStartTime : 0;

        this.push({
            event: 'game_close',
            game_data: {
                game_id: game.id,
                game_name: game.name,
                game_slug: game.slug,
                category: game.category,
                play_duration_ms: playDuration,
                play_duration_seconds: Math.round(playDuration / 1000),
                timestamp: new Date().toISOString()
            }
        });

        this.currentGame = null;
        this.gameStartTime = null;
    }

    /**
     * Track game card click (before modal opens)
     * @param {Object} game - Game object
     * @param {string} position - Position in grid (e.g., "row-1-position-3")
     */
    trackGameClick(game, position = null) {
        this.push({
            event: 'game_click',
            game_data: {
                game_id: game.id,
                game_name: game.name,
                game_slug: game.slug,
                category: game.category,
                position: position,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track game favorite action
     * @param {Object} game - Game object
     * @param {boolean} isFavorited - Whether game was added or removed from favorites
     */
    trackGameFavorite(game, isFavorited) {
        this.push({
            event: isFavorited ? 'game_favorite_add' : 'game_favorite_remove',
            game_data: {
                game_id: game.id,
                game_name: game.name,
                game_slug: game.slug,
                category: game.category,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track game fullscreen toggle
     * @param {Object} game - Game object
     * @param {boolean} isFullscreen - Whether entering or exiting fullscreen
     */
    trackGameFullscreen(game, isFullscreen) {
        this.push({
            event: 'game_fullscreen',
            game_data: {
                game_id: game.id,
                game_name: game.name,
                action: isFullscreen ? 'enter' : 'exit',
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // SEARCH & FILTER TRACKING
    // ========================================

    /**
     * Track search query
     * @param {string} query - Search query
     * @param {number} resultsCount - Number of results found
     */
    trackSearch(query, resultsCount) {
        this.push({
            event: 'search',
            search_data: {
                query: query,
                results_count: resultsCount,
                has_results: resultsCount > 0,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track category filter
     * @param {string} category - Category name
     * @param {number} gamesCount - Number of games in category
     */
    trackCategoryFilter(category, gamesCount) {
        this.push({
            event: 'category_filter',
            filter_data: {
                category: category,
                games_count: gamesCount,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // USER ENGAGEMENT TRACKING
    // ========================================

    /**
     * Track favorites page view
     * @param {number} favoritesCount - Number of favorited games
     */
    trackFavoritesView(favoritesCount) {
        this.push({
            event: 'favorites_view',
            engagement_data: {
                favorites_count: favoritesCount,
                has_favorites: favoritesCount > 0,
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track recent games page view
     * @param {number} recentCount - Number of recent games
     */
    trackRecentView(recentCount) {
        this.push({
            event: 'recent_view',
            engagement_data: {
                recent_count: recentCount,
                has_recent: recentCount > 0,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // UI INTERACTION TRACKING
    // ========================================

    /**
     * Track mobile menu toggle
     * @param {boolean} isOpen - Whether menu is being opened or closed
     */
    trackMobileMenu(isOpen) {
        this.push({
            event: 'mobile_menu_toggle',
            ui_data: {
                action: isOpen ? 'open' : 'close',
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track carousel navigation
     * @param {string} category - Category being navigated
     * @param {string} direction - 'next' or 'prev'
     */
    trackCarouselNavigation(category, direction) {
        this.push({
            event: 'carousel_navigation',
            ui_data: {
                category: category,
                direction: direction,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // BUSINESS METRICS
    // ========================================

    /**
     * Track session end and calculate session metrics
     */
    trackSessionEnd() {
        const sessionDuration = Date.now() - this.sessionStart;

        this.push({
            event: 'session_end',
            session_data: {
                duration_ms: sessionDuration,
                duration_seconds: Math.round(sessionDuration / 1000),
                duration_minutes: Math.round(sessionDuration / 60000),
                pages_viewed: this.getPagesViewed(),
                games_played: this.getGamesPlayed(),
                timestamp: new Date().toISOString()
            }
        });
    }

    /**
     * Track error events
     * @param {string} errorType - Type of error
     * @param {string} errorMessage - Error message
     * @param {Object} context - Additional context
     */
    trackError(errorType, errorMessage, context = {}) {
        this.push({
            event: 'error',
            error_data: {
                type: errorType,
                message: errorMessage,
                context: context,
                page: this.currentPage,
                timestamp: new Date().toISOString()
            }
        });
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    /**
     * Get total number of pages viewed in session
     * @returns {number}
     */
    getPagesViewed() {
        const pageViews = this.dataLayer.filter(item => item.event === 'page_view');
        return pageViews.length;
    }

    /**
     * Get total number of games played in session
     * @returns {number}
     */
    getGamesPlayed() {
        const gamePlays = this.dataLayer.filter(item => item.event === 'game_play');
        return gamePlays.length;
    }

    /**
     * Set user properties (for segmentation)
     * @param {Object} properties - User properties
     */
    setUserProperties(properties) {
        this.push({
            event: 'user_properties',
            user_data: properties
        });
    }

    /**
     * Track custom event
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     */
    trackCustomEvent(eventName, eventData = {}) {
        this.push({
            event: eventName,
            custom_data: eventData,
            timestamp: new Date().toISOString()
        });
    }
}

// Create singleton instance
const analytics = new Analytics();

// Expose globally for easy access from other modules
window.Analytics = analytics;
