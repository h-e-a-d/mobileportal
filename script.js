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
        
        // Progressive loading properties
        this.currentPage = 1;
        this.gamesPerPage = 20; // Reduced for faster initial load
        this.hasMoreGames = true;
        this.isLoadingMore = false;
        
        // Display tracking
        this.displayedGamesCount = 0;
        
        // Intersection Observer for footer visibility
        this.footerObserver = null;
        this.isFooterObserverActive = false;
        
        // Caching system
        this.cacheKey = 'kloopik_games_cache';
        this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
        this.recentGamesKey = 'kloopik_recent_games';
        this.maxRecentGames = 20;
        
        // API configuration with multiple fallbacks
        this.apiEndpoints = [
            { url: 'https://gamemonetize.com/feed.php', type: 'direct' },
            { url: 'https://api.allorigins.win/get', type: 'allorigins' },
            { url: 'https://corsproxy.io/', type: 'corsproxy' },
            { url: 'https://cors.eu.org/', type: 'corseuorg' }
        ];
        this.currentApiIndex = 0;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        
        this.init();
    }

    async init() {
        this.showSkeletonLoading();
        this.setupEventListeners();
        
        try {
            await this.loadGames();
            this.setupFooterObserver();
            
            // Check if we should display a game page based on URL hash
            this.handleInitialRoute();
            
            this.displayGames();
        } catch (error) {
            console.error('Failed to initialize:', error);
        } finally {
            this.hideSkeletonLoading();
        }
    }
    
    showSkeletonLoading() {
        const gamesGrid = document.getElementById('gamesGrid');
        const loading = document.getElementById('loading');
        
        if (loading) loading.style.display = 'none';
        
        if (gamesGrid) {
            gamesGrid.innerHTML = this.createSkeletonGrid();
        }
    }
    
    hideSkeletonLoading() {
        // Skeleton will be replaced by actual games, no need to hide explicitly
    }
    
    createSkeletonGrid() {
        const skeletonCount = this.getSkeletonCount();
        let skeletons = '';
        
        for (let i = 0; i < skeletonCount; i++) {
            skeletons += `
                <div class="skeleton-card">
                    <div class="skeleton-title"></div>
                </div>
            `;
        }
        
        return `<div class="skeleton-grid">${skeletons}</div>`;
    }
    
    getSkeletonCount() {
        const width = window.innerWidth;
        
        if (this.isMobile()) {
            return width <= 600 ? 6 : 9; // 2x3 or 3x3 grid
        }
        
        // Desktop skeleton count based on screen size
        if (width >= 1700) return 12; // 6x2
        if (width >= 1400) return 10; // 5x2  
        if (width >= 1082) return 8;  // 4x2
        if (width >= 700) return 6;   // 3x2
        return 4; // 2x2
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
        // Improved mobile detection with caching
        if (!this._mobileCache || this._lastWindowWidth !== window.innerWidth) {
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isSmallScreen = window.innerWidth <= 789.95;
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            this._mobileCache = isMobileDevice || (isSmallScreen && isTouchDevice) || isSmallScreen;
            this._lastWindowWidth = window.innerWidth;
            
            console.log(`Mobile detection - Device: ${isMobileDevice}, Small screen: ${isSmallScreen}, Touch: ${isTouchDevice}, Final: ${this._mobileCache}, Width: ${window.innerWidth}`);
        }
        
        return this._mobileCache;
    }
    
    loadMockData() {
        // Mock data for development/demo when APIs fail
        const mockGames = [
            {
                id: '1',
                title: 'Space Adventure',
                category: 'Action',
                description: 'Explore the galaxy in this exciting space adventure!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjkwIiByPSIzMCIgZmlsbD0iIzZhNDJmZiIvPgo8dGV4dCB4PSIxNDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2Y5ZmFmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+U3BhY2UgQWR2ZW50dXJlPC90ZXh0Pgo8L3N2Zz4K',
                url: 'https://example.com/game1'
            },
            {
                id: '2',
                title: 'Puzzle Master',
                category: 'Puzzle',
                description: 'Challenge your mind with these clever puzzles!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+CjxyZWN0IHg9IjEyMCIgeT0iNzAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0iIzZhNDJmZiIvPgo8dGV4dCB4PSIxNDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2Y5ZmFmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+UHV6emxlIE1hc3RlcjwvdGV4dD4KPC9zdmc+Cg==',
                url: 'https://example.com/game2'
            },
            {
                id: '3',
                title: 'Racing Thunder',
                category: 'Racing',
                description: 'Feel the speed in this high-octane racing game!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+CjxlbGxpcHNlIGN4PSIxNDAiIGN5PSI5MCIgcng9IjQwIiByeT0iMjAiIGZpbGw9IiM2YTQyZmYiLz4KPHR5ZXQgeD0iMTQwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmOWZhZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlJhY2luZyBUaHVuZGVyPC90ZXh0Pgo8L3N2Zz4K',
                url: 'https://example.com/game3'
            },
            {
                id: '4',
                title: 'Strategy Empire',
                category: 'Strategy',
                description: 'Build your empire and conquer the world!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+Cjxwb2x5Z29uIHBvaW50cz0iMTQwLDUwIDE2MCw4MCAsMTIwLDgwIiBmaWxsPSIjNmE0MmZmIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZjlmYWZmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5TdHJhdGVneSBFbXBpcmU8L3RleHQ+Cjwvc3ZnPgo=',
                url: 'https://example.com/game4'
            },
            {
                id: '5',
                title: 'Sports Champion',
                category: 'Sports',
                description: 'Become the ultimate sports champion!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjkwIiByPSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNmE0MmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KPHR5ZXQgeD0iMTQwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmOWZhZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPlNwb3J0cyBDaGFtcGlvbjwvdGV4dD4KPC9zdmc+Cg==',
                url: 'https://example.com/game5'
            },
            {
                id: '6',
                title: 'Arcade Classic',
                category: 'Arcade',
                description: 'Experience classic arcade gaming!',
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMWExYjI4Ii8+CjxyZWN0IHg9IjEyNSIgeT0iNzUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzZhNDJmZiIgcng9IjUiLz4KPHR5ZXQgeD0iMTQwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmOWZhZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPkFyY2FkZSBDbGFzc2ljPC90ZXh0Pgo8L3N2Zz4K',
                url: 'https://example.com/game6'
            }
        ];
        
        console.log('Mock data loaded with', mockGames.length, 'games');
        this.games = mockGames;
        this.filteredGames = mockGames;
        this.hasMoreGames = false; // No more mock data available
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
            
            // Try to load from cache first for initial load
            if (page === 1 && !append) {
                const cachedData = this.loadFromCache();
                if (cachedData) {
                    console.log('Loaded games from cache');
                    this.games = cachedData;
                    this.filteredGames = this.games;
                    this.hasMoreGames = true; // Assume more games available for cached data
                    return;
                }
            }
            
            const data = await this.fetchWithFallbacks(page);
            
            if (data && Array.isArray(data)) {
                console.log(`Loaded ${data.length} games from API (page ${page})`);
                
                if (append) {
                    // Filter out duplicate games by ID before appending
                    const existingIds = new Set(this.games.map(game => game.id));
                    const newGames = data.filter(game => !existingIds.has(game.id));
                    console.log(`${data.length} games received, ${newGames.length} new games after deduplication`);
                    
                    if (newGames.length === 0) {
                        console.log('No new games found, disabling further loading');
                        this.hasMoreGames = false;
                        return;
                    }
                    
                    this.games = [...this.games, ...newGames];
                } else {
                    // First load - cache the data
                    this.games = data;
                    this.saveToCache(data);
                }
                
                this.hasMoreGames = data.length === this.gamesPerPage;
                console.log(`Has more games: ${this.hasMoreGames} (received ${data.length}, expected ${this.gamesPerPage})`);
                
                this.filteredGames = this.games;
                
                // Reset API state on successful load
                this.currentApiIndex = 0;
                this.retryAttempts = 0;
                
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // Try loading mock data as last resort for development/demo
            if (!append && this.games.length === 0) {
                console.log('Loading mock data as fallback...');
                this.loadMockData();
            } else {
                this.handleLoadError(error, append);
            }
        } finally {
            this.isLoadingMore = false;
        }
    }
    
    async fetchWithFallbacks(page) {
        while (this.currentApiIndex < this.apiEndpoints.length && this.retryAttempts < this.maxRetries) {
            try {
                const apiUrl = this.buildApiUrl(page);
                console.log(`Trying API endpoint ${this.currentApiIndex + 1}/${this.apiEndpoints.length}:`, apiUrl);
                
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    // Remove Content-Type header to avoid CORS preflight
                    // Add timeout
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                let data;
                const endpoint = this.apiEndpoints[this.currentApiIndex];
                
                if (endpoint.type === 'direct') {
                    data = await response.json();
                } else if (endpoint.type === 'allorigins') {
                    const proxyData = await response.json();
                    data = JSON.parse(proxyData.contents);
                } else {
                    // Other proxies return JSON directly
                    data = await response.json();
                }
                
                return data;
                
            } catch (error) {
                console.warn(`API endpoint ${this.currentApiIndex + 1} failed:`, error.message);
                this.retryAttempts++;
                
                if (this.retryAttempts >= this.maxRetries) {
                    this.currentApiIndex++;
                    this.retryAttempts = 0;
                    
                    if (this.currentApiIndex >= this.apiEndpoints.length) {
                        throw new Error('All API endpoints failed');
                    }
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryAttempts));
            }
        }
        
        throw new Error('Max retries exceeded for all endpoints');
    }
    
    buildApiUrl(page) {
        const endpoint = this.apiEndpoints[this.currentApiIndex];
        const params = `format=0&num=${this.gamesPerPage}&page=${page}`;
        const targetUrl = `https://gamemonetize.com/feed.php?${params}`;
        
        switch (endpoint.type) {
            case 'direct':
                return targetUrl;
            case 'allorigins':
                return `${endpoint.url}?url=${encodeURIComponent(targetUrl)}`;
            case 'corsproxy':
                return `${endpoint.url}?${targetUrl}`;
            case 'corseuorg':
                return `${endpoint.url}${targetUrl}`;
            default:
                return targetUrl;
        }
    }
    
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            if (now - timestamp > this.cacheExpiry) {
                localStorage.removeItem(this.cacheKey);
                return null;
            }
            
            return data;
        } catch (error) {
            console.error('Error loading from cache:', error);
            return null;
        }
    }
    
    saveToCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            console.log('Games saved to cache');
        } catch (error) {
            console.error('Error saving to cache:', error);
            // Clear cache if storage is full
            if (error.name === 'QuotaExceededError') {
                localStorage.removeItem(this.cacheKey);
            }
        }
    }
    
    handleLoadError(error, append) {
        if (!append) {
            // Show user-friendly error message
            const gamesGrid = document.getElementById('gamesGrid');
            if (gamesGrid && this.games.length === 0) {
                gamesGrid.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Unable to Load Games</h3>
                        <p>We're having trouble connecting to our game servers. Please check your internet connection and try again.</p>
                        <div class="error-actions">
                            <button class="retry-btn" onclick="window.gamePortal.retryLoading()">Try Again</button>
                            <button class="demo-btn" onclick="window.gamePortal.loadMockData(); window.gamePortal.displayGames();">View Demo</button>
                        </div>
                    </div>
                `;
            }
            
            if (this.games.length === 0) {
                this.games = [];
                this.filteredGames = [];
            }
        }
        this.hasMoreGames = false;
    }
    
    async retryLoading() {
        // Reset API state
        this.currentApiIndex = 0;
        this.retryAttempts = 0;
        
        // Clear any error states
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.innerHTML = '';
        }
        
        this.showLoading();
        await this.loadGames();
        this.displayGames();
        this.hideLoading();
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
            // Clear existing content including skeleton
            gamesGrid.innerHTML = '';
            gamesGrid.className = 'games-grid'; // Reset to regular grid class
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
            const noGamesMessage = this.currentCategory === 'recent' 
                ? '<div class="no-games">No recent games found. Play some games to see them here!</div>'
                : '<div class="no-games">No games found matching your criteria.</div>';
            gamesGrid.innerHTML = noGamesMessage;
            return;
        }

        if (append) {
            // When appending, only show new games
            const gamesToShow = this.filteredGames.slice(this.displayedGamesCount);
            console.log(`Appending ${gamesToShow.length} new games (displayed: ${this.displayedGamesCount}, total: ${this.filteredGames.length})`);
            
            // Use document fragment for better performance
            const fragment = document.createDocumentFragment();
            gamesToShow.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                fragment.appendChild(gameCard);
            });
            gamesGrid.appendChild(fragment);
            
            this.displayedGamesCount = this.filteredGames.length;
        } else {
            // Full reload - display all games with document fragment for performance
            console.log(`Displaying all ${this.filteredGames.length} games`);
            const fragment = document.createDocumentFragment();
            this.filteredGames.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                fragment.appendChild(gameCard);
            });
            gamesGrid.appendChild(fragment);
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
            // Clear existing content including skeleton
            gamesGrid.innerHTML = '';
            gamesGrid.className = 'games-grid'; // Reset to regular grid class
        } else {
            // Remove mobile load more section if it exists
            const mobileLoadMore = document.getElementById('mobileLoadMoreGridSection');
            if (mobileLoadMore) {
                mobileLoadMore.remove();
            }
        }

        if (this.filteredGames.length === 0) {
            const noGamesMessage = this.currentCategory === 'recent' 
                ? '<div class="no-games">No recent games found. Play some games to see them here!</div>'
                : '<div class="no-games">No games found matching your criteria.</div>';
            gamesGrid.innerHTML = noGamesMessage;
            return;
        }
        
        console.log('Creating mobile layout with', this.filteredGames.length, 'games, append:', append);

        // Create simple uncategorized game grid with better performance
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
            
            // Use document fragment for better mobile performance
            const fragment = document.createDocumentFragment();
            gamesToShow.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                fragment.appendChild(gameCard);
            });
            gamesGrid.appendChild(fragment);
            
            this.displayedGamesCount = this.filteredGames.length;
        } else {
            // Full reload - display all games with performance optimization
            console.log(`Mobile: Displaying all ${this.filteredGames.length} games`);
            const fragment = document.createDocumentFragment();
            this.filteredGames.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                fragment.appendChild(gameCard);
            });
            gamesGrid.appendChild(fragment);
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
        
        // Create recent games section
        const recentGames = this.getRecentGames();
        if (recentGames.length > 0) {
            const recentSection = document.createElement('div');
            recentSection.className = 'mobile-category-section';
            
            const gamesPerSection = Math.min(8, recentGames.length);
            const recentGamesHtml = recentGames.slice(0, gamesPerSection).map(game => `
                <div class="game-card" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Play ${game.title}">
                    <img src="${game.thumb}" alt="${game.title}" class="game-thumb" loading="lazy">
                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>
                    </div>
                </div>
            `).join('');

            recentSection.innerHTML = `
                <div class="mobile-category-header">
                    <h2 class="mobile-category-title">Recently Played</h2>
                    <span class="mobile-games-count">${gamesPerSection} of ${recentGames.length}</span>
                </div>
                <div class="mobile-games-row">
                    ${recentGamesHtml}
                </div>
            `;

            // Add event listeners for recent games
            recentSection.querySelectorAll('.game-card').forEach(card => {
                const gameId = card.dataset.gameId;
                const game = recentGames.find(g => g.id == gameId);
                if (game) {
                    console.log(`Adding mobile click listener for recent game: ${game.title} (ID: ${game.id})`);
                    card.addEventListener('click', () => this.openGamePage(game));
                    
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.openGamePage(game);
                        }
                    });
                }
            });

            mobileSections.appendChild(recentSection);
        }
        
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
        
        // Add better touch and click handling
        card.addEventListener('click', (e) => {
            e.preventDefault();
            this.openGamePage(game);
        }, { passive: false });
        
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openGamePage(game);
            }
        });
        
        // Add touch events for better mobile experience
        let touchStartTime;
        card.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            card.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        card.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            card.style.transform = '';
            
            // Only trigger if it was a quick tap (not a scroll)
            if (touchDuration < 300) {
                e.preventDefault();
                this.openGamePage(game);
            }
        }, { passive: false });
        
        card.addEventListener('touchcancel', () => {
            card.style.transform = '';
        }, { passive: true });

        // Improved fallback image with better placeholder
        const fallbackSvg = this.createFallbackImage(game.title);

        card.innerHTML = `
            <img src="${game.thumb}" 
                 alt="Play ${game.title} - ${game.category} game" 
                 class="game-thumb" 
                 loading="lazy"
                 decoding="async"
                 width="280"
                 height="180"
                 onerror="this.src='${fallbackSvg}'"
                 onload="this.style.opacity='1';"
                 style="opacity:0;transition:opacity 0.3s ease;">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
            </div>
        `;

        return card;
    }
    
    createFallbackImage(title) {
        const shortTitle = title.length > 12 ? title.substring(0, 12) + '...' : title;
        const svg = `<svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="280" height="180" fill="#1a1b28"/>
            <rect x="20" y="20" width="240" height="140" fill="#2a2c41" rx="8"/>
            <circle cx="140" cy="70" r="20" fill="#6842ff" opacity="0.5"/>
            <text x="140" y="130" text-anchor="middle" fill="#6842ff" font-family="Arial" font-size="14" font-weight="bold">${shortTitle}</text>
            <text x="140" y="150" text-anchor="middle" fill="#aaadbe" font-family="Arial" font-size="12">Game</text>
        </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    async openGamePage(game) {
        console.log(`Opening game page for: ${game.title}`);
        
        // Add to recent games before opening
        this.addToRecentGames(game);
        
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

                <header class="game-header">
                    <h1 class="game-page-title">${game.title}</h1>
                    <div class="game-meta">
                        <span class="game-category">${game.category}</span>
                    </div>
                    <p class="game-description">${game.description}</p>
                </header>
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
        let filteredGames;

        // Handle Recent category specially
        if (this.currentCategory === 'recent') {
            filteredGames = this.getFilteredRecentGames();
        } else {
            filteredGames = this.games;

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

        // Window resize handler with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        }, { passive: true });

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
        // Clear mobile cache on resize to recalculate
        this._mobileCache = null;
        
        // Use requestAnimationFrame for smooth resize handling
        if (this._resizeFrame) {
            cancelAnimationFrame(this._resizeFrame);
        }
        
        this._resizeFrame = requestAnimationFrame(() => {
            this.displayGames();
        });
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

    // Recent Games localStorage Methods
    getRecentGames() {
        try {
            const recentGames = localStorage.getItem(this.recentGamesKey);
            return recentGames ? JSON.parse(recentGames) : [];
        } catch (error) {
            console.error('Error loading recent games from localStorage:', error);
            return [];
        }
    }

    addToRecentGames(game) {
        try {
            let recentGames = this.getRecentGames();
            
            // Remove game if it already exists (to move it to front)
            recentGames = recentGames.filter(recentGame => recentGame.id !== game.id);
            
            // Add game to beginning of array with timestamp
            const gameWithTimestamp = {
                ...game,
                playedAt: new Date().toISOString()
            };
            recentGames.unshift(gameWithTimestamp);
            
            // Keep only the most recent games
            if (recentGames.length > this.maxRecentGames) {
                recentGames = recentGames.slice(0, this.maxRecentGames);
            }
            
            localStorage.setItem(this.recentGamesKey, JSON.stringify(recentGames));
            console.log(`Added ${game.title} to recent games`);
        } catch (error) {
            console.error('Error adding game to recent games:', error);
        }
    }

    clearRecentGames() {
        try {
            localStorage.removeItem(this.recentGamesKey);
            console.log('Recent games cleared');
        } catch (error) {
            console.error('Error clearing recent games:', error);
        }
    }

    getFilteredRecentGames() {
        const recentGames = this.getRecentGames();
        
        // Apply search filter if active
        if (this.currentSearchTerm) {
            return recentGames.filter(game =>
                game.title.toLowerCase().includes(this.currentSearchTerm) ||
                game.description.toLowerCase().includes(this.currentSearchTerm) ||
                game.category.toLowerCase().includes(this.currentSearchTerm)
            );
        }
        
        return recentGames;
    }
    
    // PWA Installation functionality
    showInstallPrompt() {
        if (!this.installPromptShown && window.deferredPrompt) {
            this.installPromptShown = true;
            
            // Create install prompt UI
            const installPrompt = document.createElement('div');
            installPrompt.id = 'pwaInstallPrompt';
            installPrompt.className = 'pwa-install-prompt';
            installPrompt.innerHTML = `
                <div class="install-prompt-content">
                    <div class="install-prompt-icon">🎮</div>
                    <h3>Install Kloopik</h3>
                    <p>Get faster access and play offline!</p>
                    <div class="install-prompt-buttons">
                        <button class="btn-install" id="installBtn">Install</button>
                        <button class="btn-dismiss" id="dismissBtn">Not Now</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(installPrompt);
            
            // Add event listeners
            document.getElementById('installBtn').addEventListener('click', this.installPWA.bind(this));
            document.getElementById('dismissBtn').addEventListener('click', this.dismissInstall.bind(this));
            
            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                this.dismissInstall();
            }, 10000);
        }
    }
    
    async installPWA() {
        if (!window.deferredPrompt) return;
        
        try {
            // Show the install prompt
            window.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                this.trackEvent('pwa_install_accepted');
            } else {
                console.log('User dismissed the install prompt');
                this.trackEvent('pwa_install_dismissed');
            }
            
            // Clear the prompt
            window.deferredPrompt = null;
            this.dismissInstall();
        } catch (error) {
            console.error('Error during PWA installation:', error);
            this.dismissInstall();
        }
    }
    
    dismissInstall() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.classList.add('fade-out');
            setTimeout(() => {
                prompt.remove();
            }, 300);
        }
    }
    
    // Service Worker update handling
    showUpdateAvailable(registration) {
        const updatePrompt = document.createElement('div');
        updatePrompt.id = 'swUpdatePrompt';
        updatePrompt.className = 'sw-update-prompt';
        updatePrompt.innerHTML = `
            <div class="update-prompt-content">
                <div class="update-prompt-icon">⬆️</div>
                <h3>Update Available</h3>
                <p>A new version is ready!</p>
                <div class="update-prompt-buttons">
                    <button class="btn-update" id="updateBtn">Update Now</button>
                    <button class="btn-dismiss" id="updateDismissBtn">Later</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(updatePrompt);
        
        document.getElementById('updateBtn').addEventListener('click', () => {
            // Tell the new service worker to skip waiting
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            window.location.reload();
        });
        
        document.getElementById('updateDismissBtn').addEventListener('click', () => {
            updatePrompt.remove();
        });
    }
    
    // Network status handling
    handleOnlineStatus() {
        window.addEventListener('online', () => {
            console.log('App is online');
            this.showNetworkStatus('Connected', 'success');
            
            // Sync data in background
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                navigator.serviceWorker.ready.then((registration) => {
                    return registration.sync.register('background-game-sync');
                });
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('App is offline');
            this.showNetworkStatus('Offline - Some features limited', 'warning');
        });
    }
    
    showNetworkStatus(message, type = 'info') {
        const statusBar = document.createElement('div');
        statusBar.className = `network-status network-status-${type}`;
        statusBar.textContent = message;
        
        document.body.appendChild(statusBar);
        
        setTimeout(() => {
            statusBar.classList.add('fade-out');
            setTimeout(() => statusBar.remove(), 300);
        }, 3000);
    }
}

// Initialize the game portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gamePortal = new GamePortal();
    
    // Initialize PWA features
    if (window.gamePortal) {
        window.gamePortal.handleOnlineStatus();
    }
});