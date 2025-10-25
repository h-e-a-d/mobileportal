/**
 * Games Module - Handles game data loading, filtering, and management
 */

class GamesManager {
    constructor() {
        this.allGames = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.gamesPerPage = 48;
        this.currentPage = 1;
        this.categories = new Set(['all']);

        // New: Category chunk caching
        this.categoryCache = new Map();
        this.categoriesIndex = null;
        this.useChunkedData = true; // Try chunked data first, fallback to games.json
        this.featuredGames = [];

        // Enhanced filtering and sorting
        this.currentSort = 'default'; // default, name-asc, name-desc, rating, recent, popular
        this.activeFilters = {
            mobileReady: false,
            categories: [],
            minRating: 0
        };
    }

    /**
     * Load categories index
     */
    async loadCategoriesIndex() {
        try {
            const response = await fetch('/data/categories-index.json');
            if (!response.ok) {
                throw new Error('Categories index not found');
            }

            this.categoriesIndex = await response.json();

            // Extract category names
            this.categories = new Set(['all']);
            this.categoriesIndex.categories.forEach(cat => {
                this.categories.add(cat.slug);
            });

            if (window.logger) {
                window.logger.info('[Games] Loaded categories index:', this.categoriesIndex.totalCategories, 'categories');
            }

            return this.categoriesIndex;
        } catch (error) {
            if (window.logger) {
                window.logger.warn('[Games] Categories index not found, will use fallback');
            }
            return null;
        }
    }

    /**
     * Load category games from chunk
     */
    async loadCategoryChunk(category) {
        // Check cache first
        if (this.categoryCache.has(category)) {
            if (window.logger) {
                window.logger.debug('[Games] Using cached category:', category);
            }
            return this.categoryCache.get(category);
        }

        try {
            const filename = category === 'featured'
                ? '/data/featured-games.json'
                : `/data/${category}-games.json`;

            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`Category chunk not found: ${category}`);
            }

            const data = await response.json();
            const games = data.games || [];

            // Cache the category
            this.categoryCache.set(category, games);

            if (window.logger) {
                window.logger.info('[Games] Loaded category chunk:', category, '-', games.length, 'games');
            }

