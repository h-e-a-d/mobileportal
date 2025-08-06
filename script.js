/**
 * SuperGames Portal - Simplified Game Portal
 * Handles game loading, filtering, search, and modal display
 */
class GamePortal {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadGames();
        this.setupEventListeners();
        this.displayGames();
        this.hideLoading();
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 789.95;
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
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
            // Try loading from GameMonetize API
            const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=100&page=1');
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                console.log(`Loaded ${data.length} games from API`);
                this.games = data;
                this.filteredGames = this.games;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // Fallback to mock games
            console.log('Using mock games as fallback');
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
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPlJhY2luZzwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/racing',
                width: '800',
                height: '600'
            },
            {
                id: 2,
                title: 'Puzzle Master Challenge',
                description: 'Test your brain with this challenging puzzle game.',
                category: 'Puzzle',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPlB1enpsZTwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/puzzle',
                width: '800',
                height: '600'
            },
            {
                id: 3,
                title: 'Space Shooter Galaxy',
                description: 'Defend the galaxy from alien invaders in this intense space shooter.',
                category: 'Action',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFjdGlvbjwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/action',
                width: '800',
                height: '600'
            },
            {
                id: 4,
                title: 'Fantasy Adventure Quest',
                description: 'Embark on an epic fantasy journey filled with magic and mystery.',
                category: 'Adventure',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFkdmVudHVyZTwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/adventure',
                width: '800',
                height: '600'
            },
            {
                id: 5,
                title: 'Basketball Pro Arena',
                description: 'Show off your basketball skills in this exciting sports game.',
                category: 'Sports',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPlNwb3J0czwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/sports',
                width: '800',
                height: '600'
            },
            {
                id: 6,
                title: 'War Strategy Empire',
                description: 'Build your empire and conquer the world in this strategic warfare game.',
                category: 'Strategy',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPlN0cmF0ZWd5PC90ZXh0Pgo8L3N2Zz4=',
                url: 'https://games.example.com/strategy',
                width: '800',
                height: '600'
            },
            {
                id: 7,
                title: 'Retro Arcade Blast',
                description: 'Classic arcade fun with a modern twist. Nostalgia meets innovation.',
                category: 'Arcade',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFyY2FkZTwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/arcade',
                width: '800',
                height: '600'
            },
            {
                id: 8,
                title: 'Mystery Detective Case',
                description: 'Solve intricate mysteries and uncover hidden clues in this adventure game.',
                category: 'Adventure',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFkdmVudHVyZTwvdGV4dD4KPC9zdmc+',
                url: 'https://games.example.com/adventure2',
                width: '800',
                height: '600'
            }
        ];
    }

    displayGames() {
        const isMobile = this.isMobile();
        
        console.log('Display games called. Mobile:', isMobile, 'Width:', window.innerWidth);
        console.log('Games available:', this.games.length, 'Filtered games:', this.filteredGames.length);
        
        if (isMobile) {
            this.displayMobileLayout();
        } else {
            this.displayDesktopLayout();
        }
    }

    displayDesktopLayout() {
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

    displayMobileLayout() {
        const mobileSections = document.getElementById('mobileCategorySections');
        const gamesGrid = document.getElementById('gamesGrid');
        
        if (!mobileSections) return;

        // Clear existing content
        mobileSections.innerHTML = '';
        if (gamesGrid) gamesGrid.innerHTML = '';

        if (this.games.length === 0) {
            mobileSections.innerHTML = '<div class="no-games">No games found.</div>';
            return;
        }
        
        console.log('Creating mobile layout with', this.games.length, 'games');

        // Create mobile category sections
        this.createMobileCategorySections();
    }

    createMobileCategorySections() {
        const mobileSections = document.getElementById('mobileCategorySections');
        const categories = ['Action', 'Adventure', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Arcade'];
        
        // Create featured game section
        const featuredGame = this.games[0];
        if (featuredGame) {
            const featuredSection = document.createElement('div');
            featuredSection.className = 'mobile-category-section';
            featuredSection.innerHTML = `
                <div class="mobile-category-header">
                    <h2 class="mobile-category-title">Recommended</h2>
                </div>
                <div class="mobile-featured-game game-card" tabindex="0" role="button" aria-label="Play ${featuredGame.title}">
                    <img src="${featuredGame.thumb}" alt="${featuredGame.title}" class="game-thumb" loading="lazy">
                    <div class="game-info">
                        <h3 class="game-title">${featuredGame.title}</h3>
                    </div>
                </div>
            `;
            
            // Add event listener for featured game
            const featuredCard = featuredSection.querySelector('.mobile-featured-game');
            featuredCard.addEventListener('click', () => this.openGameModal(featuredGame));
            
            mobileSections.appendChild(featuredSection);
        }

        // Create category sections
        categories.forEach(category => {
            const categoryGames = this.games.filter(game => game.category === category);
            if (categoryGames.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mobile-category-section';
            
            const gamesHtml = categoryGames.slice(0, 8).map(game => `
                <div class="game-card" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Play ${game.title}">
                    <img src="${game.thumb}" alt="${game.title}" class="game-thumb" loading="lazy">
                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>
                    </div>
                </div>
            `).join('');

            section.innerHTML = `
                <div class="mobile-category-header">
                    <h2 class="mobile-category-title">${category} Games</h2>
                </div>
                <div class="mobile-games-row">
                    ${gamesHtml}
                </div>
            `;

            // Add event listeners for games in this section
            section.querySelectorAll('.game-card').forEach(card => {
                const gameId = card.dataset.gameId;
                const game = this.games.find(g => g.id == gameId);
                if (game) {
                    card.addEventListener('click', () => this.openGameModal(game));
                }
            });

            mobileSections.appendChild(section);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${game.title}`);
        
        card.addEventListener('click', () => this.openGameModal(game));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openGameModal(game);
            }
        });

        card.innerHTML = `
            <img src="${game.thumb}" alt="Play ${game.title} - ${game.category} game" class="game-thumb" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2ODQyZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiPkdhbWUgSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
            </div>
        `;

        return card;
    }

    openGameModal(game) {
        console.log(`Opening game modal for: ${game.title}`);
        
        const modal = document.getElementById('gameModal');
        const modalTitle = document.getElementById('modalGameTitle');
        const gameFrame = document.getElementById('gameFrame');
        
        if (!modal || !modalTitle || !gameFrame) return;
        
        // Set game details
        modalTitle.textContent = game.title;
        gameFrame.src = game.url;
        
        // Show modal
        modal.classList.add('active');
        
        // Track game play
        this.trackEvent('game_play', {
            game_id: game.id,
            game_title: game.title,
            game_category: game.category
        });
    }

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        const gameFrame = document.getElementById('gameFrame');
        
        if (!modal || !gameFrame) return;
        
        // Hide modal
        modal.classList.remove('active');
        
        // Clear iframe to stop game
        gameFrame.src = '';
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.applyFilters();
        this.updateActiveCategory(category);
    }

    searchGames(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        this.showSearchResults(searchTerm);
    }

    showSearchResults(searchTerm) {
        const searchDropdown = document.getElementById('searchDropdown');
        const searchResults = document.getElementById('searchResults');
        
        if (!searchDropdown || !searchResults) return;
        
        // If search term is empty, hide dropdown
        if (!searchTerm || searchTerm.trim() === '') {
            searchDropdown.classList.remove('active');
            return;
        }
        
        // Filter games based on search term
        const filteredGames = this.games.filter(game =>
            game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (filteredGames.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No games found matching your search.</div>';
        } else {
            // Limit results to first 8 games
            const limitedResults = filteredGames.slice(0, 8);
            
            limitedResults.forEach(game => {
                const resultItem = this.createSearchResultItem(game);
                searchResults.appendChild(resultItem);
            });
        }
        
        // Show dropdown
        searchDropdown.classList.add('active');
    }

    createSearchResultItem(game) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        item.innerHTML = `
            <div class="search-result-icon">
                <img src="${game.thumb}" alt="${game.title}" loading="lazy">
            </div>
            <div class="search-result-info">
                <h4 class="search-result-title">${game.title}</h4>
                <div class="search-result-category">${game.category}</div>
            </div>
        `;
        
        // Add click handler
        item.addEventListener('click', () => {
            this.selectSearchResult(game);
        });
        
        return item;
    }

    selectSearchResult(game) {
        // Close search dropdown
        this.closeSearch();
        
        // Open the selected game
        this.openGameModal(game);
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
                game.category.toLowerCase().includes(this.currentSearchTerm)
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
        // Category filtering (sidebar)
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
                }, 300);
            });
        }

        // Search toggle functionality
        const searchToggle = document.getElementById('searchToggle');
        const searchClose = document.getElementById('searchClose');
        const navSearch = document.getElementById('navSearch');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                this.toggleSearch();
            });
        }
        
        if (searchClose) {
            searchClose.addEventListener('click', () => {
                this.closeSearch();
            });
        }
        
        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (navSearch && navSearch.classList.contains('active')) {
                if (!navSearch.contains(e.target) && !searchToggle.contains(e.target)) {
                    this.closeSearch();
                }
            }
        });

        // Modal event listeners
        const modalClose = document.getElementById('modalClose');
        const gameModal = document.getElementById('gameModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeGameModal();
            });
        }
        
        if (gameModal) {
            gameModal.addEventListener('click', (e) => {
                if (e.target === gameModal) {
                    this.closeGameModal();
                }
            });
        }

        // Sidebar toggle (desktop only)
        if (window.innerWidth > 789.95) {
            const sidebarToggle = document.getElementById('sidebarToggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', () => {
                    this.toggleSidebar();
                });
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const gameModal = document.getElementById('gameModal');
                const navSearch = document.getElementById('navSearch');
                
                if (gameModal && gameModal.classList.contains('active')) {
                    this.closeGameModal();
                } else if (navSearch && navSearch.classList.contains('active')) {
                    this.closeSearch();
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.displayGames();
        }, 100);
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.getElementById('mainContainer');
        
        if (sidebar && mainContainer) {
            sidebar.classList.toggle('collapsed');
            mainContainer.classList.toggle('sidebar-expanded');
        }
    }

    toggleSearch() {
        const navSearch = document.getElementById('navSearch');
        const searchInput = document.getElementById('searchInput');
        
        if (navSearch) {
            const isActive = navSearch.classList.contains('active');
            
            if (isActive) {
                this.closeSearch();
            } else {
                navSearch.classList.add('active');
                setTimeout(() => {
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 150);
            }
        }
    }
    
    closeSearch() {
        const navSearch = document.getElementById('navSearch');
        const searchInput = document.getElementById('searchInput');
        const searchDropdown = document.getElementById('searchDropdown');
        
        if (navSearch) {
            navSearch.classList.remove('active');
            
            if (searchInput) {
                searchInput.value = '';
                this.currentSearchTerm = '';
            }
            
            if (searchDropdown) {
                searchDropdown.classList.remove('active');
            }
        }
    }

    trackEvent(eventName, parameters = {}) {
        // Simple console logging for tracking
        console.log(`Track event: ${eventName}`, parameters);
        
        // You can integrate with analytics services here
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }
}

// Initialize the game portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePortal = new GamePortal();
});