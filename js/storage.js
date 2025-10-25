/**
 * Storage Module - Handles localStorage for favorites and recently played games
 */

class StorageManager {
    constructor() {
        this.FAVORITES_KEY = 'kloopik_favorites';
        this.RECENT_KEY = 'kloopik_recent';
        this.CHECKSUM_KEY = 'kloopik_checksum';
        this.NOTES_KEY = 'kloopik_game_notes';
        this.TAGS_KEY = 'kloopik_user_tags';
        this.HISTORY_KEY = 'kloopik_play_history';

        // Use config values with fallbacks
        this.MAX_RECENT = (window.CONFIG && window.CONFIG.MAX_RECENT_GAMES) || 50;
        this.MAX_FAVORITES = (window.CONFIG && window.CONFIG.MAX_FAVORITE_GAMES) || 200;
        this.MAX_HISTORY = 200;
        this.MAX_NOTE_LENGTH = (window.CONFIG && window.CONFIG.MAX_NOTE_LENGTH) || 500;
        this.MAX_TAG_LENGTH = (window.CONFIG && window.CONFIG.MAX_TAG_LENGTH) || 20;
        this.MAX_CUSTOM_TAGS = (window.CONFIG && window.CONFIG.MAX_CUSTOM_TAGS) || 50;

        this.notes = {};
        this.userTags = {};
        this.playHistory = [];
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
     * Load notes from localStorage
     */
    _loadNotes() {
        try {
            const data = localStorage.getItem(this.NOTES_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[Storage] Error loading notes:', error);
            return {};
        }
    }

    /**
     * Load user tags from localStorage
     */
    _loadUserTags() {
        try {
            const data = localStorage.getItem(this.TAGS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[Storage] Error loading tags:', error);
            return {};
        }
    }

    /**
     * Load play history from localStorage
     */
    _loadPlayHistory() {
        try {
            const data = localStorage.getItem(this.HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[Storage] Error loading history:', error);
            return [];
        }
    }

    /**
     * Initialize enhanced features
     */
    initEnhanced() {
        this.notes = this._loadNotes();
        this.userTags = this._loadUserTags();
        this.playHistory = this._loadPlayHistory();
    }

    /**
     * Add note to game
     */
    addNote(gameId, noteText) {
        const validId = this._validateGameId(gameId);
        if (!validId || !noteText) return false;

        // Sanitize note text if TextUtils is available
        let sanitized = noteText;
        if (window.TextUtils && window.TextUtils.sanitizeText) {
            sanitized = window.TextUtils.sanitizeText(noteText);
        } else {
            // Fallback: basic sanitization
            sanitized = String(noteText)
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
        }

        // Validate length
        if (sanitized.length === 0 || sanitized.length > this.MAX_NOTE_LENGTH) {
            if (window.logger) {
                window.logger.warn('[Storage] Invalid note length');
            }
            return false;
        }

        this.notes[validId] = {
            text: sanitized.substring(0, this.MAX_NOTE_LENGTH),
            updated: Date.now()
        };

        try {
            localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Storage] Error saving note:', error);
            }
            return false;
        }
    }

    /**
     * Get note for game
     */
    getNote(gameId) {
        const validId = this._validateGameId(gameId);
        return this.notes[validId]?.text || '';
    }

    /**
     * Delete note for game
     */
    deleteNote(gameId) {
        const validId = this._validateGameId(gameId);
        if (!validId) return false;

        delete this.notes[validId];

        try {
            localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('[Storage] Error deleting note:', error);
            return false;
        }
    }

    /**
     * Add custom tag to game
     */
    addUserTag(gameId, tag) {
        const validId = this._validateGameId(gameId);
        if (!validId || !tag) return false;

        // Sanitize tag if TextUtils is available
        let sanitized = tag;
        if (window.TextUtils && window.TextUtils.sanitizeText) {
            sanitized = window.TextUtils.sanitizeText(tag);
        } else {
            // Fallback: basic sanitization
            sanitized = String(tag)
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]+>/g, '')
                .trim();
        }

        // Validate tag format and length
        const cleanTag = sanitized.trim().toLowerCase();

        if (cleanTag.length === 0 || cleanTag.length > this.MAX_TAG_LENGTH) {
            if (window.logger) {
                window.logger.warn('[Storage] Invalid tag length');
            }
            return false;
        }

        // Only allow alphanumeric and basic characters
        if (!/^[a-z0-9\s\-_]+$/i.test(cleanTag)) {
            if (window.logger) {
                window.logger.warn('[Storage] Tag contains invalid characters');
            }
            return false;
        }

        if (!this.userTags[validId]) {
            this.userTags[validId] = [];
        }

        // Check max tags limit
        if (this.userTags[validId].length >= this.MAX_CUSTOM_TAGS) {
            if (window.logger) {
                window.logger.warn('[Storage] Maximum tags limit reached');
            }
            return false;
        }

        const finalTag = cleanTag.substring(0, this.MAX_TAG_LENGTH);

        if (!this.userTags[validId].includes(finalTag)) {
            this.userTags[validId].push(finalTag);

            try {
                localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.userTags));
                return true;
            } catch (error) {
                if (window.logger) {
                    window.logger.error('[Storage] Error saving tag:', error);
                }
                return false;
            }
        }

        return false;
    }

    /**
     * Get user tags for game
     */
    getUserTags(gameId) {
        const validId = this._validateGameId(gameId);
        return this.userTags[validId] || [];
    }

    /**
     * Remove user tag from game
     */
    removeUserTag(gameId, tag) {
        const validId = this._validateGameId(gameId);
        if (!validId || !tag) return false;

        const tags = this.userTags[validId];
        if (!tags) return false;

        const index = tags.indexOf(tag.toLowerCase());
        if (index > -1) {
            tags.splice(index, 1);

            if (tags.length === 0) {
                delete this.userTags[validId];
            }

            try {
                localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.userTags));
                return true;
            } catch (error) {
                console.error('[Storage] Error removing tag:', error);
                return false;
            }
        }

        return false;
    }

    /**
     * Add to play history with timestamp
     */
    addToHistory(gameId, gameTitle = '') {
        const validId = this._validateGameId(gameId);
        if (!validId) return false;

        const entry = {
            gameId: validId,
            gameTitle: gameTitle,
            timestamp: Date.now()
        };

        // Remove duplicates
        this.playHistory = this.playHistory.filter(h => h.gameId !== validId);

        // Add to beginning
        this.playHistory.unshift(entry);

        // Limit size
        if (this.playHistory.length > this.MAX_HISTORY) {
            this.playHistory = this.playHistory.slice(0, this.MAX_HISTORY);
        }

        try {
            localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.playHistory));
            return true;
        } catch (error) {
            console.error('[Storage] Error saving history:', error);
            return false;
        }
    }

    /**
     * Get play history
     */
    getPlayHistory(limit = 50) {
        return this.playHistory.slice(0, limit);
    }

    /**
     * Clear play history
     */
    clearHistory() {
        this.playHistory = [];
        localStorage.removeItem(this.HISTORY_KEY);
        return true;
    }

    /**
     * Export all user data (enhanced)
     */
    exportAllData() {
        return {
            favorites: this.getFavorites(),
            recentlyPlayed: this.getRecentlyPlayed(),
            notes: this.notes,
            userTags: this.userTags,
            playHistory: this.playHistory,
            ratings: window.ratingsManager ? window.ratingsManager.exportData() : null,
            collections: window.collectionsManager ? window.collectionsManager.exportData() : null,
            sessions: window.gameSessionManager ? window.gameSessionManager.exportData() : null,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    }

    /**
     * Import all user data (enhanced)
     */
    importAllData(data) {
        try {
            if (data.favorites) {
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(data.favorites));
            }
            if (data.recentlyPlayed) {
                localStorage.setItem(this.RECENT_KEY, JSON.stringify(data.recentlyPlayed));
            }
            if (data.notes) {
                this.notes = data.notes;
                localStorage.setItem(this.NOTES_KEY, JSON.stringify(this.notes));
            }
            if (data.userTags) {
                this.userTags = data.userTags;
                localStorage.setItem(this.TAGS_KEY, JSON.stringify(this.userTags));
            }
            if (data.playHistory) {
                this.playHistory = data.playHistory;
                localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.playHistory));
            }

            // Import related data
            if (data.ratings && window.ratingsManager) {
                window.ratingsManager.importData(data.ratings);
            }
            if (data.collections && window.collectionsManager) {
                window.collectionsManager.importData(data.collections);
            }
            if (data.sessions && window.gameSessionManager) {
                window.gameSessionManager.importData(data.sessions);
            }

            return true;
        } catch (error) {
            console.error('[Storage] Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all user data
     */
    clearAllData() {
        this.clearFavorites();
        this.clearRecentlyPlayed();
        this.clearHistory();
        this.notes = {};
        this.userTags = {};
        localStorage.removeItem(this.NOTES_KEY);
        localStorage.removeItem(this.TAGS_KEY);

        // Clear related data
        if (window.ratingsManager) {
            window.ratingsManager.clearAllData();
        }
        if (window.collectionsManager) {
            window.collectionsManager.clearAllCollections();
        }
        if (window.gameSessionManager) {
            window.gameSessionManager.clearAllData();
        }

        return true;
    }

    /**
     * Get storage statistics (enhanced)
     */
    getStats() {
        return {
            favoritesCount: this.getFavoritesCount(),
            recentCount: this.getRecentlyPlayedCount(),
            notesCount: Object.keys(this.notes).length,
            taggedGamesCount: Object.keys(this.userTags).length,
            historyCount: this.playHistory.length,
            storageAvailable: this.isStorageAvailable(),
            totalItems: this.getFavoritesCount() + this.getRecentlyPlayedCount() + Object.keys(this.notes).length
        };
    }
}

// Initialize enhanced features on load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.storageManager) {
                window.storageManager.initEnhanced();
            }
        });
    } else {
        if (window.storageManager) {
            window.storageManager.initEnhanced();
        }
    }
}

// Create global instance
const storageManager = new StorageManager();
