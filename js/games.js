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
    }

    /**
     * Load games from JSON file
     */
    async loadGames() {
        try {
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
            console.error('Error loading games:', error);

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
     * Filter games by category
     */
    filterByCategory(category) {
        this.currentCategory = category.toLowerCase();
        this.currentPage = 1;
        this.applyFilters();
        return this.getPaginatedGames();
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
     * Get random games
     */
    getRandomGames(count = 10) {
        const shuffled = [...this.allGames].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
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
            displayedGames: this.currentPage * this.gamesPerPage
        };
    }
}

// Create global instance
const gamesManager = new GamesManager();
