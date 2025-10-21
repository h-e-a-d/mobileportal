/**
 * Storage Module - Handles localStorage for favorites and recently played games
 */

class StorageManager {
    constructor() {
        this.FAVORITES_KEY = 'kloopik_favorites';
        this.RECENT_KEY = 'kloopik_recent';
        this.CHECKSUM_KEY = 'kloopik_checksum';
        this.MAX_RECENT = 20; // Maximum number of recent games to store
    }

    /**
     * Calculate checksum for data integrity
     */
    _calculateChecksum(data) {
        if (typeof window.Sanitizer !== 'undefined') {
            return window.Sanitizer.calculateChecksum(data);
        }
        // Fallback if Sanitizer not loaded
        try {
            return btoa(JSON.stringify(data)).substring(0, 16);
        } catch (error) {
            return '';
        }
    }

    /**
     * Validate game ID format
     */
    _validateGameId(gameId) {
        if (typeof window.Sanitizer !== 'undefined') {
            return window.Sanitizer.sanitizeGameId(gameId);
        }
        // Fallback validation
        const stringId = String(gameId);
        return /^\d+$/.test(stringId) ? stringId : null;
    }

    /**
     * Validate array of game IDs
     */
    _validateGameIds(ids) {
        if (!Array.isArray(ids)) {
            console.warn('[Storage] Invalid data format, expected array');
            return [];
        }

        return ids
            .map(id => this._validateGameId(id))
            .filter(id => id !== null);
    }

