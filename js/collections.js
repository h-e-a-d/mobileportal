/**
 * Collections Module
 * Handles user-created game collections/playlists
 */

class CollectionsManager {
    constructor() {
        this.COLLECTIONS_KEY = 'kloopik_collections';

        // Use config values with fallbacks
        this.MAX_COLLECTIONS = (window.CONFIG && window.CONFIG.MAX_COLLECTIONS) || 20;
        this.MAX_GAMES_PER_COLLECTION = (window.CONFIG && window.CONFIG.MAX_GAMES_PER_COLLECTION) || 100;

        this.collections = [];
    }

    /**
     * Initialize - load collections
     */
    init() {
        this.collections = this._loadCollections();
    }

    /**
     * Load collections from localStorage
     */
    _loadCollections() {
        try {
            const data = localStorage.getItem(this.COLLECTIONS_KEY);
            return data ? JSON.parse(data) : this._createDefaultCollections();
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Collections] Error loading collections:', error);
            }
            return this._createDefaultCollections();
        }
    }

    /**
     * Create default collections
     */
    _createDefaultCollections() {
        return [];
    }

    /**
     * Save collections to localStorage
     */
    _saveCollections() {
        try {
            localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(this.collections));
            return true;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Collections] Error saving collections:', error);
            }
            return false;
        }
    }

    /**
     * Generate unique collection ID
     */
    _generateId() {
        return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create a new collection
     */
    createCollection(name, description = '', isPublic = false) {
        if (!name || name.trim().length === 0) {
            if (window.logger) {
                window.logger.error('[Collections] Collection name is required');
            }
            return null;
        }

        if (this.collections.length >= this.MAX_COLLECTIONS) {
            if (window.logger) {
                window.logger.warn('[Collections] Maximum collections limit reached');
            }
            return null;
        }

        const collection = {
            id: this._generateId(),
            name: name.trim().substring(0, 50),
            description: description.trim().substring(0, 200),
            gameIds: [],
            created: Date.now(),
            updated: Date.now(),
            isPublic: isPublic,
            thumbnail: null
        };

        this.collections.push(collection);
        this._saveCollections();

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('collection_created', {
                collectionId: collection.id
            });
        }

        return collection;
    }

    /**
     * Get all collections
     */
    getAllCollections() {
        return [...this.collections].sort((a, b) => b.updated - a.updated);
    }

    /**
     * Get collection by ID
     */
    getCollection(collectionId) {
        return this.collections.find(c => c.id === collectionId);
    }

    /**
     * Update collection
     */
    updateCollection(collectionId, updates) {
        const collection = this.getCollection(collectionId);
        if (!collection) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection not found');
            }
            return false;
        }

        if (updates.name !== undefined) {
            collection.name = updates.name.trim().substring(0, 50);
        }
        if (updates.description !== undefined) {
            collection.description = updates.description.trim().substring(0, 200);
        }
        if (updates.isPublic !== undefined) {
            collection.isPublic = updates.isPublic;
        }

        collection.updated = Date.now();
        this._saveCollections();

        return true;
    }

    /**
     * Delete collection
     */
    deleteCollection(collectionId) {
        const index = this.collections.findIndex(c => c.id === collectionId);
        if (index === -1) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection not found');
            }
            return false;
        }

        this.collections.splice(index, 1);
        this._saveCollections();

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('collection_deleted', {
                collectionId: collectionId
            });
        }

        return true;
    }

    /**
     * Add game to collection
     */
    addGameToCollection(collectionId, gameId) {
        const collection = this.getCollection(collectionId);
        if (!collection) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection not found');
            }
            return false;
        }

        const validGameId = String(gameId);

        // Check if already in collection
        if (collection.gameIds.includes(validGameId)) {
            if (window.logger) {
                window.logger.debug('[Collections] Game already in collection');
            }
            return false;
        }

        // Check limit
        if (collection.gameIds.length >= this.MAX_GAMES_PER_COLLECTION) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection is full');
            }
            return false;
        }

        collection.gameIds.push(validGameId);
        collection.updated = Date.now();
        this._saveCollections();

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('game_added_to_collection', {
                collectionId: collectionId,
                gameId: validGameId
            });
        }

        return true;
    }

    /**
     * Remove game from collection
     */
    removeGameFromCollection(collectionId, gameId) {
        const collection = this.getCollection(collectionId);
        if (!collection) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection not found');
            }
            return false;
        }

        const validGameId = String(gameId);
        const index = collection.gameIds.indexOf(validGameId);

        if (index === -1) {
            if (window.logger) {
                window.logger.warn('[Collections] Game not in collection');
            }
            return false;
        }

        collection.gameIds.splice(index, 1);
        collection.updated = Date.now();
        this._saveCollections();

        return true;
    }

    /**
     * Check if game is in collection
     */
    isGameInCollection(collectionId, gameId) {
        const collection = this.getCollection(collectionId);
        if (!collection) return false;

        const validGameId = String(gameId);
        return collection.gameIds.includes(validGameId);
    }

    /**
     * Get collections containing a game
     */
    getCollectionsForGame(gameId) {
        const validGameId = String(gameId);
        return this.collections.filter(c => c.gameIds.includes(validGameId));
    }

    /**
     * Get games in collection
     */
    getCollectionGames(collectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection) return [];

        return collection.gameIds;
    }

    /**
     * Get collection count
     */
    getCollectionCount() {
        return this.collections.length;
    }

    /**
     * Get total games across all collections
     */
    getTotalGamesInCollections() {
        return this.collections.reduce((total, c) => total + c.gameIds.length, 0);
    }

    /**
     * Duplicate collection
     */
    duplicateCollection(collectionId) {
        const original = this.getCollection(collectionId);
        if (!original) {
            if (window.logger) {
                window.logger.warn('[Collections] Collection not found');
            }
            return null;
        }

        if (this.collections.length >= this.MAX_COLLECTIONS) {
            if (window.logger) {
                window.logger.warn('[Collections] Maximum collections limit reached');
            }
            return null;
        }

        const duplicate = {
            id: this._generateId(),
            name: `${original.name} (Copy)`,
            description: original.description,
            gameIds: [...original.gameIds],
            created: Date.now(),
            updated: Date.now(),
            isPublic: false,
            thumbnail: original.thumbnail
        };

        this.collections.push(duplicate);
        this._saveCollections();

        return duplicate;
    }

    /**
     * Generate shareable link for collection
     */
    getShareLink(collectionId) {
        const collection = this.getCollection(collectionId);
        if (!collection || !collection.isPublic) {
            return null;
        }

        // Encode collection data in URL
        const data = btoa(JSON.stringify({
            id: collection.id,
            name: collection.name,
            gameIds: collection.gameIds
        }));

        return `${window.location.origin}/#/collection/${data}`;
    }

    /**
     * Import collection from share link
     */
    importFromShareLink(encodedData) {
        try {
            const data = JSON.parse(atob(encodedData));

            if (!data.name || !Array.isArray(data.gameIds)) {
                if (window.logger) {
                    window.logger.warn('[Collections] Invalid collection data');
                }
                return null;
            }

            return this.createCollection(
                `${data.name} (Imported)`,
                'Imported from shared link',
                false
            );
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Collections] Error importing collection:', error);
            }
            return null;
        }
    }

    /**
     * Export all collections
     */
    exportData() {
        return {
            collections: this.collections,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import collections
     */
    importData(data) {
        try {
            if (data.collections && Array.isArray(data.collections)) {
                // Merge with existing collections (avoid duplicates)
                data.collections.forEach(imported => {
                    const exists = this.collections.some(c => c.id === imported.id);
                    if (!exists && this.collections.length < this.MAX_COLLECTIONS) {
                        this.collections.push(imported);
                    }
                });

                this._saveCollections();
                return true;
            }
            return false;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Collections] Error importing data:', error);
            }
            return false;
        }
    }

    /**
     * Clear all collections
     */
    clearAllCollections() {
        this.collections = [];
        localStorage.removeItem(this.COLLECTIONS_KEY);
        return true;
    }

    /**
     * Get collection statistics
     */
    getStats() {
        return {
            totalCollections: this.collections.length,
            totalGames: this.getTotalGamesInCollections(),
            publicCollections: this.collections.filter(c => c.isPublic).length,
            averageGamesPerCollection: this.collections.length > 0
                ? Math.round(this.getTotalGamesInCollections() / this.collections.length)
                : 0
        };
    }
}

// Create global instance
const collectionsManager = new CollectionsManager();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => collectionsManager.init());
} else {
    collectionsManager.init();
}
