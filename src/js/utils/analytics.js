/**
 * Simplified Analytics utilities
 */
class Analytics {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Initialize Google Analytics 4
        this.initGA4();
        this.isInitialized = true;
    }

    initGA4() {
        // Initialize gtag if not already loaded
        if (typeof gtag === 'undefined') {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() {
                dataLayer.push(arguments);
            };
            gtag('js', new Date());
            gtag('config', 'GTM-PK768FJP');
        }
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) return;

        // Track with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                page_location: window.location.href,
                page_title: document.title,
                ...parameters
            });
        }

        // Log for debugging
        console.log(`Analytics Event: ${eventName}`, parameters);
    }

    trackPageView(url = window.location.href, title = document.title) {
        this.trackEvent('page_view', {
            page_location: url,
            page_title: title
        });
    }

    trackGameInteraction(gameId, gameTitle, action) {
        this.trackEvent('game_interaction', {
            game_id: gameId,
            game_title: gameTitle,
            game_action: action
        });
    }

    trackSearch(searchTerm) {
        this.trackEvent('search', {
            search_term: searchTerm
        });
    }
}

// Initialize analytics
window.analytics = new Analytics();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}