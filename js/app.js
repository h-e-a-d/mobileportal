/**
 * Main Application - Kloopik Gaming Portal
 * Handles UI interactions, game display, and user actions
 */

class KloopikApp {
    constructor() {
        this.currentGame = null;
        this.isLoading = false;

        // DOM Elements
        this.elements = {};

        // Debounce timer for search
        this.searchDebounceTimer = null;

        // Initialize app
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Cache DOM elements
            this.cacheElements();

            // Setup event listeners
            this.setupEventListeners();

            // Load games
            await this.loadGames();

            // Setup categories
            this.setupCategories();

            // Display initial games
            this.displayGames();

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load games. Please refresh the page.');
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        // Navigation
        this.elements.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.elements.navbarMenu = document.getElementById('navbarMenu');
        this.elements.navLinks = document.querySelectorAll('.nav-link');

        // Search
        this.elements.searchInput = document.getElementById('searchInput');

        // Sidebar
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.sidebarNav = document.getElementById('sidebarNav');

        // Games section
        this.elements.sectionTitle = document.getElementById('sectionTitle');
        this.elements.gamesCount = document.getElementById('gamesCount');
        this.elements.loadingSpinner = document.getElementById('loadingSpinner');
        this.elements.categoryRows = document.getElementById('categoryRows');
        this.elements.emptyState = document.getElementById('emptyState');

        // Game modal
        this.elements.gameModal = document.getElementById('gameModal');
        this.elements.gameModalOverlay = document.getElementById('gameModalOverlay');
        this.elements.gameModalTitle = document.getElementById('gameModalTitle');
        this.elements.gameIframe = document.getElementById('gameIframe');
        this.elements.closeModalBtn = document.getElementById('closeModalBtn');
        this.elements.favoriteBtn = document.getElementById('favoriteBtn');
        this.elements.fullscreenBtn = document.getElementById('fullscreenBtn');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        this.elements.mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Search input
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });


        // Modal close events
        this.elements.closeModalBtn?.addEventListener('click', () => {
            this.closeGameModal();
        });

        this.elements.gameModalOverlay?.addEventListener('click', () => {
            this.closeGameModal();
        });

        // Favorite button
        this.elements.favoriteBtn?.addEventListener('click', () => {
            this.toggleCurrentGameFavorite();
        });

        // Fullscreen button
        this.elements.fullscreenBtn?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.gameModal.classList.contains('active')) {
                this.closeGameModal();
            }
        });

        // Router events
        window.addEventListener('route:home', () => this.handleHomeRoute());
        window.addEventListener('route:game', (e) => this.handleGameRoute(e.detail));
        window.addEventListener('route:favorites', () => this.handleFavoritesRoute());
        window.addEventListener('route:recent', () => this.handleRecentRoute());
        window.addEventListener('route:category', (e) => this.handleCategoryRoute(e.detail));

        // Handle navigation clicks
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
            });
        });
    }

    /**
     * Load games from JSON
     */
    async loadGames() {
        this.showLoading(true);

        try {
            await gamesManager.loadGames();
            this.showLoading(false);
        } catch (error) {
            this.showLoading(false);
            throw error;
        }
    }

    /**
     * Setup sidebar categories
     */
    setupCategories() {
        const categories = gamesManager.getCategories();
        const container = this.elements.sidebarNav;

        // Clear existing
        container.innerHTML = '';

        // Add category items to sidebar
        categories.forEach(category => {
            const item = document.createElement('div');
            item.className = `sidebar-item ${category === 'all' ? 'active' : ''}`;
            item.dataset.category = category;

            // Icon based on category
            const icon = this.getCategoryIcon(category);

            item.innerHTML = `
                <div class="sidebar-item-icon">${icon}</div>
                <span class="sidebar-item-text">${category === 'all' ? 'All Games' : this.formatCategoryName(category)}</span>
            `;

            item.addEventListener('click', () => {
                this.handleCategoryClick(category);
            });

            container.appendChild(item);
        });
    }

    /**
     * Get icon for category
     */
    getCategoryIcon(category) {
        const icons = {
            'all': '🎮',
            'action': '⚔️',
            'puzzle': '🧩',
            'racing': '🏎️',
            'sports': '⚽',
            'adventure': '🗺️',
            'arcade': '🕹️',
            'strategy': '♟️',
            'shooter': '🎯',
            'rpg': '🛡️',
            'simulation': '✈️',
            'educational': '📚',
            'music': '🎵',
            'kids': '👶',
            'girls': '👧',
            'boys': '👦'
        };

        return icons[category] || '🎲';
    }

    /**
     * Format category name for display
     */
    formatCategoryName(category) {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Display games in category rows
     */
    displayGames() {
        const total = gamesManager.getTotalCount();
        const currentCategory = gamesManager.currentCategory;
        const searchQuery = gamesManager.searchQuery;

        // Update count
        this.elements.gamesCount.textContent = `${total} games`;

        // Clear rows
        this.elements.categoryRows.innerHTML = '';

        // If searching or filtering, show single category row
        if (searchQuery || currentCategory !== 'all') {
            const games = gamesManager.filteredGames;

            if (games.length === 0) {
                this.elements.emptyState.style.display = 'block';
                this.elements.categoryRows.style.display = 'none';
                return;
            } else {
                this.elements.emptyState.style.display = 'none';
                this.elements.categoryRows.style.display = 'flex';
            }

            const categoryRow = this.createCategoryRow(currentCategory, games);
            this.elements.categoryRows.appendChild(categoryRow);
            return;
        }

        // Show all categories with games
        const categories = gamesManager.getCategories();
        const displayCategories = categories.filter(cat => cat !== 'all');

        if (displayCategories.length === 0) {
            this.elements.emptyState.style.display = 'block';
            this.elements.categoryRows.style.display = 'none';
            return;
        }

        this.elements.emptyState.style.display = 'none';
        this.elements.categoryRows.style.display = 'flex';

        // Create row for each category (show 25 categories)
        displayCategories.slice(0, 25).forEach(category => {
            const categoryGames = gamesManager.allGames.filter(game =>
                game.genres && game.genres.some(g => g.toLowerCase() === category)
            ).slice(0, 20);

            if (categoryGames.length > 0) {
                const categoryRow = this.createCategoryRow(category, categoryGames);
                this.elements.categoryRows.appendChild(categoryRow);
            }
        });

        // Add "All Games" row at the end with all games
        const allGamesRow = this.createCategoryRow('all', gamesManager.allGames.slice(0, 50));
        this.elements.categoryRows.appendChild(allGamesRow);

        // Add fade-in animation
        this.elements.categoryRows.classList.add('fade-in');
    }

    /**
     * Create category row with carousel
     */
    createCategoryRow(category, games) {
        const row = document.createElement('div');
        row.className = 'category-row';
        row.dataset.category = category;

        const categoryName = category === 'all' ? 'All Games' : this.formatCategoryName(category);

        row.innerHTML = `
            <div class="category-row-header">
                <h3 class="category-row-title">${categoryName}</h3>
                <div class="category-row-actions">
                    <button class="carousel-nav-btn carousel-prev" aria-label="Previous">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                    <button class="carousel-nav-btn carousel-next" aria-label="Next">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="carousel-container">
                <div class="carousel-track"></div>
            </div>
        `;

        // Add game cards to carousel
        const track = row.querySelector('.carousel-track');
        games.forEach(game => {
            const card = this.createGameCard(game);
            track.appendChild(card);
        });

        // Setup carousel navigation
        this.setupCarousel(row);

        // Click title to filter by category
        const title = row.querySelector('.category-row-title');
        title.addEventListener('click', () => {
            if (category !== 'all') {
                this.handleCategoryClick(category);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        return row;
    }

    /**
     * Setup carousel navigation
     */
    setupCarousel(rowElement) {
        const track = rowElement.querySelector('.carousel-track');
        const prevBtn = rowElement.querySelector('.carousel-prev');
        const nextBtn = rowElement.querySelector('.carousel-next');

        let scrollPosition = 0;
        const scrollAmount = 850; // Scroll ~4 cards at a time

        const updateButtons = () => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            prevBtn.disabled = scrollPosition <= 0;
            nextBtn.disabled = scrollPosition >= maxScroll;
        };

        prevBtn.addEventListener('click', () => {
            scrollPosition = Math.max(0, scrollPosition - scrollAmount);
            track.style.transform = `translateX(-${scrollPosition}px)`;
            updateButtons();
        });

        nextBtn.addEventListener('click', () => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            scrollPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
            track.style.transform = `translateX(-${scrollPosition}px)`;
            updateButtons();
        });

        // Initial button state
        setTimeout(updateButtons, 100);
    }

    /**
     * Create game card element
     */
    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.dataset.gameId = game.id;

        const isFavorite = storageManager.isFavorite(game.id);

        // Get thumbnail
        const thumbnail = gamesManager.getGameThumbnail(game);

        card.innerHTML = `
            <img
                src="${thumbnail}"
                alt="${game.title}"
                class="game-card-image"
                loading="lazy"
                onerror="this.src='${gamesManager.generatePlaceholderImage(game.title)}'"
            >
            <div class="game-card-overlay">
                <h3 class="game-card-title">${game.title}</h3>
            </div>
            <button class="game-card-favorite ${isFavorite ? 'is-favorite' : ''}" data-game-id="${game.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>
        `;

        // Click to play game
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking favorite button
            if (!e.target.closest('.game-card-favorite')) {
                this.openGame(game);
            }
        });

        // Favorite button
        const favoriteBtn = card.querySelector('.game-card-favorite');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite(game.id);
        });

        return card;
    }

    /**
     * Open game in modal
     */
    openGame(game) {
        this.currentGame = game;

        // Update modal title
        this.elements.gameModalTitle.textContent = game.title;

        // Set iframe source
        this.elements.gameIframe.src = game.gameURL;

        // Update favorite button state
        this.updateFavoriteButton();

        // Show modal
        this.elements.gameModal.classList.add('active');

        // Disable body scroll
        document.body.style.overflow = 'hidden';

        // Add to recently played
        storageManager.addRecentlyPlayed(game.id);

        // Update meta tags for SEO
        router.updateGameMetaTags(game);

        // Update URL without navigating
        router.navigate(`/game/${game.slug}`, true);
    }

    /**
     * Close game modal
     */
    closeGameModal() {
        // Hide modal
        this.elements.gameModal.classList.remove('active');

        // Clear iframe
        this.elements.gameIframe.src = '';

        // Enable body scroll
        document.body.style.overflow = '';

        // Clear current game
        this.currentGame = null;

        // Navigate back to home
        router.navigate('/', true);
    }

    /**
     * Toggle favorite for current game
     */
    toggleCurrentGameFavorite() {
        if (this.currentGame) {
            this.toggleFavorite(this.currentGame.id);
        }
    }

    /**
     * Toggle favorite status
     */
    toggleFavorite(gameId) {
        storageManager.toggleFavorite(gameId);

        // Update all favorite buttons for this game
        this.updateFavoriteButtons(gameId);

        // If on favorites page, refresh
        if (router.getCurrentRoute() === 'favorites') {
            this.handleFavoritesRoute();
        }
    }

    /**
     * Update favorite button state
     */
    updateFavoriteButton() {
        if (!this.currentGame) return;

        const isFavorite = storageManager.isFavorite(this.currentGame.id);

        if (isFavorite) {
            this.elements.favoriteBtn.classList.add('is-favorite');
            this.elements.favoriteBtn.title = 'Remove from favorites';
        } else {
            this.elements.favoriteBtn.classList.remove('is-favorite');
            this.elements.favoriteBtn.title = 'Add to favorites';
        }
    }

    /**
     * Update all favorite buttons for a game
     */
    updateFavoriteButtons(gameId) {
        const isFavorite = storageManager.isFavorite(gameId);
        const buttons = document.querySelectorAll(`[data-game-id="${gameId}"]`);

        buttons.forEach(btn => {
            if (isFavorite) {
                btn.classList.add('is-favorite');
            } else {
                btn.classList.remove('is-favorite');
            }
        });

        // Update modal button if this is current game
        if (this.currentGame && this.currentGame.id === gameId) {
            this.updateFavoriteButton();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        const modalContent = document.querySelector('.game-modal-content');

        if (!document.fullscreenElement) {
            modalContent.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Handle category filter click
     */
    handleCategoryClick(category) {
        // Update active state in sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.sidebar-item[data-category="${category}"]`)?.classList.add('active');

        // Filter games
        gamesManager.filterByCategory(category);

        // Update section title
        this.elements.sectionTitle.textContent = category === 'all'
            ? 'All Games'
            : `${this.formatCategoryName(category)} Games`;

        // Display filtered games
        this.displayGames();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        // Debounce search
        clearTimeout(this.searchDebounceTimer);

        this.searchDebounceTimer = setTimeout(() => {
            gamesManager.searchGames(query);

            // Update section title
            if (query.trim()) {
                this.elements.sectionTitle.textContent = `Search results for "${query}"`;
            } else {
                const category = gamesManager.currentCategory;
                this.elements.sectionTitle.textContent = category === 'all'
                    ? 'All Games'
                    : `${this.formatCategoryName(category)} Games`;
            }

            this.displayGames();
        }, 300);
    }


    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.elements.navbarMenu.classList.toggle('active');
    }

    /**
     * Handle navigation link clicks
     */
    handleNavClick(e) {
        // Remove active class from all
        this.elements.navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to clicked
        e.target.classList.add('active');

        // Close mobile menu
        this.elements.navbarMenu.classList.remove('active');
    }

    /**
     * Show/hide loading spinner
     */
    showLoading(show) {
        this.isLoading = show;

        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = show ? 'flex' : 'none';
        }

        if (this.elements.categoryRows) {
            this.elements.categoryRows.style.display = show ? 'none' : 'flex';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';
            this.elements.emptyState.innerHTML = `
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>Error</h3>
                <p>${message}</p>
            `;
        }

        if (this.elements.categoryRows) {
            this.elements.categoryRows.style.display = 'none';
        }
    }

    /**
     * Route Handlers
     */

    handleHomeRoute() {
        this.closeGameModal();
        gamesManager.resetFilters();
        this.displayGames();

        // Update nav active state
        this.updateNavActiveState('all');
    }

    handleGameRoute(detail) {
        const { slug } = detail;
        const game = gamesManager.getGameBySlug(slug);

        if (game) {
            this.openGame(game);
        } else {
            // Game not found, redirect to home
            router.navigate('/');
        }
    }

    handleFavoritesRoute() {
        this.closeGameModal();

        const favoriteIds = storageManager.getFavorites();
        const favoriteGames = gamesManager.getGamesByIds(favoriteIds);

        // Manually set filtered games
        gamesManager.filteredGames = favoriteGames;
        gamesManager.currentPage = 1;

        this.elements.sectionTitle.textContent = 'My Favorites';
        this.displayGames();

        // Update nav active state
        this.updateNavActiveState('favorites');
    }

    handleRecentRoute() {
        this.closeGameModal();

        const recentIds = storageManager.getRecentlyPlayed();
        const recentGames = gamesManager.getGamesByIds(recentIds);

        // Manually set filtered games
        gamesManager.filteredGames = recentGames;
        gamesManager.currentPage = 1;

        this.elements.sectionTitle.textContent = 'Recently Played';
        this.displayGames();

        // Update nav active state
        this.updateNavActiveState('recent');
    }

    handleCategoryRoute(detail) {
        this.closeGameModal();
        const { category } = detail;
        this.handleCategoryClick(category);
    }

    /**
     * Update navigation active state
     */
    updateNavActiveState(page) {
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');

            if (link.dataset.page === page || link.dataset.category === page) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.kloopikApp = new KloopikApp();
    });
} else {
    window.kloopikApp = new KloopikApp();
}
