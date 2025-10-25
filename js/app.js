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

        // AbortController for event listener cleanup
        this.abortController = new AbortController();

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
        // Get signal for event listener cleanup
        const signal = this.abortController.signal;

        // Mobile menu toggle
        this.elements.mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        }, { signal });

        // Search input
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        }, { signal });


        // Modal close events
        this.elements.closeModalBtn?.addEventListener('click', () => {
            this.closeGameModal();
        }, { signal });

        this.elements.gameModalOverlay?.addEventListener('click', () => {
            this.closeGameModal();
        }, { signal });

        // Favorite button
        this.elements.favoriteBtn?.addEventListener('click', () => {
            this.toggleCurrentGameFavorite();
        }, { signal });

        // Fullscreen button
        this.elements.fullscreenBtn?.addEventListener('click', () => {
            this.toggleFullscreen();
        }, { signal });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.gameModal.classList.contains('active')) {
                this.closeGameModal();
            }
        }, { signal });

        // Router events
        window.addEventListener('route:home', () => this.handleHomeRoute(), { signal });
        window.addEventListener('route:game', (e) => this.handleGameRoute(e.detail), { signal });
        window.addEventListener('route:favorites', () => this.handleFavoritesRoute(), { signal });
        window.addEventListener('route:recent', () => this.handleRecentRoute(), { signal });
        window.addEventListener('route:category', (e) => this.handleCategoryRoute(e.detail), { signal });

        // Handle navigation clicks
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
            }, { signal });
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

            // Create icon div (XSS-safe - icons are hardcoded, not user input)
            const iconDiv = document.createElement('div');
            iconDiv.className = 'sidebar-item-icon';
            iconDiv.innerHTML = icon; // Safe - icons are hardcoded in getCategoryIcon()

            // Create text span (XSS-safe)
            const textSpan = document.createElement('span');
            textSpan.className = 'sidebar-item-text';
            textSpan.textContent = category === 'all' ? 'All Games' : this.formatCategoryName(category); // Safe from XSS

            item.appendChild(iconDiv);
            item.appendChild(textSpan);

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
            // Core categories
            'all': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'action': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14l7 0-1 8 10-12-7 0z"/></svg>',
            'puzzle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.439 15.439c.447.447.447 1.174 0 1.621l-1.878 1.878c-.447.447-1.174.447-1.621 0-.72-.72-1.89-.72-2.61 0-.447.447-1.174.447-1.621 0-.72-.72-.72-1.89 0-2.61.447-.447.447-1.174 0-1.621L9.88 13.12c-.72-.72-1.89-.72-2.61 0-.447.447-1.174.447-1.621 0l-1.88-1.88c-.446-.446-.446-1.173 0-1.62.72-.72.72-1.89 0-2.61-.447-.447-.447-1.174 0-1.621l1.879-1.879c.447-.447 1.174-.447 1.621 0 .72.72 1.89.72 2.61 0 .447-.447 1.174-.447 1.621 0 .72.72.72 1.89 0 2.61-.447.447-.447 1.174 0 1.621l1.879 1.879c.72.72 1.89.72 2.61 0 .447-.447 1.174-.447 1.621 0l1.88 1.879c.447.447.447 1.174 0 1.621-.72.72-.72 1.89 0 2.61z"/></svg>',
            'racing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17h2l1-3 2 6 2-12 2 9 1.5-4h2.5"/><path d="M19 17h2"/></svg>',
            'sports': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M2 12h20"/></svg>',
            'adventure': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><path d="M12 2v20M2 7l10 5 10-5"/></svg>',
            'arcade': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="12" height="16" rx="2"/><circle cx="10" cy="9" r="1.5"/><circle cx="14" cy="9" r="1.5"/><rect x="9" y="14" width="6" height="3" rx="1"/></svg>',
            'strategy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M9 6h6M9 18h6M6 9v6M18 9v6"/></svg>',
            'shooting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13l-7 7M15 4l5 5-9 9-5-5 9-9z"/><circle cx="17" cy="7" r="1"/></svg>',
            'shooter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.34 6.34l1.42 1.42M16.24 16.24l1.42 1.42M6.34 17.66l1.42-1.42M16.24 7.76l1.42-1.42"/></svg>',
            'rpg': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12l2 7-8 9-8-9 2-7z"/><path d="M11 3v7M13 3v7"/></svg>',
            'simulation': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 12h4M15 10h2M15 14h2"/><circle cx="9" cy="12" r="1"/></svg>',
            'simulator': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h6M15 12h6M12 3v6M12 15v6M6.3 6.3l4.2 4.2M13.5 13.5l4.2 4.2M6.3 17.7l4.2-4.2M13.5 10.5l4.2-4.2"/></svg>',
            'music': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
            'kids': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',
            'girls': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'boys': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            'car': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-3-4H8l-3 4v3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 17H3v-5l2-2h3"/></svg>',
            'driving': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="3"/></svg>',
            'multiplayer': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M5 15a4 4 0 0 1 6 0M13 15a4 4 0 0 1 6 0"/><path d="M8 10v2M16 10v2"/></svg>',
            'io': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h6M15 12h6M12 3v6M12 15v6"/></svg>',
            '3d': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
            'cooking': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z"/><path d="M6 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"/><path d="M15 11V9a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2"/></svg>',
            'dress-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v7a1 1 0 0 1-1 1h-4M8 3H3v7a1 1 0 0 0 1 1h4M8 3l4 8 4-8M8 11v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V11"/></svg>',
            'fashion': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0 1 16 0v1"/><path d="M8.5 11.5l-1.5 7M15.5 11.5l1.5 7"/></svg>',
            'make-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><circle cx="8" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><path d="M12 12l-2-6M12 12l2-6"/></svg>',
            'decoration': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>',
            'physics': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
            'platform': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="16" width="20" height="2"/><rect x="5" y="11" width="14" height="2"/><rect x="8" y="6" width="8" height="2"/><circle cx="12" cy="3" r="1"/></svg>',
            'horror': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 5 5 1-4 4 1 5-4-3-4 3 1-5-4-4 5-1 2-5z"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M9 14c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5"/></svg>',
            'zombie': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/><rect x="7" y="8" width="10" height="11" rx="1"/><path d="M9 11h1M14 11h1M10 15l1 1 1-1 1 1 1-1"/></svg>',
            'fighting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l3-3-3-3M18 15l-3-3 3-3"/><circle cx="12" cy="12" r="10"/></svg>',
            'brain': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2c-1.8 0-3.5.8-4.5 2.3C4.4 4.1 4 4 3.5 4 2.1 4 1 5.1 1 6.5c0 .8.4 1.6 1 2.1v3.8c0 3.3 2.7 6 6 6h.5"/><path d="M14.5 2c1.8 0 3.5.8 4.5 2.3.6-.2 1-.3 1.5-.3C21.9 4 23 5.1 23 6.5c0 .8-.4 1.6-1 2.1v3.8c0 3.3-2.7 6-6 6h-.5"/><path d="M12 18.5v3"/></svg>',
            'skill': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1 3-7z"/></svg>',
            'hidden-object': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><circle cx="8" cy="10" r="1"/><circle cx="14" cy="10" r="1"/></svg>',
            'matching': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/><path d="M9.5 8.5l5 5M14.5 8.5l-5 5"/></svg>',
            'merge': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v7M12 15v7M2 12h7M15 12h7"/><circle cx="12" cy="12" r="1"/></svg>',
            'clicker': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6l2 2h4v14H3V5h4l2-2z"/><circle cx="12" cy="13" r="4"/><circle cx="12" cy="13" r="1.5"/></svg>',
            'idle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            'snake': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v0a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-1"/><circle cx="6" cy="9" r="1"/></svg>',
            'stickman': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="13" x2="8" y2="18"/><line x1="12" y1="13" x2="16" y2="18"/><line x1="12" y1="9" x2="8" y2="12"/><line x1="12" y1="9" x2="16" y2="12"/></svg>',
            'running': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="4" r="2"/><path d="M10 8l-1 3 2 1 2-2M17 12l-2-2M9 16l-1-3"/><path d="M4 20h5M14 20h5"/></svg>',
            'parkour': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="14" cy="4" r="2"/><path d="M8 8l-1 4 3 2 4-3M19 13l-3-2M11 17l-2-3"/><rect x="2" y="18" width="5" height="2"/><rect x="15" y="15" width="5" height="2"/></svg>',
            'classic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 4v16"/></svg>',
            'mini': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="8" height="8" rx="1"/><circle cx="12" cy="12" r="2"/></svg>',
            'mobile': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="18" r="1"/></svg>',
            'two-player': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M2 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M14 20v-2a4 4 0 0 1 4-4h4"/></svg>',
            'logic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h6M9 18h6M6 9v6M18 9v6"/></svg>',
            'escape': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l4-4 4 4M12 8v8"/></svg>',
            'maze': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 8h5M12 8h9M3 13h9M16 13h5M3 18h5M12 18h9M8 3v5M8 12v9M13 3v9M13 16v5M18 3v5M18 12v5"/></svg>',
            'tower-defense': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="11" width="6" height="11"/><rect x="7" y="7" width="10" height="4"/><rect x="10" y="3" width="4" height="4"/><line x1="7" y1="15" x2="5" y2="15"/><line x1="7" y1="18" x2="5" y2="18"/><line x1="17" y1="15" x2="19" y2="15"/><line x1="17" y1="18" x2="19" y2="18"/></svg>',
            'management': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/><path d="M7 10v4M17 10v4M10 7h4M10 17h4"/></svg>',
            'ball': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M6 12a6 6 0 0 1 12 0M12 6v12M8 8l8 8M8 16l8-8"/></svg>',
            'hunting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12h16"/><circle cx="12" cy="12" r="2"/><path d="M12 10V4M10 6l2-2 2 2"/></svg>',
            'gun': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v8M16 8l-4 4-4-4"/><rect x="8" y="12" width="8" height="8" rx="1"/><circle cx="12" cy="16" r="1"/></svg>',
            'sniper': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="10"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>',
            'first-person-shooter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M3 12h4M17 12h4M12 3v4M12 17v4"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>',
            'battle-royale': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1 2-4z"/></svg>',
            'tanks': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="6" rx="1"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 11V7h5v4"/><line x1="20" y1="14" x2="23" y2="14"/></svg>',
            'popular': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'funny': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="8.5" cy="9.5" r="1.5"/><circle cx="15.5" cy="9.5" r="1.5"/></svg>',
            'drawing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l3-3 4 4 8-8 3 3"/><path d="M18 6l-2-2 2-2M6 18l-2 2 2 2"/></svg>',
            'color': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>',
            'animals': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/><path d="M12 10c-4 0-7 2-7 5v4h14v-4c0-3-3-5-7-5z"/><circle cx="12" cy="14" r="1"/></svg>',
            'love': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'princess-dress-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-2 4h-4v4l-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8l-2-2V6h-4l-2-4z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/></svg>',
            'make-over': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20v-1a8 8 0 0 1 16 0v1"/><path d="M8 10l-2 4M16 10l2 4"/></svg>',
            'drifting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-3-3H8l-3 3v3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M2 10c2-2 4-3 7-2"/></svg>',
            'motorbike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M15 8l-3 10M12 8h6l2 10M8 8l3 10"/></svg>',
            'bike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 6l-2 12M10 6h6l2 12M8 18l11 0"/></svg>',
            'dirt-bike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="18" r="3"/><circle cx="19" cy="18" r="3"/><path d="M14 6l-3 12M11 6h7l1 12"/><path d="M3 15l2-2M21 15l-2-2"/></svg>',
            'car-racing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-3-4H8l-3 4v3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><rect x="8" y="7" width="8" height="3" rx="1"/></svg>',
            'police': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-8 3v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3z"/><circle cx="12" cy="12" r="3"/></svg>',
            'train': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="2"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M4 11h16M8 6V4M16 6V4M6 18l-2 2M18 18l2 2"/></svg>',
            'educational': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/></svg>',
            'story': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 6h8M8 10h8M8 14h5"/></svg>',
            'point-and-click': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>',
            'mouse': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="3" width="8" height="14" rx="4"/><path d="M12 3v5"/></svg>',
            'number': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
            'halloween': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 9l1-1 1 1M14 9l1-1 1 1M7 14l2 2h6l2-2"/></svg>',
            'monster': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="14" rx="2"/><circle cx="9" cy="11" r="1"/><circle cx="15" cy="11" r="1"/><path d="M8 15h8M6 6l-2-3M18 6l2-3M4 10h-2M20 10h2"/></svg>',
            'scary': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 9l1.5-1.5L8 6M16 9l-1.5-1.5L16 6"/><path d="M7 15l2-1 3 2 3-2 2 1"/></svg>',
            'survival': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-9 9 9M10 11v10M14 11v10M6 15h12"/></svg>',
            'pixel-art': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'obby': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="16" width="5" height="3"/><rect x="10" y="12" width="5" height="3"/><rect x="17" y="8" width="4" height="3"/><circle cx="5" cy="5" r="1"/></svg>',
            'co-op': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><circle cx="15" cy="7" r="4"/><path d="M2 21v-2a5 5 0 0 1 10 0v2M12 21v-2a5 5 0 0 1 10 0v2"/></svg>',
            'chess': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l1 3h-2l1-3z"/><path d="M10 5h4v3h-4z"/><rect x="8" y="8" width="8" height="10"/><path d="M6 18h12v2H6z"/></svg>',
            'board': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
            'pve': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="4"/><path d="M14 8h6M17 5v6M4 16a4 4 0 0 1 8 0v2H4v-2z"/></svg>',
            'pvp': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M2 16a4 4 0 0 1 8 0v2H2v-2zM14 16a4 4 0 0 1 8 0v2h-8v-2z"/><path d="M11 12l2-2 2 2"/></svg>',
            'robot': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="12" height="10" rx="2"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M10 16h4M12 2v6M6 8V6M18 8V6"/></svg>',
            'army': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-8 3v6c0 5 3 9 8 11 5-2 8-6 8-11V5l-8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
            'intelligence': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8M9 9l6 6M15 9l-6 6"/></svg>',
            'unity': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-10 7v7l10 6 10-6v-7l-10-7z"/><path d="M12 2v20M2 9l10 6 10-6"/></svg>',
            'crafting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
            'restaurant': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h2"/><path d="M7 2v20M21 15V2"/><path d="M17 2v13h4"/></svg>',
            'papas': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M4 20v-1a8 8 0 0 1 16 0v1"/><path d="M8 8h8M10 12h4"/></svg>',
            'ragdoll': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><path d="M10 7l-3 5M14 7l3 5M10 12l-2 6M14 12l2 6M7 12l5 2 5-2"/></svg>',
            'cozy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M9 22V12h6v10"/></svg>',
            'cool-games': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 12h-4l-2 4M8 10h.01M16 10h.01"/></svg>',
            'crazy-games': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14h8M7 9l3 1M14 9l3 1M2 12c2 0 4-1 6-3M16 9c2-2 4-3 6-3"/></svg>',
            'hypercasual': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',

            // Additional categories
            'airplane': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 13h7v9l9-11h-7V2z"/><path d="M17 8l4-2M7 16l-4 2"/></svg>',
            'anime': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="7"/><circle cx="9" cy="9" r="3"/><path d="M14 14l7 7M9 2v4M2 9h4"/></svg>',
            'app-store': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 12h10M12 7v10"/></svg>',
            'archery': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M2 12L8 12M22 12L16 12"/></svg>',
            'backgammon': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h18M12 3v18"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/></svg>',
            'basketball': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="M6 6c2 2 2 10 0 12M18 6c-2 2-2 10 0 12"/></svg>',
            'battleship': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15l6-3V6h6v6l6 3v5H3v-5z"/><rect x="9" y="2" width="6" height="4"/></svg>',
            'blocks': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
            'boat': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18l3-3 6 3 6-3 3 3"/><path d="M12 2v12M12 2L8 6M12 2l4 4"/></svg>',
            'bubble': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4"/></svg>',
            'bubble-shooter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="6" r="3"/><circle cx="16" cy="6" r="3"/><circle cx="12" cy="12" r="3"/><path d="M12 15v7M12 22l-3-3M12 22l3-3"/></svg>',
            'bus': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="14" rx="2"/><path d="M4 10h16M8 18v2M16 18v2"/><circle cx="8" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></svg>',
            'candy-crush': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><circle cx="8" cy="16" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
            'cards': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="12" height="16" rx="2"/><path d="M8 8h4M8 12h4"/><rect x="8" y="6" width="12" height="16" rx="2"/></svg>',
            'cats': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L8 6h8l-4-4z"/><circle cx="12" cy="12" r="6"/><circle cx="10" cy="11" r="1"/><circle cx="14" cy="11" r="1"/><path d="M10 14c.5.5 1.5 1 2 1s1.5-.5 2-1"/></svg>',
            'checkers': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>',
            'christmas': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-8 8h6l-6 8h6l-4 4h16l-4-4h6l-6-8h6l-8-8z"/></svg>',
            'construction': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 7l-5 5M19 12l-5 5"/><rect x="3" y="3" width="7" height="7" rx="1"/><circle cx="17" cy="17" r="3"/></svg>',
            'difficult': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z"/></svg>',
            'dog': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="6"/><path d="M8 4l-2 4M16 4l2 4"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="9" r="1"/><path d="M9 13h6"/></svg>',
            'dragon': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l-2 4 2 2 2-2-2-4z"/><path d="M12 9c-4 0-7 2-7 5v5h14v-5c0-3-3-5-7-5z"/><path d="M5 14l-3 2M19 14l3 2"/></svg>',
            'easter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="13" rx="6" ry="9"/><path d="M8 10l2 2M16 10l-2 2M10 16h4"/></svg>',
            'easy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
            'farm': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20h18"/><path d="M5 20V10l7-7 7 7v10"/><path d="M9 20v-6h6v6"/></svg>',
            'fishing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v8c0 2 2 3 4 3M6 10L2 14"/><circle cx="18" cy="16" r="3"/><path d="M10 13l5 3"/></svg>',
            'flash': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            'flying': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v8M3 10l9 2 9-2"/><path d="M12 10v10M6 18l6 2 6-2"/></svg>',
            'food': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>',
            'geography': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            'ghost': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 2 4 5 4 9v11l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V9c0-4-4-7-8-7z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>',
            'gta': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-3-4H8l-3 4v3z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M12 2l2 4M8 6l4-4 4 4"/></svg>',
            'hair': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c-3 0-5 2-5 5v4c0 2 1 3 3 3h4c2 0 3-1 3-3V7c0-3-2-5-5-5z"/><path d="M8 14v6M12 14v8M16 14v6"/></svg>',
            'hangman': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 20h12M6 4h8M14 4v4"/><circle cx="14" cy="8" r="2"/><path d="M14 10v6M12 14l2-2M16 14l-2-2M14 16l-2 4M14 16l2 4"/></svg>',
            'henry-stickmin': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="12" y1="13" x2="8" y2="18"/><line x1="12" y1="13" x2="16" y2="18"/><line x1="12" y1="9" x2="8" y2="12"/><line x1="12" y1="9" x2="16" y2="12"/></svg>',
            'horse': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-2 4v4h4V6l-2-4z"/><rect x="8" y="6" width="8" height="10"/><path d="M8 16v4M16 16v4"/><circle cx="10" cy="9" r="1"/></svg>',
            'magic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l9-9M15 6l6-3-3 6M9 18l3-3M18 3l-3 3"/><path d="M12 12l-4 4M15 9l-3 3"/></svg>',
            'mahjong': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="10" rx="1"/><rect x="14" y="3" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="6.5" cy="7" r="1"/><circle cx="17.5" cy="7" r="1"/></svg>',
            'match-3': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="12" cy="17" r="3"/></svg>',
            'math': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M6 8l12 8M6 16l12-8"/></svg>',
            'megaspel': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/></svg>',
            'minecraft': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
            'mini-golf': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 20l2-16 10 4-10 2"/><circle cx="6" cy="20" r="2"/></svg>',
            'ninja': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M8 8v2h8V8M6 12l2 8h8l2-8"/></svg>',
            'nitrome': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8v8H8z"/></svg>',
            'parking': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8h4a4 4 0 0 1 0 8H8V8z"/></svg>',
            'party': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3l2 18M18 3l-2 18M12 3v18"/><path d="M3 9h18M3 15h18"/></svg>',
            'penalty': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="16" r="3"/><rect x="4" y="2" width="16" height="12" rx="1"/><path d="M12 8v4"/></svg>',
            'pirates': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15l6-3V6h6v6l6 3v6H3v-6z"/><path d="M12 2v4"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>',
            'pizza': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 22l10-5 10 5L12 2z"/><circle cx="12" cy="10" r="1"/><circle cx="10" cy="14" r="1"/><circle cx="14" cy="14" r="1"/></svg>',
            'pool': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></svg>',
            'pop-it': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><circle cx="12" cy="12" r="2"/></svg>',
            'princess': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l2-4 4 4 4-4 2 4"/><path d="M4 6h16v4H4z"/><path d="M6 10v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>',
            'quiz': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            'retro': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="3" height="3"/><rect x="13" y="8" width="3" height="3"/><rect x="8" y="13" width="8" height="3"/></svg>',
            'scrabble': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M7 7h.01M18 7h.01M7 18h.01"/></svg>',
            'shopping': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
            'slime': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15c0-3 2-5 6-5s6 2 6 5v4H6v-4z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>',
            'soccer': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2l2 6-5 4h6l-5 4 2 6"/></svg>',
            'solitaire': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="6" height="8" rx="1"/><rect x="12" y="6" width="6" height="8" rx="1"/><rect x="9" y="12" width="6" height="8" rx="1"/></svg>',
            'space': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
            'sudoku': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
            'trivia': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg>',
            'tycoon': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><circle cx="12" cy="12" r="3"/><path d="M12 9V2M12 22v-7"/></svg>',
            'war': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l-8 8h6v10h4V10h6l-8-8z"/></svg>',
            'watermelon': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="10" r="1"/><circle cx="12" cy="14" r="1"/></svg>',
            'winter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M6 6l12 12M18 6L6 18M2 12h20M6 18l12-12M18 18L6 6"/></svg>',
            'wolf': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L8 6l4 2 4-2-4-4z"/><circle cx="12" cy="10" r="5"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="9" r="1"/><path d="M9 13h6"/></svg>',
            'words': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
            'world-cup': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>',
            'wrestling': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="3"/><circle cx="15" cy="7" r="3"/><path d="M6 14l3-3 3 3M15 14l3-3 3 3M9 17v5M15 17v5"/></svg>'
        };

        return icons[category] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>';
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
        const currentRoute = router.getCurrentRoute();

        // Update count
        this.elements.gamesCount.textContent = `${total} games`;

        // Cleanup old carousels before clearing (prevent memory leaks)
        this.cleanupCarousels();

        // Clear rows
        this.elements.categoryRows.innerHTML = '';

        // If searching, filtering, or on favorites/recent page, show single category row
        if (searchQuery || currentCategory !== 'all' || currentRoute === 'favorites' || currentRoute === 'recent') {
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

        // Add "All Games" section at the end with grid layout
        const allGamesSection = this.createAllGamesGrid();
        this.elements.categoryRows.appendChild(allGamesSection);

        // Add fade-in animation
        this.elements.categoryRows.classList.add('fade-in');
    }

    /**
     * Cleanup all carousel event listeners to prevent memory leaks
     */
    cleanupCarousels() {
        // Find all category rows
        const rows = this.elements.categoryRows.querySelectorAll('.category-row');

        let cleanedCount = 0;

        rows.forEach(row => {
            // Call cleanup function if it exists
            if (row._carouselCleanup && typeof row._carouselCleanup === 'function') {
                row._carouselCleanup();
                cleanedCount++;
            }
        });

        if (window.logger && cleanedCount > 0) {
            window.logger.debug('[App] Cleaned up', cleanedCount, 'carousels');
        }
    }

    /**
     * Create "All Games" grid section (XSS-safe)
     */
    createAllGamesGrid() {
        const section = document.createElement('div');
        section.className = 'all-games-section';
        section.id = 'allGamesSection';

        // Create header (safe)
        const header = document.createElement('div');
        header.className = 'category-row-header';

        const title = document.createElement('h3');
        title.className = 'category-row-title';
        title.textContent = 'All Games';
        header.appendChild(title);

        // Create grid container
        const grid = document.createElement('div');
        grid.className = 'all-games-grid';
        grid.id = 'allGamesGrid';

        // Create load more container
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.className = 'load-more-container';
        loadMoreContainer.id = 'allGamesLoadMore';
        loadMoreContainer.style.display = 'none';

        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn-load-more';
        loadMoreBtn.id = 'allGamesLoadMoreBtn';
        loadMoreBtn.textContent = 'Load More Games';

        loadMoreContainer.appendChild(loadMoreBtn);

        section.appendChild(header);
        section.appendChild(grid);
        section.appendChild(loadMoreContainer);

        // Setup pagination
        let currentPage = 1;
        const gamesPerPage = 24;

        const loadGames = () => {
            const start = (currentPage - 1) * gamesPerPage;
            const end = currentPage * gamesPerPage;
            const gamesToShow = gamesManager.allGames.slice(start, end);

            gamesToShow.forEach(game => {
                const card = this.createGameCard(game);
                grid.appendChild(card);
            });

            // Show/hide load more button
            if (end >= gamesManager.allGames.length) {
                loadMoreContainer.style.display = 'none';
            } else {
                loadMoreContainer.style.display = 'block';
            }
        };

        // Load initial games
        loadGames();

        // Load more button handler
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            loadGames();
            // Scroll to first new game
            const cards = grid.querySelectorAll('.game-card');
            const firstNewCard = cards[cards.length - gamesPerPage];
            if (firstNewCard) {
                firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        return section;
    }

    /**
     * Create category row with carousel (XSS-safe)
     */
    createCategoryRow(category, games) {
        const row = document.createElement('div');
        row.className = 'category-row';
        row.dataset.category = category;

        // Handle special categories (favorites, recent) with proper names
        let categoryName;
        if (category === 'all') {
            categoryName = 'All Games';
        } else if (category === 'favorites') {
            categoryName = 'My Favorites';
        } else if (category === 'recent') {
            categoryName = 'Recently Played';
        } else {
            categoryName = this.formatCategoryName(category);
        }

        // Create header (safe)
        const header = document.createElement('div');
        header.className = 'category-row-header';

        const title = document.createElement('h3');
        title.className = 'category-row-title';
        title.textContent = categoryName; // Safe from XSS

        header.appendChild(title);
        row.appendChild(header);

        // Create carousel container
        const carouselContainer = document.createElement('div');
        carouselContainer.className = 'carousel-container';

        // Create prev button with SVG
        const prevBtn = document.createElement('button');
        prevBtn.className = 'carousel-nav-btn carousel-prev';
        prevBtn.setAttribute('aria-label', 'Previous');

        const prevSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        prevSvg.setAttribute('width', '20');
        prevSvg.setAttribute('height', '20');
        prevSvg.setAttribute('viewBox', '0 0 24 24');
        prevSvg.setAttribute('fill', 'none');
        prevSvg.setAttribute('stroke', 'currentColor');

        const prevPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        prevPolyline.setAttribute('points', '15 18 9 12 15 6');

        prevSvg.appendChild(prevPolyline);
        prevBtn.appendChild(prevSvg);

        // Create next button with SVG
        const nextBtn = document.createElement('button');
        nextBtn.className = 'carousel-nav-btn carousel-next';
        nextBtn.setAttribute('aria-label', 'Next');

        const nextSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        nextSvg.setAttribute('width', '20');
        nextSvg.setAttribute('height', '20');
        nextSvg.setAttribute('viewBox', '0 0 24 24');
        nextSvg.setAttribute('fill', 'none');
        nextSvg.setAttribute('stroke', 'currentColor');

        const nextPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        nextPolyline.setAttribute('points', '9 18 15 12 9 6');

        nextSvg.appendChild(nextPolyline);
        nextBtn.appendChild(nextSvg);

        // Create track
        const track = document.createElement('div');
        track.className = 'carousel-track';

        // Add game cards to carousel
        games.forEach(game => {
            const card = this.createGameCard(game);
            track.appendChild(card);
        });

        // Assemble carousel
        carouselContainer.appendChild(prevBtn);
        carouselContainer.appendChild(nextBtn);
        carouselContainer.appendChild(track);
        row.appendChild(carouselContainer);

        // Setup carousel navigation
        this.setupCarousel(row);

        // Click title to filter by category (disabled for special pages)
        title.addEventListener('click', () => {
            // Don't filter on special pages (favorites, recent)
            if (category !== 'all' && category !== 'favorites' && category !== 'recent') {
                this.handleCategoryClick(category);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        return row;
    }

    /**
     * Setup carousel navigation with swipe/drag support
     */
    setupCarousel(rowElement) {
        const track = rowElement.querySelector('.carousel-track');
        const prevBtn = rowElement.querySelector('.carousel-prev');
        const nextBtn = rowElement.querySelector('.carousel-next');
        const category = rowElement.dataset.category;

        let scrollPosition = 0;
        const scrollAmount = 850; // Scroll ~4 cards at a time

        // Drag/swipe state
        let isDragging = false;
        let startX = 0;
        let startScrollPosition = 0;
        let hasDragged = false;

        const updateButtons = () => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            prevBtn.disabled = scrollPosition <= 0;
            nextBtn.disabled = scrollPosition >= maxScroll;
        };

        const setScrollPosition = (position, animate = true) => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            scrollPosition = Math.max(0, Math.min(maxScroll, position));

            if (animate) {
                track.style.transition = 'transform 0.3s ease';
            } else {
                track.style.transition = 'none';
            }

            track.style.transform = `translateX(-${scrollPosition}px)`;
            updateButtons();
        };

        // Button navigation
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setScrollPosition(scrollPosition - scrollAmount);

            // Track carousel navigation
            if (window.Analytics) {
                window.Analytics.trackCarouselNavigation(category, 'prev');
            }
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setScrollPosition(scrollPosition + scrollAmount);

            // Track carousel navigation
            if (window.Analytics) {
                window.Analytics.trackCarouselNavigation(category, 'next');
            }
        });

        // Mouse drag support (desktop) - Store handlers for cleanup
        const mouseDownHandler = (e) => {
            // Don't start drag if clicking on a game card or favorite button
            if (e.target.closest('.game-card') || e.target.closest('.game-card-favorite')) {
                return;
            }

            isDragging = true;
            hasDragged = false;
            startX = e.pageX;
            startScrollPosition = scrollPosition;
            track.style.cursor = 'grabbing';
            track.style.userSelect = 'none';
        };

        const mouseMoveHandler = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            const deltaX = startX - e.pageX;

            if (Math.abs(deltaX) > 5) {
                hasDragged = true;
            }

            setScrollPosition(startScrollPosition + deltaX, false);
        };

        const mouseUpHandler = () => {
            if (isDragging) {
                isDragging = false;
                track.style.cursor = 'grab';
                track.style.userSelect = '';

                // Re-enable transition for smooth snap
                track.style.transition = 'transform 0.3s ease';
            }
        };

        track.addEventListener('mousedown', mouseDownHandler);
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);

        // Touch swipe support (mobile) - Store handlers for cleanup
        let touchStartX = 0;
        let touchStartScrollPosition = 0;

        const touchStartHandler = (e) => {
            touchStartX = e.touches[0].pageX;
            touchStartScrollPosition = scrollPosition;
            hasDragged = false;
        };

        const touchMoveHandler = (e) => {
            const deltaX = touchStartX - e.touches[0].pageX;

            if (Math.abs(deltaX) > 5) {
                hasDragged = true;
            }

            setScrollPosition(touchStartScrollPosition + deltaX, false);
        };

        const touchEndHandler = () => {
            // Re-enable transition for smooth snap
            track.style.transition = 'transform 0.3s ease';
        };

        track.addEventListener('touchstart', touchStartHandler, { passive: true });
        track.addEventListener('touchmove', touchMoveHandler, { passive: true });
        track.addEventListener('touchend', touchEndHandler, { passive: true });

        // Prevent click events on game cards when dragging
        const clickHandler = (e) => {
            if (hasDragged) {
                e.stopPropagation();
                e.preventDefault();
                hasDragged = false;
            }
        };

        track.addEventListener('click', clickHandler, true);

        // Update buttons on window resize
        const resizeHandler = () => updateButtons();
        window.addEventListener('resize', resizeHandler);

        // Set initial cursor style
        track.style.cursor = 'grab';

        // Initial button state
        setTimeout(updateButtons, 100);

        // Store cleanup function on the row element for later cleanup
        rowElement._carouselCleanup = () => {
            // Remove all event listeners
            track.removeEventListener('mousedown', mouseDownHandler);
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            track.removeEventListener('touchstart', touchStartHandler);
            track.removeEventListener('touchmove', touchMoveHandler);
            track.removeEventListener('touchend', touchEndHandler);
            track.removeEventListener('click', clickHandler, true);
            window.removeEventListener('resize', resizeHandler);

            if (window.logger) {
                window.logger.debug('[Carousel] Cleanup completed for:', category);
            }
        };
    }

    /**
     * Create game card element (XSS-safe using DOMHelper)
     */
    createGameCard(game) {
        const isFavorite = storageManager.isFavorite(game.id);

        // Use DOMHelper for safe DOM creation (prevents XSS)
        const card = DOMHelper.createGameCard(
            game,
            isFavorite,
            () => this.openGame(game),
            () => this.toggleFavorite(game.id)
        );

        return card;
    }

    /**
     * Open game page (with error handling)
     */
    openGame(game) {
        try {
            // Validate game data
            if (!game) {
                throw new Error('Invalid game data: game is null or undefined');
            }

            if (!game.slug) {
                throw new Error(`Invalid game data: missing slug for game ${game.id || 'unknown'}`);
            }

            if (!game.id) {
                throw new Error(`Invalid game data: missing ID for game ${game.slug}`);
            }

            // Add to recently played
            try {
                storageManager.addRecentlyPlayed(game.id);
            } catch (storageError) {
                // Log but don't block navigation
                if (window.logger) {
                    window.logger.warn('[App] Failed to add to recently played:', storageError);
                }
            }

            // Track game play event
            if (window.Analytics) {
                try {
                    window.Analytics.trackGamePlay(game);
                } catch (analyticsError) {
                    // Log but don't block navigation
                    if (window.logger) {
                        window.logger.warn('[App] Failed to track game play:', analyticsError);
                    }
                }
            }

            // Navigate to the generated game page
            window.location.href = `/catalog/${game.slug}/`;

        } catch (error) {
            // Log error
            if (window.logger) {
                window.logger.error('[App] Error opening game:', error);
            }

            // Track error in analytics
            if (window.Analytics) {
                try {
                    window.Analytics.trackError('game_open_error', error.message, {
                        gameId: game?.id,
                        gameSlug: game?.slug
                    });
                } catch (analyticsError) {
                    // Silent fail
                }
            }

            // Show user-friendly error message
            this.showError('Unable to open game. Please try again.');
        }
    }

    /**
     * Close game modal
     */
    closeGameModal() {
        // Track game close event before clearing current game
        if (this.currentGame && window.Analytics) {
            window.Analytics.trackGameClose(this.currentGame);
        }

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
        const isFavorite = storageManager.isFavorite(gameId);

        // Track favorite action
        if (window.Analytics) {
            const game = gamesManager.getGameById(gameId);
            if (game) {
                window.Analytics.trackGameFavorite(game, isFavorite);
            }
        }

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
        const isEnteringFullscreen = !document.fullscreenElement;

        if (isEnteringFullscreen) {
            modalContent.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }

        // Track fullscreen toggle
        if (this.currentGame && window.Analytics) {
            window.Analytics.trackGameFullscreen(this.currentGame, isEnteringFullscreen);
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

        // Get games count for analytics
        const gamesCount = gamesManager.getTotalCount();

        // Track category filter
        if (window.Analytics) {
            window.Analytics.trackCategoryFilter(category, gamesCount);
        }

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
        // Debounce search using config value
        clearTimeout(this.searchDebounceTimer);

        const debounceDelay = (window.CONFIG && window.CONFIG.SEARCH_DEBOUNCE_MS) || 300;

        this.searchDebounceTimer = setTimeout(() => {
            gamesManager.searchGames(query);

            // Track search if query is not empty
            if (query.trim() && window.Analytics) {
                const resultsCount = gamesManager.getTotalCount();
                window.Analytics.trackSearch(query, resultsCount);
            }

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
        }, debounceDelay);
    }


    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const willBeActive = !this.elements.navbarMenu.classList.contains('active');
        this.elements.navbarMenu.classList.toggle('active');

        // Track mobile menu toggle
        if (window.Analytics) {
            window.Analytics.trackMobileMenu(willBeActive);
        }
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
     * Show error message (XSS-safe)
     */
    showError(message) {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';

            // Clear existing content
            this.elements.emptyState.innerHTML = '';

            // Create SVG safely
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '64');
            svg.setAttribute('height', '64');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '12');
            circle.setAttribute('cy', '12');
            circle.setAttribute('r', '10');

            const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line1.setAttribute('x1', '12');
            line1.setAttribute('y1', '8');
            line1.setAttribute('x2', '12');
            line1.setAttribute('y2', '12');

            const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line2.setAttribute('x1', '12');
            line2.setAttribute('y1', '16');
            line2.setAttribute('x2', '12.01');
            line2.setAttribute('y2', '16');

            svg.appendChild(circle);
            svg.appendChild(line1);
            svg.appendChild(line2);

            // Create error heading
            const heading = document.createElement('h3');
            heading.textContent = 'Error';

            // Create message paragraph (safe from XSS)
            const paragraph = document.createElement('p');
            paragraph.textContent = message; // Safe from XSS

            this.elements.emptyState.appendChild(svg);
            this.elements.emptyState.appendChild(heading);
            this.elements.emptyState.appendChild(paragraph);
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

        // Reset category filter and set filtered games
        gamesManager.currentCategory = 'favorites';
        gamesManager.filteredGames = favoriteGames;
        gamesManager.currentPage = 1;
        gamesManager.searchQuery = '';

        this.elements.sectionTitle.textContent = 'My Favorites';

        // Clear sidebar active state BEFORE displayGames
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });

        this.displayGames();

        // Track favorites page view
        if (window.Analytics) {
            window.Analytics.trackFavoritesView(favoriteGames.length);
        }

        // Update nav active state
        this.updateNavActiveState('favorites');
    }

    handleRecentRoute() {
        this.closeGameModal();

        const recentIds = storageManager.getRecentlyPlayed();
        const recentGames = gamesManager.getGamesByIds(recentIds);

        // Reset category filter and set filtered games
        gamesManager.currentCategory = 'recent';
        gamesManager.filteredGames = recentGames;
        gamesManager.currentPage = 1;
        gamesManager.searchQuery = '';

        this.elements.sectionTitle.textContent = 'Recently Played';

        // Clear sidebar active state BEFORE displayGames
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });

        this.displayGames();

        // Track recent page view
        if (window.Analytics) {
            window.Analytics.trackRecentView(recentGames.length);
        }

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

    /**
     * Cleanup all event listeners and resources
     * Call this method when destroying the app instance
     */
    destroy() {
        // Abort all event listeners
        if (this.abortController) {
            this.abortController.abort();
        }

        // Clear debounce timer
        if (this.searchDebounceTimer) {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = null;
        }

        // Cleanup carousels
        this.cleanupCarousels();

        if (window.logger) {
            window.logger.info('[App] Application destroyed, all event listeners removed');
        }
    }

    /**
     * Reset event listeners (useful for refreshing the app)
     */
    resetEventListeners() {
        // Abort old listeners
        if (this.abortController) {
            this.abortController.abort();
        }

        // Create new AbortController
        this.abortController = new AbortController();

        // Re-setup event listeners
        this.setupEventListeners();

        if (window.logger) {
            window.logger.debug('[App] Event listeners reset');
        }
    }
}