    /**
     * Get favorites from localStorage with validation
     */
    getFavorites() {
        try {
            const favoritesStr = localStorage.getItem(this.FAVORITES_KEY);
            const checksumStr = localStorage.getItem(this.CHECKSUM_KEY + '_fav');

            if (!favoritesStr) {
                return [];
            }

            const parsed = JSON.parse(favoritesStr);

            // Verify data integrity with checksum
            if (checksumStr) {
                const expectedChecksum = this._calculateChecksum(parsed);
                if (checksumStr !== expectedChecksum) {
                    console.warn('[Storage] Favorites integrity check failed, clearing data');
                    this.clearFavorites();
                    return [];
                }
            }

            // Validate format and sanitize
            const validated = this._validateGameIds(parsed);

            // If validation removed items, update storage
            if (validated.length !== parsed.length) {
                console.warn('[Storage] Removed invalid favorites');
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(validated));
                localStorage.setItem(this.CHECKSUM_KEY + '_fav', this._calculateChecksum(validated));
            }

            return validated;
        } catch (error) {
            console.error('[Storage] Error getting favorites:', error);
            this.clearFavorites();
            return [];
        }
    }

    /**
     * Add game to favorites with validation
     */
    addFavorite(gameId) {
        try {
            // Validate input
            const validId = this._validateGameId(gameId);
            if (!validId) {
                console.error('[Storage] Invalid game ID:', gameId);
                return false;
            }

            const favorites = this.getFavorites();

            // Check if already favorited
            if (!favorites.includes(validId)) {
                favorites.push(validId);
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
                localStorage.setItem(this.CHECKSUM_KEY + '_fav', this._calculateChecksum(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Storage] Error adding favorite:', error);
            return false;
        }
    }

    /**
     * Remove game from favorites with validation
     */
    removeFavorite(gameId) {
        try {
            const validId = this._validateGameId(gameId);
            if (!validId) {
                console.error('[Storage] Invalid game ID:', gameId);
                return false;
            }

            const favorites = this.getFavorites();
            const index = favorites.indexOf(validId);

            if (index > -1) {
                favorites.splice(index, 1);
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
                localStorage.setItem(this.CHECKSUM_KEY + '_fav', this._calculateChecksum(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('[Storage] Error removing favorite:', error);
            return false;
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite(gameId) {
        if (this.isFavorite(gameId)) {
            return this.removeFavorite(gameId);
        } else {
            return this.addFavorite(gameId);
        }
    }

    /**
     * Check if game is favorited
     */
    isFavorite(gameId) {
        const validId = this._validateGameId(gameId);
        if (!validId) {
            return false;
        }
        const favorites = this.getFavorites();
        return favorites.includes(validId);
    }

    /**
     * Get count of favorites
     */
    getFavoritesCount() {
        return this.getFavorites().length;
    }

    /**
     * Clear all favorites
     */
    clearFavorites() {
        try {
            localStorage.removeItem(this.FAVORITES_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing favorites:', error);
            return false;
        }
    }

    /**
     * Get recently played games with validation
     */
    getRecentlyPlayed() {
        try {
            const recentStr = localStorage.getItem(this.RECENT_KEY);
            const checksumStr = localStorage.getItem(this.CHECKSUM_KEY + '_recent');

            if (!recentStr) {
                return [];
            }

            const parsed = JSON.parse(recentStr);

            // Verify data integrity
            if (checksumStr) {
                const expectedChecksum = this._calculateChecksum(parsed);
                if (checksumStr !== expectedChecksum) {
                    console.warn('[Storage] Recent games integrity check failed, clearing data');
                    this.clearRecentlyPlayed();
                    return [];
                }
            }

            // Validate and sanitize
            const validated = this._validateGameIds(parsed);

            // If validation removed items, update storage
            if (validated.length !== parsed.length) {
                console.warn('[Storage] Removed invalid recent games');
                localStorage.setItem(this.RECENT_KEY, JSON.stringify(validated));
                localStorage.setItem(this.CHECKSUM_KEY + '_recent', this._calculateChecksum(validated));
            }

            return validated;
        } catch (error) {
            console.error('[Storage] Error getting recent games:', error);
            this.clearRecentlyPlayed();
            return [];
        }
    }

    /**
     * Add game to recently played with validation
     */
    addRecentlyPlayed(gameId) {
        try {
            const validId = this._validateGameId(gameId);
            if (!validId) {
                console.error('[Storage] Invalid game ID:', gameId);
                return false;
            }

            let recent = this.getRecentlyPlayed();

            // Remove if already exists (to move to front)
            recent = recent.filter(id => id !== validId);

            // Add to beginning
            recent.unshift(validId);

            // Limit to MAX_RECENT
            if (recent.length > this.MAX_RECENT) {
                recent = recent.slice(0, this.MAX_RECENT);
            }

            localStorage.setItem(this.RECENT_KEY, JSON.stringify(recent));
            localStorage.setItem(this.CHECKSUM_KEY + '_recent', this._calculateChecksum(recent));
            return true;
        } catch (error) {
            console.error('[Storage] Error adding recent game:', error);
            return false;
        }
    }

    /**
     * Get count of recently played games
     */
    getRecentlyPlayedCount() {
        return this.getRecentlyPlayed().length;
    }

    /**
     * Clear recently played
     */
    clearRecentlyPlayed() {
        try {
            localStorage.removeItem(this.RECENT_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing recent games:', error);
            return false;
        }
    }

    /**
     * Export user data (for backup)
     */
    exportUserData() {
        return {
            favorites: this.getFavorites(),
            recentlyPlayed: this.getRecentlyPlayed(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import user data (for restore)
     */
    importUserData(data) {
        try {
            if (data.favorites) {
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites));
            }
            if (data.recentlyPlayed) {
                localStorage.setItem(this.RECENT_KEY, JSON.stringify(data.recentlyPlayed));
            }
            return true;
        } catch (error) {
            console.error('Error importing user data:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     */
    isStorageAvailable() {
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
     * Get storage statistics
     */
    getStats() {
        return {
            favoritesCount: this.getFavoritesCount(),
            recentCount: this.getRecentlyPlayedCount(),
            storageAvailable: this.isStorageAvailable()
        };
    }
}

// Create global instance
const storageManager = new StorageManager();
