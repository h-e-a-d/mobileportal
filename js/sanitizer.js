/**
 * Sanitizer Utility - XSS Prevention
 * Provides methods for escaping HTML, sanitizing URLs, and validating data
 */

class Sanitizer {
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} unsafe - Untrusted user input
     * @returns {string} - Safe HTML-escaped string
     */
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            return unsafe;
        }

        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\//g, "&#x2F;");
    }

    /**
     * Sanitize URLs to prevent javascript:, data:, and vbscript: protocols
     * @param {string} url - URL to sanitize
     * @returns {string} - Safe URL or empty string
     */
    static sanitizeUrl(url) {
        if (!url) return '';

        const trimmed = String(url).trim().toLowerCase();

        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
        for (const protocol of dangerousProtocols) {
            if (trimmed.startsWith(protocol)) {
                console.warn('[Sanitizer] Blocked dangerous URL:', url);
                return '';
            }
        }

        // Only allow http, https, and relative URLs
        if (trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/') ||
            trimmed.startsWith('./') ||
            trimmed.startsWith('../')) {
            return url;
        }

        // If no protocol, assume relative URL
        if (!trimmed.includes(':')) {
            return url;
        }

        console.warn('[Sanitizer] Suspicious URL blocked:', url);
        return '';
    }

    /**
     * Validate and sanitize game ID
     * @param {string|number} gameId - Game ID to validate
     * @returns {string|null} - Valid game ID or null
     */
    static sanitizeGameId(gameId) {
        if (typeof gameId !== 'string' && typeof gameId !== 'number') {
            return null;
        }

        const stringId = String(gameId);

        // Game IDs should be numeric
        if (!/^\d+$/.test(stringId)) {
            console.warn('[Sanitizer] Invalid game ID format:', gameId);
            return null;
        }

        return stringId;
    }

    /**
     * Validate and sanitize slug (alphanumeric with hyphens)
     * @param {string} slug - Slug to validate
     * @returns {string|null} - Valid slug or null
     */
    static sanitizeSlug(slug) {
        if (typeof slug !== 'string') {
            return null;
        }

        // Slugs should only contain lowercase letters, numbers, and hyphens
        if (!/^[a-z0-9-]+$/i.test(slug)) {
            console.warn('[Sanitizer] Invalid slug format:', slug);
            return null;
        }

        // Prevent path traversal
        if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
            console.warn('[Sanitizer] Path traversal attempt blocked:', slug);
            return null;
        }

        return slug;
    }

    /**
     * Sanitize array of strings
     * @param {Array} arr - Array to sanitize
     * @returns {Array} - Array of escaped strings
     */
    static sanitizeArray(arr) {
        if (!Array.isArray(arr)) {
            return [];
        }

        return arr
            .filter(item => typeof item === 'string')
            .map(item => this.escapeHtml(item));
    }

    /**
     * Validate JSON data structure
     * @param {string} jsonString - JSON string to parse
     * @returns {Object|null} - Parsed object or null
     */
    static parseJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            return parsed;
        } catch (error) {
            console.error('[Sanitizer] JSON parse error:', error);
            return null;
        }
    }

    /**
     * Sanitize search query
     * @param {string} query - Search query
     * @param {number} maxLength - Maximum length (default 100)
     * @returns {string} - Sanitized query
     */
    static sanitizeSearchQuery(query) {
        if (typeof query !== 'string') {
            return '';
        }

        const maxLength = 100;

        // Limit length
        let sanitized = query.substring(0, maxLength);

        // Remove HTML tags
        sanitized = sanitized.replace(/<[^>]*>/g, '');

        // Escape for safe display
        sanitized = this.escapeHtml(sanitized);

        return sanitized.trim();
    }

    /**
     * Create safe DOM element with text content
     * @param {string} tagName - HTML tag name
     * @param {string} textContent - Text content (will not be parsed as HTML)
     * @param {Object} attributes - Optional attributes to set
     * @returns {HTMLElement} - Safe DOM element
     */
    static createSafeElement(tagName, textContent, attributes = {}) {
        const element = document.createElement(tagName);

        // Use textContent to prevent HTML parsing
        if (textContent) {
            element.textContent = textContent;
        }

        // Set safe attributes
        for (const [key, value] of Object.entries(attributes)) {
            // Sanitize URL attributes
            if (key === 'src' || key === 'href') {
                const safeUrl = this.sanitizeUrl(value);
                if (safeUrl) {
                    element.setAttribute(key, safeUrl);
                }
            } else {
                element.setAttribute(key, value);
            }
        }

        return element;
    }

    /**
     * Calculate simple checksum for data integrity
     * @param {any} data - Data to checksum
     * @returns {string} - Checksum string
     */
    static calculateChecksum(data) {
        try {
            const str = JSON.stringify(data);
            return btoa(str).substring(0, 16);
        } catch (error) {
            console.error('[Sanitizer] Checksum error:', error);
            return '';
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.Sanitizer = Sanitizer;
}
