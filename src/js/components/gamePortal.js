/**
 * Game Portal - Main application class
 * Handles the homepage game listing and navigation
 */
class GamePortal {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.isLoading = false;
        this.sidebarExpanded = true;
        
        this.init();
    }

    async init() {
        this.showLoading();
        this.initializeSidebar();
        await this.loadGames();
        this.setupEventListeners();
        this.displayGames();
        this.hideLoading();
    }

    initializeSidebar() {
        // Initialize sidebar state from localStorage
        const savedState = localStorage.getItem('sidebar_expanded');
        if (savedState !== null) {
            this.sidebarExpanded = savedState === 'true';
        }
        
        // Apply initial state (only on desktop)
        if (window.innerWidth > 789.95) {
            const sidebar = document.getElementById('sidebar');
            const mainContainer = document.getElementById('mainContainer');
            const sidebarToggle = document.getElementById('sidebarToggle');
            
            if (!this.sidebarExpanded) {
                sidebar.classList.add('collapsed');
                mainContainer.classList.remove('sidebar-expanded');
                mainContainer.classList.add('sidebar-collapsed');
                if (sidebarToggle) {
                    sidebarToggle.style.transform = 'rotate(180deg)';
                }
            }
        }
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
        }
        this.isLoading = true;
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        this.isLoading = false;
    }

    async loadGames() {
        try {
            // Try to load from API first
            const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=100&page=1');
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                this.games = data;
                this.filteredGames = data;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games from API:', error);
            
            // Fallback to local generated games
            try {
                await this.loadLocalGames();
            } catch (fallbackError) {
                console.error('Error loading local games:', fallbackError);
                this.showError('Failed to load games. Please try again later.');
            }
        }
    }

    async loadLocalGames() {
        // Load games from locally generated pages
        const locales = ['en', 'de']; // Add more locales as needed
        const games = [];
        
        for (const locale of locales) {
            try {
                const response = await fetch(`games/${locale}/games-list.json`);
                if (response.ok) {
                    const localeGames = await response.json();
                    games.push(...localeGames);
                }
            } catch (error) {
                console.warn(`Could not load games for locale ${locale}:`, error);
            }
        }
        
        if (games.length > 0) {
            this.games = games;
            this.filteredGames = games;
        } else {
            // Use mock data as final fallback
            this.games = this.getMockGames();
            this.filteredGames = this.games;
        }
    }

    getMockGames() {
        return [
            {
                id: 1,
                title: 'Super Racing Adventure',
                description: 'Experience the thrill of high-speed racing in this action-packed adventure game.',
                category: 'Racing',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZjZiMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UmFjaW5nPC90ZXh0Pgo8L3N2Zz4=',
                url: 'games/en/super-racing-adventure-en.html',
                width: '800',
                height: '600',
                slug: 'super-racing-adventure'
            },
            {
                id: 2,
                title: 'Puzzle Master Challenge',
                description: 'Test your brain with this challenging puzzle game.',
                category: 'Puzzle',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZjZiMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UHV6emxlPC90ZXh0Pgo8L3N2Zz4=',
                url: 'games/en/puzzle-master-challenge-en.html',
                width: '800',
                height: '600',
                slug: 'puzzle-master-challenge'
            },
            {
                id: 3,
                title: 'Space Shooter Galaxy',
                description: 'Defend the galaxy from alien invaders in this intense space shooter.',
                category: 'Action',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZjZiMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+QWN0aW9uPC90ZXh0Pgo8L3N2Zz4=',
                url: 'games/en/space-shooter-galaxy-en.html',
                width: '800',
                height: '600',
                slug: 'space-shooter-galaxy'
            }
        ];
    }

    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    displayGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        gamesGrid.innerHTML = '';

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = '<div class="no-games">No games found matching your criteria.</div>';
            return;
        }

        this.filteredGames.forEach(game => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${game.title}`);
        
        // Use direct navigation to game page instead of modal
        card.addEventListener('click', () => this.navigateToGame(game));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.navigateToGame(game);
            }
        });

        // Add random game labels for demo
        const labels = this.getGameLabels(game);
        const labelsHtml = labels.length > 0 ? `
            <div class="game-labels">
                ${labels.map(label => `<span class="game-label ${label.type}">${label.text}</span>`).join('')}
            </div>
        ` : '';

        card.innerHTML = `
            <img src="${game.thumb}" alt="${game.title}" class="game-thumb" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc4IiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE3OCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzgiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9Ijg5IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBJbWFnZTwvdGV4dD4KPC9zdmc+'">
            ${labelsHtml}
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-category">${game.category}</div>
            </div>
        `;

        return card;
    }

    getGameLabels(game) {
        const labels = [];
        const random = Math.random();
        
        // Add random labels for demo purposes
        if (random < 0.3) {
            labels.push({ type: 'hot', text: 'HOT' });
        } else if (random < 0.5) {
            labels.push({ type: 'new', text: 'NEW' });
        } else if (random < 0.6) {
            labels.push({ type: 'top', text: 'TOP' });
        }
        
        return labels;
    }

    navigateToGame(game) {
        // Navigate to the game's dedicated page
        const locale = this.getCurrentLocale();
        
        // Always use our local HTML pages, not the external game URLs
        let gameUrl;
        if (game.slug) {
            gameUrl = `games/${locale}/${game.slug}-${locale}.html`;
        } else {
            // Generate slug from title if not provided
            const slug = game.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            gameUrl = `games/${locale}/${slug}-${locale}.html`;
        }
        
        // Track game click
        this.trackEvent('game_click', {
            game_title: game.title,
            game_category: game.category,
            game_id: game.id
        });
        
        window.location.href = gameUrl;
    }

    getCurrentLocale() {
        // Get locale from URL, localStorage, or default to 'en'
        const urlParams = new URLSearchParams(window.location.search);
        const urlLocale = urlParams.get('locale');
        const savedLocale = localStorage.getItem('preferred_locale');
        
        return urlLocale || savedLocale || 'en';
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.applyFilters();
        this.updateActiveCategory(category);
        
        // Track category filter
        this.trackEvent('category_filter', {
            category: category
        });
    }

    searchGames(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.applyFilters();
        
        // Track search
        if (searchTerm) {
            this.trackEvent('search', {
                search_term: searchTerm
            });
        }
    }

    applyFilters() {
        let filteredGames = this.games;

        // Apply category filter
        if (this.currentCategory !== 'all') {
            filteredGames = filteredGames.filter(game => 
                game.category.toLowerCase() === this.currentCategory.toLowerCase()
            );
        }

        // Apply search filter
        if (this.currentSearchTerm) {
            filteredGames = filteredGames.filter(game =>
                game.title.toLowerCase().includes(this.currentSearchTerm) ||
                game.description.toLowerCase().includes(this.currentSearchTerm) ||
                game.category.toLowerCase().includes(this.currentSearchTerm) ||
                (game.tags && game.tags.toLowerCase().includes(this.currentSearchTerm))
            );
        }

        this.filteredGames = filteredGames;
        this.displayGames();
    }

    updateActiveCategory(category) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === category) {
                item.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        // Category filtering
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchGames(e.target.value);
                }, 300); // Debounce search
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.getElementById('mainContainer');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        this.sidebarExpanded = !this.sidebarExpanded;
        
        if (this.sidebarExpanded) {
            sidebar.classList.remove('collapsed');
            mainContainer.classList.add('sidebar-expanded');
            mainContainer.classList.remove('sidebar-collapsed');
            sidebarToggle.style.transform = 'rotate(0deg)';
        } else {
            sidebar.classList.add('collapsed');
            mainContainer.classList.remove('sidebar-expanded');
            mainContainer.classList.add('sidebar-collapsed');
            sidebarToggle.style.transform = 'rotate(180deg)';
        }
        
        // Save preference
        localStorage.setItem('sidebar_expanded', this.sidebarExpanded);
        
        // Track toggle
        this.trackEvent('sidebar_toggle', {
            expanded: this.sidebarExpanded
        });
    }

    trackEvent(eventName, parameters = {}) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                page_location: window.location.href,
                page_title: document.title,
                ...parameters
            });
        }

        // Custom tracking
        console.log(`Track event: ${eventName}`, parameters);
    }
}

// Initialize the game portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePortal = new GamePortal();
});