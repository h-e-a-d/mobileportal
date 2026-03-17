/**
 * Kloopik Gaming Portal - Logger Utility
 * Centralized logging with debug mode control
 * Replaces direct console.log usage throughout the application
 */

class Logger {
    constructor(config = {}) {
        this.DEBUG = config.DEBUG !== undefined ? config.DEBUG : false;
        this.PREFIX = config.PREFIX || '[Kloopik]';
        this.COLORS = {
            log: '#3498db',      // Blue
            info: '#2ecc71',     // Green
            warn: '#f39c12',     // Orange
            error: '#e74c3c',    // Red
            debug: '#9b59b6'     // Purple
        };
    }

    /**
     * Format log message with prefix and timestamp
     */
    _formatMessage(level, ...args) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        return [`%c${this.PREFIX}%c [${timestamp}] [${level.toUpperCase()}]`,
                `color: ${this.COLORS[level]}; font-weight: bold`,
                'color: inherit',
                ...args];
    }

    /**
     * Standard log - only in debug mode
     */
    log(...args) {
        if (this.DEBUG) {
            console.log(...this._formatMessage('log', ...args));
        }
    }

    /**
     * Info log - only in debug mode
     */
    info(...args) {
        if (this.DEBUG) {
            console.info(...this._formatMessage('info', ...args));
        }
    }

    /**
     * Warning log - only in debug mode
     */
    warn(...args) {
        if (this.DEBUG) {
            console.warn(...this._formatMessage('warn', ...args));
        }
    }

    /**
     * Error log - always show (even in production)
     */
    error(...args) {
        console.error(...this._formatMessage('error', ...args));

        // Track errors in analytics if available
        if (typeof window !== 'undefined' && window.Analytics) {
            const errorMessage = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');

            window.Analytics.trackError('client_error', errorMessage, {
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Debug log - only in debug mode
     */
    debug(...args) {
        if (this.DEBUG) {
            console.debug(...this._formatMessage('debug', ...args));
        }
    }

    /**
     * Group logs together (collapsible in console)
     */
    group(label) {
        if (this.DEBUG && console.group) {
            console.group(`${this.PREFIX} ${label}`);
        }
    }

    groupCollapsed(label) {
        if (this.DEBUG && console.groupCollapsed) {
            console.groupCollapsed(`${this.PREFIX} ${label}`);
        }
    }

    groupEnd() {
        if (this.DEBUG && console.groupEnd) {
            console.groupEnd();
        }
    }

    /**
     * Table log - useful for arrays/objects
     */
    table(data) {
        if (this.DEBUG && console.table) {
            console.table(data);
        }
    }

    /**
     * Time tracking
     */
    time(label) {
        if (this.DEBUG && console.time) {
            console.time(`${this.PREFIX} ${label}`);
        }
    }

    timeEnd(label) {
        if (this.DEBUG && console.timeEnd) {
            console.timeEnd(`${this.PREFIX} ${label}`);
        }
    }

    /**
     * Performance measurement
     */
    measure(label, startMark, endMark) {
        if (this.DEBUG && window.performance && window.performance.measure) {
            try {
                window.performance.measure(label, startMark, endMark);
                const measure = window.performance.getEntriesByName(label)[0];
                this.debug(`Performance: ${label} took ${measure.duration.toFixed(2)}ms`);
            } catch (e) {
                this.warn('Performance measurement failed:', e.message);
            }
        }
    }

    /**
     * Assert - log error if condition is false
     */
    assert(condition, ...args) {
        if (!condition) {
            this.error('Assertion failed:', ...args);
        }
    }

    /**
     * Create a scoped logger for specific modules
     */
    scope(moduleName) {
        return new Logger({
            DEBUG: this.DEBUG,
            PREFIX: `${this.PREFIX}:${moduleName}`
        });
    }

    /**
     * Enable debug mode at runtime
     */
    enableDebug() {
        this.DEBUG = true;
        this.info('Debug mode enabled');
    }

    /**
     * Disable debug mode at runtime
     */
    disableDebug() {
        this.info('Debug mode disabled');
        this.DEBUG = false;
    }
}

// Create default logger instance
let logger;

if (typeof window !== 'undefined' && window.CONFIG) {
    logger = new Logger({ DEBUG: window.CONFIG.DEBUG });
} else {
    // Fallback if CONFIG not loaded yet
    logger = new Logger({ DEBUG: false });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.logger = logger;

    // Add helper to enable debug from browser console
    window.enableDebug = () => logger.enableDebug();
    window.disableDebug = () => logger.disableDebug();
}
