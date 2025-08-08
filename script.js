/**
 * Kloopik Gaming Portal - Simplified Game Portal
 * Handles game loading, filtering, search, and modal display
 */
class GamePortal {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.isLoading = false;
        
        // Pagination properties
        this.currentPage = 1;
        this.gamesPerPage = 100;
        this.hasMoreGames = true;
        this.isLoadingMore = false;
        
        // Display tracking
        this.displayedGamesCount = 0;
        
        // Intersection Observer for footer visibility
        this.footerObserver = null;
        this.isFooterObserverActive = false;
        
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadGames();
        this.setupEventListeners();
        this.setupFooterObserver();
        
        // Check if we should display a game page based on URL hash
        this.handleInitialRoute();
        
        this.displayGames();
        this.hideLoading();
    }
    
    handleInitialRoute() {
        const hash = window.location.hash;
        
        if (hash.startsWith('#/game/')) {
            // Try to get game from sessionStorage
            const storedGame = sessionStorage.getItem('currentGame');
            if (storedGame) {
                try {
                    const game = JSON.parse(storedGame);
                    // Delay displaying game page until after main init
                    setTimeout(() => {
                        this.displayGamePage(game);
                    }, 100);
                } catch (error) {
                    console.error('Error parsing stored game data:', error);
                    // Clear the hash if game data is invalid
                    history.replaceState(null, 'Kloopik', '/');
                }
            } else {
                // No game data available, clear the hash
                history.replaceState(null, 'Kloopik', '/');
            }
        }
    }

    isMobile() {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 789.95;
        const isMobile = isMobileDevice || isSmallScreen;
        
        console.log(`Mobile detection - Device: ${isMobileDevice}, Small screen: ${isSmallScreen}, Final: ${isMobile}, Width: ${window.innerWidth}`);
        return isMobile;
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

    async loadGames(page = 1, append = false) {
        try {
            this.isLoadingMore = append;
            
            // Try loading from GameMonetize API with CORS proxy
            const apiUrl = `https://gamemonetize.com/feed.php?format=0&num=${this.gamesPerPage}&page=${page}`;
            const corsProxy = 'https://api.allorigins.win/get?url=';
            
            let response;
            let data;
            
            try {
                // First try direct API call
                response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                data = await response.json();
            } catch (directError) {
                console.log('Direct API failed, trying CORS proxy...', directError.message);
                
                // Fallback to CORS proxy
                response = await fetch(corsProxy + encodeURIComponent(apiUrl));
                if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
                const proxyData = await response.json();
                data = JSON.parse(proxyData.contents);
            }
            
            if (data && Array.isArray(data)) {
                console.log(`Loaded ${data.length} games from API (page ${page})`);
                
                if (append) {
                    // Filter out duplicate games by ID before appending
                    const existingIds = new Set(this.games.map(game => game.id));
                    const newGames = data.filter(game => !existingIds.has(game.id));
                    console.log(`${data.length} games received, ${newGames.length} new games after deduplication`);
                    
                    if (newGames.length === 0) {
                        // API returned all duplicate games, assume no more new games available
                        console.log('No new games found, disabling further loading');
                        this.hasMoreGames = false;
                        return;
                    }
                    
                    // Append only new games to existing ones
                    this.games = [...this.games, ...newGames];
                } else {
                    // First load
                    this.games = data;
                }
                
                // Check if there are more games available
                // If we received fewer games than requested, there are no more pages
                this.hasMoreGames = data.length === this.gamesPerPage;
                console.log(`Has more games: ${this.hasMoreGames} (received ${data.length}, expected ${this.gamesPerPage})`);
                
                this.filteredGames = this.games;
                
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // On error, disable further loading attempts
            if (!append) {
                console.log('Failed to load games from API');
                this.games = [];
                this.filteredGames = [];
            }
            this.hasMoreGames = false;
        } finally {
            this.isLoadingMore = false;
        }
    }







    async loadMoreGames() {
        if (!this.hasMoreGames || this.isLoadingMore) {
            console.log('Cannot load more games:', { hasMoreGames: this.hasMoreGames, isLoadingMore: this.isLoadingMore });
            return;
        }

        console.log('Loading more games... Current page:', this.currentPage);
        
        // Temporarily disable footer observer to prevent multiple triggers
        this.isFooterObserverActive = false;
        this.isLoadingMore = true;
        this.currentPage++;
        
        // Show loading indicator
        this.showLoadingIndicator();
        
        try {
            await this.loadGames(this.currentPage, true);
            this.applyFilters(false); // Re-apply current filters to include new games, don't reset display count
            this.displayGames(true); // Pass true to append new games
            
            console.log(`Successfully loaded page ${this.currentPage}. Total games: ${this.games.length}, Filtered: ${this.filteredGames.length}, Displayed: ${this.displayedGamesCount}`);
        } catch (error) {
            console.error('Error loading more games:', error);
            // Revert page increment on error
            this.currentPage--;
        } finally {
            this.hideLoadingIndicator();
            this.isLoadingMore = false;
            
            // Reactivate footer observer after a short delay
            setTimeout(() => {
                this.isFooterObserverActive = true;
                console.log('Footer observer reactivated');
            }, 1000);
        }
    }

    showLoadingIndicator() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        // Add loading indicator at the bottom of the grid
        const existingIndicator = document.getElementById('loadingIndicator');
        if (!existingIndicator) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="spinner"></div>
                <span>Loading more games...</span>
            `;
            loadingIndicator.style.cssText = `
                grid-column: 1 / -1;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
                color: var(--white-400);
                gap: 1rem;
            `;
            gamesGrid.appendChild(loadingIndicator);
        }
    }

    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    setupFooterObserver() {
        // Only set up observer on desktop, mobile uses button-based loading
        if (this.isMobile()) {
            console.log('Mobile detected, skipping footer observer setup');
            return;
        }

        const footer = document.getElementById('footer');
        if (!footer) {
            console.error('Footer element not found');
            return;
        }

        // Create intersection observer to watch footer visibility
        this.footerObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && this.isFooterObserverActive) {
                        console.log('Footer is visible, loading more games...');
                        this.onFooterVisible();
                    }
                });
            },
            {
                root: null, // Use viewport as root
                rootMargin: '100px', // Trigger 100px before footer is visible
                threshold: 0.1 // Trigger when 10% of footer is visible
            }
        );

        this.footerObserver.observe(footer);
        
        // Activate observer after initial load to prevent immediate triggering
        setTimeout(() => {
            this.isFooterObserverActive = true;
            console.log('Footer observer activated');
        }, 2000);
    }

    onFooterVisible() {
        // Prevent multiple simultaneous loads
        if (this.isLoadingMore || !this.hasMoreGames) {
            console.log('Loading already in progress or no more games available');
            return;
        }

        // Don't load more games if a game page is currently displayed
        const gamePageContainer = document.getElementById('gamePageContainer');
        if (gamePageContainer && gamePageContainer.style.display !== 'none') {
            console.log('Game page is open, skipping load');
            return;
        }

        // Check if we need to load more games from API
        if (this.displayedGamesCount >= this.filteredGames.length) {
            console.log('All filtered games displayed, loading more from API...');
            this.loadMoreGames();
        } else {
            console.log('More filtered games available to display without API call');
        }
    }

    displayGames(append = false) {
        const isMobile = this.isMobile();
        
        console.log('Display games called. Mobile:', isMobile, 'Width:', window.innerWidth, 'Append:', append);
        console.log('Games available:', this.games.length, 'Filtered games:', this.filteredGames.length);
        
        if (isMobile) {
            this.displayMobileLayout(append);
        } else {
            this.displayDesktopLayout(append);
        }
    }

    displayDesktopLayout(append = false) {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;

        if (!append) {
            // Clear existing content only if not appending
            gamesGrid.innerHTML = '';
            // Reset displayed games count
            this.displayedGamesCount = 0;
        } else {
            // Remove loading indicator if it exists
            this.hideLoadingIndicator();
            // Remove mobile load more section if it exists
            const mobileLoadMore = document.getElementById('mobileLoadMoreGridSection');
            if (mobileLoadMore) {
                mobileLoadMore.remove();
            }
        }

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = '<div class="no-games">No games found matching your criteria.</div>';
            return;
        }

        if (append) {
            // When appending, only show new games
            const gamesToShow = this.filteredGames.slice(this.displayedGamesCount);
            console.log(`Appending ${gamesToShow.length} new games (displayed: ${this.displayedGamesCount}, total: ${this.filteredGames.length})`);
            
            gamesToShow.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                gamesGrid.appendChild(gameCard);
            });
            
            this.displayedGamesCount = this.filteredGames.length;
        } else {
            // Full reload - display all games
            console.log(`Displaying all ${this.filteredGames.length} games`);
            this.filteredGames.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                gamesGrid.appendChild(gameCard);
            });
            this.displayedGamesCount = this.filteredGames.length;
        }
    }

    displayMobileLayout(append = false) {
        const mobileSections = document.getElementById('mobileCategorySections');
        const gamesGrid = document.getElementById('gamesGrid');
        
        // Hide mobile sections and use the regular games grid
        if (mobileSections) {
            mobileSections.style.display = 'none';
        }
        
        if (!gamesGrid) return;

        if (!append) {
            // Clear existing content only if not appending
            gamesGrid.innerHTML = '';
        } else {
            // Remove mobile load more section if it exists
            const mobileLoadMore = document.getElementById('mobileLoadMoreGridSection');
            if (mobileLoadMore) {
                mobileLoadMore.remove();
            }
        }

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = '<div class="no-games">No games found matching your criteria.</div>';
            return;
        }
        
        console.log('Creating mobile layout with', this.filteredGames.length, 'games, append:', append);

        // Create simple uncategorized game grid
        this.createMobileUncategorizedGrid(append);
        
        // Add load more section at the bottom
        if (this.hasMoreGames) {
            this.createMobileLoadMoreGrid();
        }
    }

    createMobileUncategorizedGrid(append = false) {
        const gamesGrid = document.getElementById('gamesGrid');
        
        if (append) {
            // When appending, only show new games
            const gamesToShow = this.filteredGames.slice(this.displayedGamesCount);
            console.log(`Mobile: Appending ${gamesToShow.length} new games (displayed: ${this.displayedGamesCount}, total: ${this.filteredGames.length})`);
            
            gamesToShow.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                gamesGrid.appendChild(gameCard);
            });
            
            this.displayedGamesCount = this.filteredGames.length;
        } else {
            // Full reload - display all games
            console.log(`Mobile: Displaying all ${this.filteredGames.length} games`);
            this.filteredGames.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                gamesGrid.appendChild(gameCard);
            });
            this.displayedGamesCount = this.filteredGames.length;
        }
    }

    createMobileLoadMoreGrid() {
        const gamesGrid = document.getElementById('gamesGrid');
        
        const loadMoreSection = document.createElement('div');
        loadMoreSection.className = 'mobile-load-more-grid-section';
        loadMoreSection.id = 'mobileLoadMoreGridSection';
        loadMoreSection.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: var(--spacing-6);
            background: var(--black-300);
            border-radius: var(--border-radius-lg);
            margin: var(--spacing-4) 0;
        `;
        
        const totalGamesText = this.hasMoreGames ? `${this.games.length}+ games` : `${this.games.length} games`;
        const buttonText = 'Load More Games';
        
        loadMoreSection.innerHTML = `
            <h3 style="color: var(--brand-100); margin-bottom: var(--spacing-3);">More Games Available</h3>
            <p style="color: var(--white-400); margin-bottom: var(--spacing-4);">${totalGamesText} loaded • Load more to discover hundreds of games!</p>
            <button class="mobile-load-more-btn" id="mobileLoadMoreGridBtn">${buttonText}</button>
        `;
        
        // Add event listener for load more button
        const loadMoreBtn = loadMoreSection.querySelector('#mobileLoadMoreGridBtn');
        loadMoreBtn.addEventListener('click', async () => {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
            
            try {
                await this.loadMoreGames();
                // The displayGames(true) in loadMoreGames will handle the append
            } catch (error) {
                console.error('Error loading more games:', error);
                loadMoreBtn.textContent = 'Try Again';
                loadMoreBtn.disabled = false;
            }
        });
        
        gamesGrid.appendChild(loadMoreSection);
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
            console.log(`Adding mobile click listener for featured game: ${featuredGame.title} (ID: ${featuredGame.id})`);
            featuredCard.addEventListener('click', () => this.openGamePage(featuredGame));
            
            // Add keyboard support
            featuredCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openGamePage(featuredGame);
                }
            });
            
            mobileSections.appendChild(featuredSection);
        }

        // Create category sections
        categories.forEach(category => {
            const categoryGames = this.games.filter(game => game.category === category);
            if (categoryGames.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mobile-category-section';
            
            // Show more games per category based on total available games
            // Start with 8, but show more as we load more pages
            const gamesPerCategory = Math.min(
                Math.max(8, Math.floor(this.games.length / categories.length * 0.2)), 
                categoryGames.length
            );
            
            console.log(`Category: ${category}, Available: ${categoryGames.length}, Showing: ${gamesPerCategory}, Total games: ${this.games.length}`);
            
            const gamesHtml = categoryGames.slice(0, gamesPerCategory).map(game => `
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
                    <span class="mobile-games-count">${gamesPerCategory} of ${categoryGames.length}</span>
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
                    console.log(`Adding mobile click listener for ${category} game: ${game.title} (ID: ${game.id})`);
                    card.addEventListener('click', () => this.openGamePage(game));
                    
                    // Add keyboard support for mobile accessibility
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.openGamePage(game);
                        }
                    });
                } else {
                    console.warn(`No game found for ID: ${gameId} in category: ${category}`);
                }
            });

            mobileSections.appendChild(section);
        });
        
        // Add "Load More Games" section for mobile if there are more games to load
        if (this.hasMoreGames) {
            this.createMobileLoadMoreSection();
        }
    }

    createMobileLoadMoreSection() {
        const mobileSections = document.getElementById('mobileCategorySections');
        
        const loadMoreSection = document.createElement('div');
        loadMoreSection.className = 'mobile-category-section mobile-load-more-section';
        loadMoreSection.id = 'mobileLoadMoreSection';
        
        const totalGamesText = this.hasMoreGames ? `${this.games.length}+ games` : `${this.games.length} games`;
        const buttonText = this.currentPage === 1 ? 'Load More Games' : `Load More (Page ${this.currentPage + 1})`;
        
        loadMoreSection.innerHTML = `
            <div class="mobile-category-header">
                <h2 class="mobile-category-title">More Games Available</h2>
                <span class="mobile-games-count">${totalGamesText} loaded</span>
            </div>
            <div class="mobile-load-more-container">
                <p>Discover hundreds more games across all categories!</p>
                <button class="mobile-load-more-btn" id="mobileLoadMoreBtn">${buttonText}</button>
            </div>
        `;
        
        // Add event listener for load more button
        const loadMoreBtn = loadMoreSection.querySelector('#mobileLoadMoreBtn');
        loadMoreBtn.addEventListener('click', async () => {
            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';
            
            try {
                await this.loadMoreGames();
                // Update mobile layout with new games
                this.displayMobileLayout();
            } catch (error) {
                console.error('Error loading more games:', error);
                loadMoreBtn.textContent = 'Try Again';
                loadMoreBtn.disabled = false;
            }
        });
        
        mobileSections.appendChild(loadMoreSection);
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${game.title}`);
        
        card.addEventListener('click', () => this.openGamePage(game));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openGamePage(game);
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

    async openGamePage(game) {
        console.log(`Opening game page for: ${game.title}`);
        
        // Store game data in sessionStorage for the game page
        sessionStorage.setItem('currentGame', JSON.stringify(game));
        
        // Generate a URL-friendly slug from the game title
        const gameSlug = this.generateGameSlug(game.title);
        const gamePageUrl = `#/game/${game.id}/${gameSlug}`;
        
        // Use browser history API to simulate server-side routing
        history.pushState({ game: game }, `Play ${game.title}`, gamePageUrl);
        
        // Generate and display the game page
        this.displayGamePage(game);
        
        // Track game play
        this.trackEvent('game_play', {
            game_id: game.id,
            game_title: game.title,
            game_category: game.category
        });
    }

    displayGamePage(game) {
        // Hide the main game portal content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }
        
        // Create or get the game page container
        let gamePageContainer = document.getElementById('gamePageContainer');
        if (!gamePageContainer) {
            gamePageContainer = document.createElement('div');
            gamePageContainer.id = 'gamePageContainer';
            gamePageContainer.className = 'game-page';
            document.body.appendChild(gamePageContainer);
        }
        
        // Generate the game page content
        gamePageContainer.innerHTML = this.createGamePageContent(game);
        gamePageContainer.style.display = 'block';
        
        // Update page title
        document.title = `Play ${game.title} - Kloopik`;
        
        // Add event listeners for game page
        this.setupGamePageEventListeners();
        
        console.log(`Game page displayed for: ${game.title}`);
    }
    
    hideGamePage() {
        // Show the main game portal content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.style.display = 'flex';
        }
        
        // Hide the game page container
        const gamePageContainer = document.getElementById('gamePageContainer');
        if (gamePageContainer) {
            gamePageContainer.style.display = 'none';
        }
        
        // Reset page title
        document.title = 'Kloopik - Play Free Online Games | Best Gaming Portal 2024';
    }


    generateGameSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }


    createGamePageContent(game) {
        return `
            <div class="game-container">
                <header class="game-header">
                    <h1 class="game-page-title">${game.title}</h1>
                    <div class="game-meta">
                        <span class="game-category">${game.category}</span>
                    </div>
                    <p class="game-description">${game.description}</p>
                </header>

                <div class="game-frame-container">
                    <iframe class="game-frame" 
                            src="${game.url}" 
                            title="Play ${game.title}"
                            allowfullscreen>
                    </iframe>
                </div>

                <div class="game-controls">
                    <button class="btn-back" id="gameBackBtn">← Back to Games</button>
                    <button class="fullscreen-btn" id="gameFullscreenBtn">Fullscreen</button>
                </div>
            </div>
        `;
    }

    setupGamePageEventListeners() {
        // Back button
        const backBtn = document.getElementById('gameBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateBack();
            });
        }
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('gameFullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleGameFullscreen();
            });
        }
    }
    
    navigateBack() {
        // Use history API to go back
        if (history.state && history.state.game) {
            history.back();
        } else {
            // Fallback: manually navigate to home
            history.pushState(null, 'Kloopik', '/');
            this.hideGamePage();
        }
    }
    
    toggleGameFullscreen() {
        const frame = document.querySelector('.game-frame');
        if (!frame) return;
        
        if (frame.requestFullscreen) {
            frame.requestFullscreen();
        } else if (frame.webkitRequestFullscreen) {
            frame.webkitRequestFullscreen();
        } else if (frame.msRequestFullscreen) {
            frame.msRequestFullscreen();
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        // Reset pagination when changing filters
        this.currentPage = 1;
        this.hasMoreGames = true;
        this.displayedGamesCount = 0;
        
        // Temporarily disable footer observer during filtering
        this.isFooterObserverActive = false;
        
        this.applyFilters();
        this.updateActiveCategory(category);
        this.displayGames(false); // Full reload
        
        // Reactivate footer observer after filtering
        setTimeout(() => {
            this.isFooterObserverActive = true;
        }, 1000);
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
        this.openGamePage(game);
    }

    applyFilters(resetDisplayCount = true) {
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
        
        // Only reset displayed count when explicitly requested (i.e., when filters actually change)
        if (resetDisplayCount) {
            this.displayedGamesCount = 0;
        }
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
                const navSearch = document.getElementById('navSearch');
                
                if (navSearch && navSearch.classList.contains('active')) {
                    this.closeSearch();
                }
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle browser navigation (back/forward buttons)
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });

        // Footer category links
        document.querySelectorAll('.footer-links a[data-category]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
                
                // Scroll to top to show filtered games
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.displayGames();
        }, 100);
    }

    handlePopState(e) {
        // Handle browser back/forward navigation
        const hash = window.location.hash;
        
        if (hash.startsWith('#/game/')) {
            // User navigated to a game page
            const gameData = e.state?.game;
            if (gameData) {
                this.displayGamePage(gameData);
            } else {
                // Try to get game from sessionStorage
                const storedGame = sessionStorage.getItem('currentGame');
                if (storedGame) {
                    try {
                        const game = JSON.parse(storedGame);
                        this.displayGamePage(game);
                    } catch (error) {
                        console.error('Error parsing stored game data:', error);
                        this.hideGamePage();
                    }
                } else {
                    // No game data available, go back to home
                    this.hideGamePage();
                }
            }
        } else {
            // User navigated back to home
            this.hideGamePage();
        }
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