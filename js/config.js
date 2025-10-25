/**
 * Kloopik Gaming Portal - Configuration Constants
 * Centralized configuration to replace magic numbers and strings
 */

const CONFIG = {
    // Application settings
    APP_NAME: 'Kloopik',
    VERSION: '1.0.0',

    // Debug mode (set to false in production)
    DEBUG: false,

    // Display settings
    MAX_DISPLAYED_CATEGORIES: 25,
    GAMES_PER_PAGE: 24,
    GAMES_PER_ROW: 6,
    SEARCH_DEBOUNCE_MS: 300,

    // Carousel settings
    CAROUSEL_SCROLL_AMOUNT: 850,
    CAROUSEL_SCROLL_DURATION: 300,

    // Storage settings
    MAX_RECENT_GAMES: 50,
    MAX_FAVORITE_GAMES: 200,
    MAX_COLLECTIONS: 20,
    MAX_GAMES_PER_COLLECTION: 100,
    MAX_NOTE_LENGTH: 500,
    MAX_CUSTOM_TAGS: 50,
    MAX_TAG_LENGTH: 20,
    REVIEW_MAX_LENGTH: 200,
    STORAGE_VERSION: '1.0',

    // LocalStorage keys
    STORAGE_KEYS: {
        FAVORITES: 'kloopik_favorites',
        RECENTLY_PLAYED: 'kloopik_recently_played',
        COOKIE_CONSENT: 'kloopik_cookie_consent',
        THEME: 'kloopik_theme',
        LAST_CATEGORY: 'kloopik_last_category'
    },

    // Analytics events
    ANALYTICS_EVENTS: {
        GAME_PLAY: 'game_play',
        GAME_CLOSE: 'game_close',
        GAME_FAVORITE: 'game_favorite',
        GAME_UNFAVORITE: 'game_unfavorite',
        SEARCH: 'search',
        CATEGORY_VIEW: 'category_view',
        ERROR: 'error',
        PAGE_VIEW: 'page_view'
    },

    // Google Tag Manager
    GTM_ID: 'GTM-PK768FJP',

    // API/Data endpoints
    DATA_ENDPOINTS: {
        GAMES: '/games.json',
        CATEGORY_PREFIX: '/data/',
        CATEGORY_SUFFIX: '-games.json'
    },

    // Game page paths
    PATHS: {
        CATALOG: '/catalog/',
        CATEGORY: '/category/'
    },

    // Validation rules
    VALIDATION: {
        MAX_SLUG_LENGTH: 100,
        SLUG_PATTERN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i,
        MAX_SEARCH_QUERY_LENGTH: 100,
        MIN_SEARCH_QUERY_LENGTH: 1
    },

    // Error messages
    ERRORS: {
        GAMES_LOAD_FAILED: 'Failed to load games. Please refresh the page.',
        GAME_NOT_FOUND: 'Game not found.',
        INVALID_GAME_DATA: 'Invalid game data.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        STORAGE_ERROR: 'Unable to save data. Please check your browser settings.'
    },

    // Success messages
    MESSAGES: {
        GAME_ADDED_TO_FAVORITES: 'Added to favorites!',
        GAME_REMOVED_FROM_FAVORITES: 'Removed from favorites.',
        COPY_SUCCESS: 'Copied to clipboard!',
        SHARE_SUCCESS: 'Share link copied!'
    },

    // Service Worker
    SERVICE_WORKER: {
        VERSION: 'v1.0.0',
        STATIC_CACHE_NAME: 'kloopik-static',
        DATA_CACHE_NAME: 'kloopik-data',
        RUNTIME_CACHE_NAME: 'kloopik-runtime',
        MAX_RUNTIME_CACHE_SIZE: 50
    },

    // Rate limiting (client-side)
    RATE_LIMITS: {
        ANALYTICS_EVENTS_PER_MINUTE: 100,
        SEARCH_REQUESTS_PER_MINUTE: 60,
        GAME_OPENS_PER_MINUTE: 30
    },

    // UI Timeouts
    TIMEOUTS: {
        NOTIFICATION_DISPLAY: 3000,
        LOADING_MINIMUM: 300,
        ERROR_DISPLAY: 5000,
        TOAST_DURATION: 2000
    },

    // Feature flags
    FEATURES: {
        ENABLE_ANALYTICS: true,
        ENABLE_SERVICE_WORKER: true,
        ENABLE_NOTIFICATIONS: true,
        ENABLE_SHARE_API: true,
        ENABLE_FAVORITES_SYNC: false, // Future feature
        ENABLE_USER_ACCOUNTS: false   // Future feature
    },

    // Category slugs mapping (for data chunking)
    CATEGORY_SLUGS: {
        'Action': 'action',
        'Adventure': 'adventure',
        'Arcade': 'arcade',
        'Board': 'board',
        'Boys': 'boys',
        'Clicker': 'clicker',
        'Educational': 'educational',
        'Girls': 'girls',
        'Hypercasual': 'hypercasual',
        'Multiplayer': 'multiplayer',
        'Puzzle': 'puzzle',
        'Racing': 'racing',
        'Shooter': 'shooter',
        'Simulator': 'simulator',
        'Sports': 'sports',
        'Strategy': 'strategy'
    }
};

// Freeze config to prevent modifications
if (typeof Object.freeze === 'function') {
    Object.freeze(CONFIG);
    Object.freeze(CONFIG.STORAGE_KEYS);
    Object.freeze(CONFIG.ANALYTICS_EVENTS);
    Object.freeze(CONFIG.DATA_ENDPOINTS);
    Object.freeze(CONFIG.PATHS);
    Object.freeze(CONFIG.VALIDATION);
    Object.freeze(CONFIG.ERRORS);
    Object.freeze(CONFIG.MESSAGES);
    Object.freeze(CONFIG.SERVICE_WORKER);
    Object.freeze(CONFIG.RATE_LIMITS);
    Object.freeze(CONFIG.TIMEOUTS);
    Object.freeze(CONFIG.FEATURES);
    Object.freeze(CONFIG.CATEGORY_SLUGS);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally (for non-module usage)
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
