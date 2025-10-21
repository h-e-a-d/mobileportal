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

            // Create icon div (XSS-safe)
            const iconDiv = document.createElement('div');
            iconDiv.className = 'sidebar-item-icon';
            iconDiv.textContent = icon; // Safe from XSS

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
            'all': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'action': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H9.5L4 7.5V17L9.5 22H14.5L20 17V7.5L14.5 2Z"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
            'puzzle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h4"/></svg>',
            'racing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-4-5H9l-4 5v3z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg>',
            'sports': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M2 12h20"/></svg>',
            'adventure': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 12 12 22 22 12 12 2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
            'arcade': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="10" cy="10" r="2"/><circle cx="14" cy="14" r="2"/></svg>',
            'strategy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3v18M6 6l12 12M6 18L18 6"/></svg>',
            'shooting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
            'shooter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
            'rpg': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><polyline points="12 22 12 12"/><polyline points="2 7 12 12 22 7"/></svg>',
            'simulation': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
            'music': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
            'kids': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>',
            'girls': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'boys': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
            'car': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-4-5H9l-4 5v3z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg>',
            'driving': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
            'multiplayer': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'io': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
            '3d': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
            'cooking': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z"/><path d="M6 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"/><path d="M15 11V9a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2"/></svg>',
            'dress-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v4l8 4 8-4V6l-8-4z"/><path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>',
            'fashion': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v4l8 4 8-4V6l-8-4z"/><path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>',
            'make-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M8 15c1 1 4 1 8 0"/></svg>',
            'decoration': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'physics': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8M9 9l6 6M15 9l-6 6"/></svg>',
            'platform': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="2"/><rect x="7" y="6" width="10" height="2"/><rect x="5" y="14" width="14" height="2"/></svg>',
            'horror': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M9 16s1-2 3-2 3 2 3 2"/></svg>',
            'zombie': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/><path d="M12 13v8M8 17l4-2M16 17l-4-2"/></svg>',
            'fighting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
            'puzzle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><circle cx="10" cy="6.5" r="1.5"/><circle cx="17.5" cy="10" r="1.5"/></svg>',
            'brain': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a9 9 0 0 0-9 9v4a9 9 0 0 0 18 0v-4a9 9 0 0 0-9-9z"/><path d="M12 2v20M8 6c-2 2-2 6 0 8M16 6c2 2 2 6 0 8"/></svg>',
            'skill': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'hidden-object': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
            'matching': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'merge': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M7 7l5-5 5 5M7 17l5 5 5-5"/></svg>',
            'clicker': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
            'idle': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            'snake': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7-7 7 7"/></svg>',
            'stickman': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="12" y1="14" x2="8" y2="20"/><line x1="12" y1="14" x2="16" y2="20"/><line x1="12" y1="10" x2="8" y2="14"/><line x1="12" y1="10" x2="16" y2="14"/></svg>',
            'running': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="5" r="3"/><path d="M10 9l-2 5 4 2 3-3M18 15l-3-3M10 19l-2-4"/></svg>',
            'parkour': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="5" r="3"/><path d="M10 9l-2 5 4 2 3-3M18 15l-3-3M10 19l-2-4"/></svg>',
            'classic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="10" cy="10" r="2"/><circle cx="14" cy="14" r="2"/></svg>',
            'mini': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
            'mobile': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',
            'two-player': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'logic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><polyline points="12 22 12 12M2 7 12 12 22 7"/></svg>',
            'escape': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>',
            'maze': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3V3zM3 9h6M15 9h6M9 3v6M9 15v6M15 9v6"/></svg>',
            'tower-defense': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="10" width="8" height="12"/><rect x="6" y="6" width="12" height="4"/><path d="M10 2h4v4h-4z"/></svg>',
            'strategy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M12 3v18M6 6l12 12M6 18L18 6"/></svg>',
            'management': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'ball': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20M2 12h20"/></svg>',
            'hunting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
            'gun': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h13l5-5v10l-5-5H3z"/></svg>',
            'sniper': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
            'first-person-shooter': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M4 12h4M16 12h4"/></svg>',
            'battle-royale': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H9.5L4 7.5V17L9.5 22H14.5L20 17V7.5L14.5 2Z"/><path d="M12 8v8M8 12h8"/></svg>',
            'tanks': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="10" width="20" height="6" rx="1"/><path d="M12 10V6h6v4M6 16h12"/></svg>',
            'popular': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'funny': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
            'drawing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>',
            'color': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M6 6l12 12M18 6L6 18"/></svg>',
            'animals': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 14c-3.5 0-6 2-6 4v2h12v-2c0-2-2.5-4-6-4z"/></svg>',
            'love': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'princess-dress-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 6v4l8 4 8-4V6l-8-4z"/><path d="M4 10v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/></svg>',
            'make-over': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M8 15c1 1 4 1 8 0"/></svg>',
            'drifting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-4-5H9l-4 5v3z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/><path d="M3 10c2-4 6-4 8 0"/></svg>',
            'motorbike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18h12M14 10l-2 8M12 10h6l2 8"/></svg>',
            'bike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18h12M14 10l-2 8M12 10h6l2 8"/></svg>',
            'dirt-bike': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 18h12M14 10l-2 8M12 10h6l2 8"/></svg>',
            'car-racing': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17h14v-3l-4-5H9l-4 5v3z"/><circle cx="8" cy="17" r="2"/><circle cx="16" cy="17" r="2"/></svg>',
            'police': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'train': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
            'educational': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
            'story': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
            'point-and-click': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>',
            'mouse': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>',
            'number': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
            'halloween': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 10l1.5-1.5L8 7M16 10l-1.5-1.5L16 7M8 14c1 1 2 2 4 2s3-1 4-2"/></svg>',
            'monster': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M8 14h8"/></svg>',
            'scary': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M9 16s1-2 3-2 3 2 3 2"/></svg>',
            'survival': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H9.5L4 7.5V17L9.5 22H14.5L20 17V7.5L14.5 2Z"/><circle cx="12" cy="12" r="3"/></svg>',
            'pixel-art': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            'obby': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="2"/><rect x="7" y="6" width="10" height="2"/><rect x="5" y="14" width="14" height="2"/></svg>',
            'co-op': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            'chess': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 4h-4l2-4z"/><rect x="8" y="6" width="8" height="12"/><line x1="6" y1="18" x2="18" y2="18"/></svg>',
            'board': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
            'pve': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H9.5L4 7.5V17L9.5 22H14.5L20 17V7.5L14.5 2Z"/><path d="M12 8v8M8 12h8"/></svg>',
            'pvp': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H9.5L4 7.5V17L9.5 22H14.5L20 17V7.5L14.5 2Z"/><path d="M12 8v8M8 12h8"/></svg>',
            'robot': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="8" width="12" height="12" rx="2"/><path d="M12 2v6M9 11h.01M15 11h.01M10 16h4"/></svg>',
            'army': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'intelligence': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a9 9 0 0 0-9 9v4a9 9 0 0 0 18 0v-4a9 9 0 0 0-9-9z"/><path d="M12 2v20M8 6c-2 2-2 6 0 8M16 6c2 2 2 6 0 8"/></svg>',
            'unity': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
            'crafting': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9M14 17H5M17 3L8 12l4 4L21 7l-4-4z"/></svg>',
            'restaurant': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z"/><path d="M6 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5M15 11V9a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v2"/></svg>',
            'papas': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z"/><path d="M6 11V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v5"/></svg>',
            'ragdoll': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><path d="M12 8v8M8 12h8M8 20l4-4 4 4"/></svg>',
            'cozy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
            'cool-games': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            'crazy-games': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9l1.5-1.5L9 6M15 9l-1.5-1.5L15 6"/></svg>'
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

        const categoryName = category === 'all' ? 'All Games' : this.formatCategoryName(category);

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

        // Click title to filter by category
        title.addEventListener('click', () => {
            if (category !== 'all') {
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
        // Debounce search
        clearTimeout(this.searchDebounceTimer);

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
        }, 300);
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

        // Manually set filtered games
        gamesManager.filteredGames = favoriteGames;
        gamesManager.currentPage = 1;

        this.elements.sectionTitle.textContent = 'My Favorites';
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

        // Manually set filtered games
        gamesManager.filteredGames = recentGames;
        gamesManager.currentPage = 1;

        this.elements.sectionTitle.textContent = 'Recently Played';
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
