/**
 * Kloopik Gaming Portal - Shared Utilities
 * Common utility functions used across the application
 */

/**
 * LocalStorage Helper
 * Provides safe localStorage operations with error handling
 */
class LocalStorageHelper {
    /**
     * Safely get item from localStorage with JSON parsing
     * @param {string} key - The localStorage key
     * @param {*} defaultValue - Default value if key doesn't exist or parsing fails
     * @returns {*} Parsed value or default value
     */
    static safeGet(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);

            if (data === null) {
                return defaultValue;
            }

            return JSON.parse(data);
        } catch (error) {
            if (window.logger) {
                window.logger.error(`[LocalStorage] Error loading key "${key}":`, error.message);
            }
            return defaultValue;
        }
    }

    /**
     * Safely set item in localStorage with JSON stringification
     * @param {string} key - The localStorage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} True if successful, false otherwise
     */
    static safeSet(key, value) {
        try {
            const stringified = JSON.stringify(value);
            localStorage.setItem(key, stringified);
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error(`[LocalStorage] Error saving key "${key}":`, error.message);
            }

            // Check if quota exceeded
            if (error.name === 'QuotaExceededError') {
                if (window.logger) {
                    window.logger.warn('[LocalStorage] Storage quota exceeded');
                }
            }

            return false;
        }
    }

    /**
     * Safely remove item from localStorage
     * @param {string} key - The localStorage key
     * @returns {boolean} True if successful, false otherwise
     */
    static safeRemove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error(`[LocalStorage] Error removing key "${key}":`, error.message);
            }
            return false;
        }
    }

    /**
     * Safely clear all localStorage
     * @returns {boolean} True if successful, false otherwise
     */
    static safeClear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[LocalStorage] Error clearing storage:', error.message);
            }
            return false;
        }
    }

    /**
     * Check if localStorage is available
     * @returns {boolean} True if localStorage is available
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the size of a specific key in bytes
     * @param {string} key - The localStorage key
     * @returns {number} Size in bytes
     */
    static getKeySize(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return 0;

            // Calculate size in bytes (UTF-16)
            return new Blob([data]).size;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Get total localStorage usage in bytes
     * @returns {number} Total size in bytes
     */
    static getTotalSize() {
        let total = 0;

        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += this.getKeySize(key);
                }
            }
        } catch (error) {
            if (window.logger) {
                window.logger.error('[LocalStorage] Error calculating total size:', error.message);
            }
        }

        return total;
    }
}

/**
 * ID Generator
 * Provides unique ID generation for various entities
 */
class IDGenerator {
    /**
     * Generate a unique ID with a prefix
     * @param {string} prefix - Prefix for the ID (e.g., 'rev', 'col', 'sess')
     * @param {number} randomLength - Length of random string (default: 9)
     * @returns {string} Unique ID
     */
    static generate(prefix = '', randomLength = 9) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 2 + randomLength);

        return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
    }

    /**
     * Generate a review ID
     * @returns {string} Review ID
     */
    static generateReviewId() {
        return this.generate('rev', 9);
    }

    /**
     * Generate a collection ID
     * @returns {string} Collection ID
     */
    static generateCollectionId() {
        return this.generate('col', 9);
    }

    /**
     * Generate a session ID
     * @returns {string} Session ID
     */
    static generateSessionId() {
        return this.generate('sess', 9);
    }

    /**
     * Generate a UUID v4 (more robust but longer)
     * @returns {string} UUID v4
     */
    static generateUUID() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        // Fallback implementation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate a short ID (for URLs, shareable links)
     * @param {number} length - Length of the ID (default: 8)
     * @returns {string} Short ID
     */
    static generateShortId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }
}

/**
 * Text Utilities
 * Common text manipulation and validation functions
 */
class TextUtils {
    /**
     * Sanitize text input (remove HTML, scripts)
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeText(text) {
        if (!text) return '';

        return String(text)
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .trim();
    }

    /**
     * Truncate text to a maximum length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated text
     */
    static truncate(text, maxLength, suffix = '...') {
        if (!text || text.length <= maxLength) return text;

        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    /**
     * Validate text length
     * @param {string} text - Text to validate
     * @param {number} minLength - Minimum length
     * @param {number} maxLength - Maximum length
     * @returns {boolean} True if valid
     */
    static validateLength(text, minLength = 0, maxLength = Infinity) {
        if (!text) return minLength === 0;

        const length = String(text).trim().length;
        return length >= minLength && length <= maxLength;
    }

    /**
     * Count words in text
     * @param {string} text - Text to count words in
     * @returns {number} Word count
     */
    static wordCount(text) {
        if (!text) return 0;

        return String(text)
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0)
            .length;
    }
}

/**
 * Debounce Utility
 * Creates a debounced version of a function
 */
class DebounceUtils {
    /**
     * Create a debounced function
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, delay = 300) {
        let timeoutId;

        return function debounced(...args) {
            clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    /**
     * Create a throttled function
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, delay = 300) {
        let lastCall = 0;

        return function throttled(...args) {
            const now = Date.now();

            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }
}

// Export utilities
if (typeof window !== 'undefined') {
    window.LocalStorageHelper = LocalStorageHelper;
    window.IDGenerator = IDGenerator;
    window.TextUtils = TextUtils;
    window.DebounceUtils = DebounceUtils;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LocalStorageHelper,
        IDGenerator,
        TextUtils,
        DebounceUtils
    };
}
