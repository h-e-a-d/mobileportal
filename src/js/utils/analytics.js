/**
 * Analytics utilities for tracking user interactions
 */
class Analytics {
    constructor() {
        this.isInitialized = false;
        this.events = [];
        this.init();
    }

    init() {
        // Initialize Google Analytics 4
        this.initGA4();
        
        // Initialize custom tracking
        this.initCustomTracking();
        
        this.isInitialized = true;
        
        // Process queued events
        this.processQueuedEvents();
    }

    initGA4() {
        // Load Google Analytics 4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
            dataLayer.push(arguments);
        };
        
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    initCustomTracking() {
        // Track page load time
        window.addEventListener('load', () => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            this.trackEvent('page_load_time', {
                load_time: loadTime,
                page_url: window.location.href
            });
        });

        // Track scroll depth
        this.trackScrollDepth();
        
        // Track click heatmap
        this.trackClickHeatmap();
        
        // Track user session
        this.trackUserSession();
    }

    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized) {
            this.events.push({ eventName, parameters });
            return;
        }

        // Track with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: parameters.category || 'engagement',
                event_label: parameters.label || '',
                value: parameters.value || 0,
                custom_parameter_1: parameters.custom_1 || '',
                custom_parameter_2: parameters.custom_2 || '',
                page_location: window.location.href,
                page_title: document.title,
                timestamp: new Date().toISOString(),
                ...parameters
            });
        }

        // Track with Google Tag Manager
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: eventName,
                eventCategory: parameters.category || 'engagement',
                eventAction: eventName,
                eventLabel: parameters.label || '',
                eventValue: parameters.value || 0,
                pageUrl: window.location.href,
                pageTitle: document.title,
                timestamp: new Date().toISOString(),
                ...parameters
            });
        }

        // Custom tracking (can be extended for other analytics platforms)
        this.logCustomEvent(eventName, parameters);
    }

    trackPageView(url = window.location.href, title = document.title) {
        this.trackEvent('page_view', {
            page_location: url,
            page_title: title,
            page_referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`
        });
    }

    trackGameInteraction(gameId, gameTitle, action, additionalData = {}) {
        this.trackEvent('game_interaction', {
            game_id: gameId,
            game_title: gameTitle,
            game_action: action,
            category: 'game',
            ...additionalData
        });
    }

    trackScrollDepth() {
        let maxScroll = 0;
        let scrollDepthMarks = [25, 50, 75, 100];
        let marksHit = [];

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollDepthMarks.forEach(mark => {
                    if (scrollPercent >= mark && !marksHit.includes(mark)) {
                        marksHit.push(mark);
                        this.trackEvent('scroll_depth', {
                            scroll_depth: mark,
                            page_url: window.location.href
                        });
                    }
                });
            }
        });
    }

    trackClickHeatmap() {
        document.addEventListener('click', (e) => {
            const element = e.target;
            const elementType = element.tagName.toLowerCase();
            const elementClass = element.className;
            const elementId = element.id;
            const elementText = element.textContent?.substring(0, 50) || '';
            
            // Get click coordinates
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.trackEvent('click_heatmap', {
                element_type: elementType,
                element_class: elementClass,
                element_id: elementId,
                element_text: elementText,
                click_x: x,
                click_y: y,
                page_x: e.pageX,
                page_y: e.pageY,
                viewport_width: window.innerWidth,
                viewport_height: window.innerHeight
            });
        });
    }

    trackUserSession() {
        const sessionId = this.generateSessionId();
        const sessionStart = new Date().toISOString();
        
        // Track session start
        this.trackEvent('session_start', {
            session_id: sessionId,
            session_start: sessionStart,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookie_enabled: navigator.cookieEnabled,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Track session end on page unload
        window.addEventListener('beforeunload', () => {
            const sessionEnd = new Date().toISOString();
            const sessionDuration = new Date() - new Date(sessionStart);
            
            this.trackEvent('session_end', {
                session_id: sessionId,
                session_end: sessionEnd,
                session_duration: sessionDuration,
                page_views: this.getPageViewCount()
            });
        });
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    getPageViewCount() {
        // In a real implementation, this would track page views across the session
        return 1;
    }

    processQueuedEvents() {
        this.events.forEach(({ eventName, parameters }) => {
            this.trackEvent(eventName, parameters);
        });
        this.events = [];
    }

    logCustomEvent(eventName, parameters) {
        // Custom logging - can be extended to send to custom analytics service
        console.log(`Analytics Event: ${eventName}`, parameters);
        
        // Example: Send to custom analytics endpoint
        if (window.CUSTOM_ANALYTICS_ENDPOINT) {
            fetch(window.CUSTOM_ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    parameters: parameters,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            }).catch(error => {
                console.warn('Failed to send custom analytics:', error);
            });
        }
    }

    // Enhanced ecommerce tracking for games
    trackGameView(gameId, gameTitle, gameCategory) {
        this.trackEvent('view_item', {
            item_id: gameId,
            item_name: gameTitle,
            item_category: gameCategory,
            content_type: 'game'
        });
    }

    trackGameStart(gameId, gameTitle, gameCategory) {
        this.trackEvent('begin_game', {
            item_id: gameId,
            item_name: gameTitle,
            item_category: gameCategory
        });
    }

    trackGameComplete(gameId, gameTitle, gameCategory, score = null, time = null) {
        this.trackEvent('complete_game', {
            item_id: gameId,
            item_name: gameTitle,
            item_category: gameCategory,
            score: score,
            completion_time: time
        });
    }

    trackSearch(searchTerm, resultsCount = 0) {
        this.trackEvent('search', {
            search_term: searchTerm,
            results_count: resultsCount
        });
    }

    trackShare(gameId, gameTitle, platform) {
        this.trackEvent('share', {
            item_id: gameId,
            item_name: gameTitle,
            platform: platform,
            content_type: 'game'
        });
    }

    // A/B Testing support
    trackExperiment(experimentId, variantId) {
        this.trackEvent('experiment_impression', {
            experiment_id: experimentId,
            variant_id: variantId
        });
    }

    // Error tracking
    trackError(error, context = {}) {
        this.trackEvent('error', {
            error_message: error.message,
            error_stack: error.stack,
            error_type: error.constructor.name,
            page_url: window.location.href,
            ...context
        });
    }
}

// Initialize analytics
window.analytics = new Analytics();

// Global error handler
window.addEventListener('error', (e) => {
    window.analytics.trackError(e.error, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    window.analytics.trackError(new Error(e.reason), {
        type: 'unhandled_promise_rejection'
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}