/**
 * Global Error Handlers
 * Catch uncaught errors and unhandled promise rejections
 */
function setupGlobalErrorHandlers() {
    // Catch uncaught JavaScript errors
    window.addEventListener('error', (event) => {
        if (window.logger) {
            window.logger.error('[Global Error]', event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        }

        // Track in analytics
        if (window.Analytics) {
            try {
                window.Analytics.trackError('uncaught_error', event.error?.message || event.message, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack
                });
            } catch (analyticsError) {
                // Silent fail - don't let analytics errors break error handling
            }
        }

        // Don't prevent default error handling
        return false;
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        if (window.logger) {
            window.logger.error('[Unhandled Promise Rejection]', event.reason);
        }

        // Track in analytics
        if (window.Analytics) {
            try {
                window.Analytics.trackError('unhandled_rejection', event.reason?.message || String(event.reason), {
                    promise: event.promise,
                    stack: event.reason?.stack
                });
            } catch (analyticsError) {
                // Silent fail
            }
        }

        // Prevent default console error
        event.preventDefault();
    });

    if (window.logger) {
        window.logger.info('[App] Global error handlers initialized');
    }
}

// Setup global error handlers first
setupGlobalErrorHandlers();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.kloopikApp = new KloopikApp();
    });
} else {
    window.kloopikApp = new KloopikApp();
}