            return games;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Games] Error loading category chunk:', category, error);
            }

            // Track error in analytics
            if (window.Analytics) {
                window.Analytics.trackError('category_load_error', error.message, {
                    category: category
                });
            }

            return [];
        }
    }

    /**
     * Load games - tries chunked data first, falls back to games.json
     */
    async loadGames() {
        try {
            // Try to load categories index
            const index = await this.loadCategoriesIndex();

            if (index) {
                // Chunked data available - load featured games for initial display
                this.useChunkedData = true;
                this.featuredGames = await this.loadCategoryChunk('featured');
                this.allGames = [...this.featuredGames];
                this.filteredGames = [...this.allGames];

                if (window.logger) {
                    window.logger.info('[Games] Using chunked data mode');
                }

                return this.allGames;
            } else {
                // Fallback to original games.json
                return await this.loadGamesFromMonolith();
            }
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Games] Error in loadGames, trying fallback:', error);
            }

            // Fallback to original method
            return await this.loadGamesFromMonolith();
        }
    }

    /**
     * Fallback: Load all games from original games.json (compatibility mode)
     */
    async loadGamesFromMonolith() {
        try {
            if (window.logger) {
                window.logger.info('[Games] Loading from games.json (fallback mode)');
            }

            this.useChunkedData = false;

            const response = await fetch('games.json');
            if (!response.ok) {
                throw new Error('Failed to load games');
            }

            const data = await response.json();

            // Extract games from the nested structure
            if (data.segments && data.segments.length > 0) {
                this.allGames = data.segments.flatMap(segment => segment.hits || []);
            } else {
                this.allGames = [];
            }

            // Extract unique categories from genres
            this.extractCategories();

            // Initial filter
            this.filteredGames = [...this.allGames];

            return this.allGames;
        } catch (error) {
            if (window.logger) {
                window.logger.error('[Games] Error loading games.json:', error);
            }

            // Track error in analytics
            if (window.Analytics) {
                window.Analytics.trackError('games_load_error', error.message, {
                    source: 'games.json'
                });
            }

            throw error;
        }
    }

    /**
     * Extract unique categories from all games
     */
    extractCategories() {
        this.categories = new Set(['all']);

        this.allGames.forEach(game => {
            if (game.genres && Array.isArray(game.genres)) {
                game.genres.forEach(genre => {
                    this.categories.add(genre.toLowerCase().trim());
                });
            }
        });
    }

    /**
     * Get all categories
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Filter games by category (with on-demand chunk loading)
     */
    async filterByCategory(category) {
        this.currentCategory = category.toLowerCase();
        this.currentPage = 1;

        // If using chunked data, load the category chunk
        if (this.useChunkedData && this.currentCategory !== 'all') {
            try {
                const categoryGames = await this.loadCategoryChunk(this.currentCategory);

                // For category view, use only that category's games
                this.filteredGames = categoryGames;

                if (window.logger) {
                    window.logger.info('[Games] Filtered to category:', this.currentCategory, '-', categoryGames.length, 'games');
                }

                return this.getPaginatedGames();
            } catch (error) {
                if (window.logger) {
                    window.logger.error('[Games] Error loading category, using fallback filter:', error);
                }

                // Fallback to filtering allGames
                this.applyFilters();
                return this.getPaginatedGames();
            }
        } else {
            // Use traditional filtering (for 'all' category or fallback mode)
            this.applyFilters();
            return this.getPaginatedGames();
        }
    }

    /**
     * Search games by query
     */
    searchGames(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.currentPage = 1;
        this.applyFilters();
        return this.getPaginatedGames();
    }

    /**
     * Apply all active filters
     */
    applyFilters() {
        let results = [...this.allGames];

        // Filter by category
        if (this.currentCategory !== 'all') {
            results = results.filter(game => {
                if (!game.genres) return false;
                return game.genres.some(genre =>
                    genre.toLowerCase() === this.currentCategory
                );
            });
        }

        // Filter by search query
        if (this.searchQuery) {
            results = results.filter(game => {
                const searchFields = [
                    game.title || '',
                    game.description || '',
                    ...(game.genres || []),
                    ...(game.tags || [])
                ].map(field => String(field).toLowerCase());

                return searchFields.some(field =>
                    field.includes(this.searchQuery)
                );
            });
        }

        this.filteredGames = results;
    }

    /**
     * Get paginated games
     */
    getPaginatedGames() {
        const start = 0;
        const end = this.currentPage * this.gamesPerPage;
        return this.filteredGames.slice(start, end);
    }

    /**
     * Load more games (pagination)
     */
    loadMore() {
        this.currentPage++;
        return this.getPaginatedGames();
    }

    /**
     * Check if there are more games to load
     */
    hasMore() {
        return (this.currentPage * this.gamesPerPage) < this.filteredGames.length;
    }

    /**
     * Get total count of filtered games
     */
    getTotalCount() {
        return this.filteredGames.length;
    }

    /**
     * Get game by slug
     */
    getGameBySlug(slug) {
        return this.allGames.find(game => game.slug === slug);
    }

    /**
     * Get game by ID
     */
    getGameById(id) {
        // Convert to string for comparison since storage returns string IDs
        const idStr = String(id);
        return this.allGames.find(game => String(game.id) === idStr);
    }

    /**
     * Get games by IDs (for favorites and recent)
     */
    getGamesByIds(ids) {
        return ids
            .map(id => this.getGameById(id))
            .filter(game => game !== undefined);
    }

    /**
     * Get random games using Fisher-Yates shuffle algorithm
     * More efficient and unbiased than sort-based randomization
     */
    getRandomGames(count = 10) {
        const games = [...this.allGames];
        const result = [];
        const actualCount = Math.min(count, games.length);

        // Fisher-Yates shuffle - only shuffle what we need
        for (let i = 0; i < actualCount; i++) {
            const randomIndex = Math.floor(Math.random() * (games.length - i)) + i;

            // Swap current element with random element
            if (randomIndex !== i) {
                [games[i], games[randomIndex]] = [games[randomIndex], games[i]];
            }

            result.push(games[i]);
        }

        return result;
    }

    /**
     * Get games by genre/category
     */
    getGamesByGenre(genre, limit = 20) {
        const filtered = this.allGames.filter(game => {
            if (!game.genres) return false;
            return game.genres.some(g =>
                g.toLowerCase() === genre.toLowerCase()
            );
        });
        return filtered.slice(0, limit);
    }

    /**
     * Format game data for display
     */
    formatGameForDisplay(game) {
        return {
            id: game.id,
            slug: game.slug,
            title: game.title,
            description: game.description,
            thumbnail: this.getGameThumbnail(game),
            gameURL: game.gameURL,
            genres: game.genres || [],
            tags: game.tags || [],
            mobileReady: game.mobileReady || [],
            playgamaUrl: game.playgamaGameUrl
        };
    }

    /**
     * Get game thumbnail (first image or fallback)
     */
    getGameThumbnail(game) {
        if (game.images && game.images.length > 0) {
            return game.images[0];
        }

        // Fallback to a placeholder image (can be customized)
        return this.generatePlaceholderImage(game.title);
    }

    /**
     * Generate placeholder image data URL
     */
    generatePlaceholderImage(title) {
        // Simple SVG placeholder with game title initial
        const initial = title ? title[0].toUpperCase() : 'G';
        const colors = ['#ff6b35', '#4a90e2', '#9b59b6', '#e74c3c', '#2ecc71'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const svg = `
            <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="400" height="300" fill="${color}"/>
                <text x="50%" y="50%" font-family="Arial" font-size="120"
                      fill="white" text-anchor="middle" dy=".3em">${initial}</text>
            </svg>
        `;

        return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.filteredGames = [...this.allGames];
        return this.getPaginatedGames();
    }

    /**
     * Get current filter state
     */
    getFilterState() {
        return {
            category: this.currentCategory,
            search: this.searchQuery,
            page: this.currentPage,
            totalGames: this.filteredGames.length,
            displayedGames: this.currentPage * this.gamesPerPage,
            sort: this.currentSort,
            filters: this.activeFilters
        };
    }

    /**
     * Set sort order
     */
    setSortOrder(sortType) {
        this.currentSort = sortType;
        this.currentPage = 1;
        this.applySorting();
        return this.getPaginatedGames();
    }

    /**
     * Apply sorting to filtered games
     */
    applySorting() {
        switch (this.currentSort) {
            case 'name-asc':
                this.filteredGames.sort((a, b) =>
                    (a.title || '').localeCompare(b.title || '')
                );
                break;

            case 'name-desc':
                this.filteredGames.sort((a, b) =>
                    (b.title || '').localeCompare(a.title || '')
                );
                break;

            case 'rating':
                this.filteredGames.sort((a, b) => {
                    if (!window.ratingsManager) return 0;
                    const ratingA = parseFloat(window.ratingsManager.getAverageRating(a.id)) || 0;
                    const ratingB = parseFloat(window.ratingsManager.getAverageRating(b.id)) || 0;
                    return ratingB - ratingA;
                });
                break;

            case 'most-played':
                this.filteredGames.sort((a, b) => {
                    if (!window.gameSessionManager) return 0;
                    const playsA = window.gameSessionManager.getGameStats(a.id).totalPlays || 0;
                    const playsB = window.gameSessionManager.getGameStats(b.id).totalPlays || 0;
                    return playsB - playsA;
                });
                break;

            case 'recent':
                // Sort by when game was last played
                this.filteredGames.sort((a, b) => {
                    if (!window.gameSessionManager) return 0;
                    const lastA = window.gameSessionManager.getGameStats(a.id).lastPlayed || 0;
                    const lastB = window.gameSessionManager.getGameStats(b.id).lastPlayed || 0;
                    return lastB - lastA;
                });
                break;

            case 'random':
                // Fisher-Yates shuffle
                for (let i = this.filteredGames.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.filteredGames[i], this.filteredGames[j]] = [this.filteredGames[j], this.filteredGames[i]];
                }
                break;

            case 'default':
            default:
                // Keep original order
                break;
        }
    }

    /**
     * Set advanced filter
     */
    setFilter(filterName, value) {
        this.activeFilters[filterName] = value;
        this.currentPage = 1;
        this.applyFilters();
        return this.getPaginatedGames();
    }

    /**
     * Set multiple categories filter
     */
    setMultipleCategoriesFilter(categories, matchAny = true) {
        this.activeFilters.categories = categories;
        this.activeFilters.categoryMatchAny = matchAny;
        this.currentPage = 1;
        this.applyFilters();
        return this.getPaginatedGames();
    }

    /**
     * Apply all active filters (enhanced)
     */
    applyFiltersEnhanced() {
        let results = [...this.allGames];

        // Filter by category (single)
        if (this.currentCategory !== 'all') {
            results = results.filter(game => {
                if (!game.genres) return false;
                return game.genres.some(genre =>
                    genre.toLowerCase() === this.currentCategory
                );
            });
        }

        // Filter by multiple categories
        if (this.activeFilters.categories && this.activeFilters.categories.length > 0) {
            results = results.filter(game => {
                if (!game.genres) return false;

                if (this.activeFilters.categoryMatchAny) {
                    // Match ANY of the selected categories
                    return game.genres.some(genre =>
                        this.activeFilters.categories.includes(genre.toLowerCase())
                    );
                } else {
                    // Match ALL of the selected categories
                    return this.activeFilters.categories.every(cat =>
                        game.genres.some(genre => genre.toLowerCase() === cat.toLowerCase())
                    );
                }
            });
        }

        // Filter by mobile ready
        if (this.activeFilters.mobileReady) {
            results = results.filter(game => {
                return game.mobileReady && game.mobileReady.length > 0;
            });
        }

        // Filter by minimum rating
        if (this.activeFilters.minRating > 0 && window.ratingsManager) {
            results = results.filter(game => {
                const avgRating = parseFloat(window.ratingsManager.getAverageRating(game.id)) || 0;
                return avgRating >= this.activeFilters.minRating;
            });
        }

        // Filter by search query
        if (this.searchQuery) {
            results = results.filter(game => {
                const searchFields = [
                    game.title || '',
                    game.description || '',
                    ...(game.genres || []),
                    ...(game.tags || [])
                ].map(field => String(field).toLowerCase());

                return searchFields.some(field =>
                    field.includes(this.searchQuery)
                );
            });
        }

        this.filteredGames = results;
        this.applySorting();
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentPage = 1;
        this.currentSort = 'default';
        this.activeFilters = {
            mobileReady: false,
            categories: [],
            minRating: 0
        };
        this.filteredGames = [...this.allGames];
        return this.getPaginatedGames();
    }

    /**
     * Get available sort options
     */
    getSortOptions() {
        return [
            { value: 'default', label: 'Default' },
            { value: 'name-asc', label: 'Name (A-Z)' },
            { value: 'name-desc', label: 'Name (Z-A)' },
            { value: 'rating', label: 'Highest Rated' },
            { value: 'most-played', label: 'Most Played' },
            { value: 'recent', label: 'Recently Played' },
            { value: 'random', label: 'Random' }
        ];
    }

    /**
     * Get games added recently (requires dateAdded field)
     */
    getRecentlyAddedGames(days = 7, limit = 20) {
        const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

        return this.allGames
            .filter(game => game.dateAdded && game.dateAdded > cutoffDate)
            .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
            .slice(0, limit);
    }

    /**
     * Get new games count
     */
    getNewGamesCount(days = 7) {
        const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.allGames.filter(game => game.dateAdded && game.dateAdded > cutoffDate).length;
    }

    /**
     * Check if game is new
     */
    isNewGame(gameId, days = 7) {
        const game = this.getGameById(gameId);
        if (!game || !game.dateAdded) return false;

        const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
        return game.dateAdded > cutoffDate;
    }

    /**
     * Get mobile-ready games
     */
    getMobileReadyGames(limit = 50) {
        return this.allGames
            .filter(game => game.mobileReady && game.mobileReady.length > 0)
            .slice(0, limit);
    }

    /**
     * Get related games (improved algorithm)
     */
    getRelatedGames(gameId, limit = 10) {
        const game = this.getGameById(gameId);
        if (!game) return [];

        const gameGenres = (game.genres || []).map(g => g.toLowerCase());
        const gameTags = (game.tags || []).map(t => t.toLowerCase());

        // Score each game based on similarity
        const scored = this.allGames
            .filter(g => g.id !== gameId)
            .map(g => {
                let score = 0;
                const otherGenres = (g.genres || []).map(gen => gen.toLowerCase());
                const otherTags = (g.tags || []).map(t => t.toLowerCase());

                // Genre matches (higher weight)
                const genreMatches = gameGenres.filter(genre => otherGenres.includes(genre)).length;
                score += genreMatches * 3;

                // Tag matches
                const tagMatches = gameTags.filter(tag => otherTags.includes(tag)).length;
                score += tagMatches * 2;

                // Bonus if highly rated
                if (window.ratingsManager) {
                    const rating = parseFloat(window.ratingsManager.getAverageRating(g.id)) || 0;
                    if (rating >= 4) score += 1;
                }

                return { game: g, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.game);

        return scored;
    }

    /**
     * Search with suggestions
     */
    getSearchSuggestions(query, limit = 5) {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const suggestions = [];

        // Title matches (highest priority)
        this.allGames.forEach(game => {
            if (game.title && game.title.toLowerCase().includes(lowerQuery)) {
                suggestions.push({
                    type: 'game',
                    text: game.title,
                    gameId: game.id,
                    slug: game.slug
                });
            }
        });

        // Genre matches
        this.categories.forEach(category => {
            if (category !== 'all' && category.includes(lowerQuery)) {
                suggestions.push({
                    type: 'category',
                    text: category,
                    category: category
                });
            }
        });

        // Remove duplicates and limit
        const unique = suggestions.filter((item, index, self) =>
            index === self.findIndex(t => t.text === item.text)
        );

        return unique.slice(0, limit);
    }
}

// Create global instance
const gamesManager = new GamesManager();
