/**
 * Storage Module - Handles localStorage for favorites and recently played games
 */

class StorageManager {
    constructor() {
        this.FAVORITES_KEY = 'kloopik_favorites';
        this.RECENT_KEY = 'kloopik_recent';
        this.MAX_RECENT = 20; // Maximum number of recent games to store
    }

    /**
     * Get favorites from localStorage
     */
    getFavorites() {
        try {
            const favorites = localStorage.getItem(this.FAVORITES_KEY);
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('Error getting favorites:', error);
            return [];
        }
    }

    /**
     * Add game to favorites
     */
    addFavorite(gameId) {
        try {
            const favorites = this.getFavorites();

            // Check if already favorited
            if (!favorites.includes(gameId)) {
                favorites.push(gameId);
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding favorite:', error);
            return false;
        }
    }

    /**
     * Remove game from favorites
     */
    removeFavorite(gameId) {
        try {
            const favorites = this.getFavorites();
            const index = favorites.indexOf(gameId);

            if (index > -1) {
                favorites.splice(index, 1);
                localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing favorite:', error);
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
        const favorites = this.getFavorites();
        return favorites.includes(gameId);
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
     * Get recently played games
     */
    getRecentlyPlayed() {
        try {
            const recent = localStorage.getItem(this.RECENT_KEY);
            return recent ? JSON.parse(recent) : [];
        } catch (error) {
            console.error('Error getting recent games:', error);
            return [];
        }
    }

    /**
     * Add game to recently played
     */
    addRecentlyPlayed(gameId) {
        try {
            let recent = this.getRecentlyPlayed();

            // Remove if already exists (to move to front)
            recent = recent.filter(id => id !== gameId);

            // Add to beginning
            recent.unshift(gameId);

            // Limit to MAX_RECENT
            if (recent.length > this.MAX_RECENT) {
                recent = recent.slice(0, this.MAX_RECENT);
            }

            localStorage.setItem(this.RECENT_KEY, JSON.stringify(recent));
            return true;
        } catch (error) {
            console.error('Error adding recent game:', error);
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
