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
        
        // Game ranking system
        this.gameStats = this.loadGameStats();
        this.rankingWeights = {
            POPULARITY: 0.30,
            QUALITY: 0.25,
            RECENCY: 0.20,
            PERFORMANCE: 0.15,
            MONETIZATION: 0.10
        };
        
        this.init();
    }

    // Game ranking system methods
    loadGameStats() {
        // Load from localStorage or default values
        const savedStats = localStorage.getItem('gameStats');
        if (savedStats) {
            return JSON.parse(savedStats);
        }
        
        // Default stats structure
        return {};
    }

    saveGameStats() {
        localStorage.setItem('gameStats', JSON.stringify(this.gameStats));
    }

    getGameStats(gameId) {
        if (!this.gameStats[gameId]) {
            this.gameStats[gameId] = {
                clicks: 0,
                playTime: 0,
                rating: 0,
                reviews: 0,
                lastPlayed: null,
                loadTime: 0,
                crashReports: 0,
                revenue: 0,
                shares: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
        return this.gameStats[gameId];
    }


    getPopularityScore(game, stats) {
        // Normalize scores to 0-100 scale
        const clickScore = Math.min(stats.clicks / 10, 100); // Max at 1000 clicks
        const playTimeScore = Math.min(stats.playTime / 3600, 100); // Max at 1 hour average
        const shareScore = Math.min(stats.shares * 10, 100); // Max at 10 shares
        
        return (clickScore * 0.5) + (playTimeScore * 0.3) + (shareScore * 0.2);
    }

    getQualityScore(game, stats) {
        const ratingScore = (stats.rating / 5) * 100; // Convert 1-5 to 0-100
        const reviewScore = Math.min(stats.reviews * 2, 100); // Max at 50 reviews
        const crashScore = Math.max(100 - (stats.crashReports * 10), 0); // Subtract 10 per crash
        
        return (ratingScore * 0.5) + (reviewScore * 0.3) + (crashScore * 0.2);
    }

    getRecencyScore(game, stats) {
        const now = new Date();
        const createdAt = new Date(stats.createdAt);
        const updatedAt = new Date(stats.updatedAt);
        
        // Games newer than 7 days get full points
        const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24);
        const daysSinceUpdated = (now - updatedAt) / (1000 * 60 * 60 * 24);
        
        const newGameScore = Math.max(100 - (daysSinceCreated * 2), 0); // Decrease by 2 per day
        const updateScore = Math.max(100 - (daysSinceUpdated * 1), 0); // Decrease by 1 per day
        
        return (newGameScore * 0.6) + (updateScore * 0.4);
    }

    getPerformanceScore(game, stats) {
        const loadTimeScore = Math.max(100 - (stats.loadTime * 10), 0); // Subtract 10 per second
        const mobileScore = this.isMobile() ? 100 : 90; // Boost mobile-friendly games
        const stabilityScore = Math.max(100 - (stats.crashReports * 20), 0); // Subtract 20 per crash
        
        return (loadTimeScore * 0.4) + (mobileScore * 0.3) + (stabilityScore * 0.3);
    }

    getMonetizationScore(game, stats) {
        const revenueScore = Math.min(stats.revenue / 10, 100); // Max at $1000
        const engagementScore = Math.min(stats.playTime / 1800, 100); // Max at 30 minutes
        
        return (revenueScore * 0.6) + (engagementScore * 0.4);
    }

    trackGameInteraction(gameId, action, value = 1) {
        const stats = this.getGameStats(gameId);
        
        switch (action) {
            case 'click':
                stats.clicks += value;
                break;
            case 'play_time':
                stats.playTime += value;
                break;
            case 'rating':
                stats.rating = value;
                break;
            case 'share':
                stats.shares += value;
                break;
            case 'crash':
                stats.crashReports += value;
                break;
            case 'revenue':
                stats.revenue += value;
                break;
        }
        
        stats.lastPlayed = new Date().toISOString();
        stats.updatedAt = new Date().toISOString();
        
        this.saveGameStats();
    }

    rankGames(games) {
        return games.map(game => ({
            ...game,
            score: this.calculateGameScore(game),
            stats: this.getGameStats(game.id)
        })).sort((a, b) => b.score - a.score);
    }

    // Admin methods for manual ranking management
    boostGame(gameId, boostValue = 20) {
        const stats = this.getGameStats(gameId);
        stats.manualBoost = (stats.manualBoost || 0) + boostValue;
        stats.updatedAt = new Date().toISOString();
        this.saveGameStats();
        
        // Refresh rankings
        this.games = this.rankGames(this.games);
        this.applyFilters();
    }

    setGameRating(gameId, rating) {
        this.trackGameInteraction(gameId, 'rating', rating);
        
        // Refresh rankings
        this.games = this.rankGames(this.games);
        this.applyFilters();
    }

    promoteToFeatured(gameId) {
        const stats = this.getGameStats(gameId);
        stats.featured = true;
        stats.featuredAt = new Date().toISOString();
        stats.updatedAt = new Date().toISOString();
        this.saveGameStats();
        
        // Refresh rankings
        this.games = this.rankGames(this.games);
        this.applyFilters();
    }

    // Enhanced scoring with manual boosts and featured status
    calculateGameScore(game) {
        const stats = this.getGameStats(game.id);
        
        const popularityScore = this.getPopularityScore(game, stats);
        const qualityScore = this.getQualityScore(game, stats);
        const recencyScore = this.getRecencyScore(game, stats);
        const performanceScore = this.getPerformanceScore(game, stats);
        const monetizationScore = this.getMonetizationScore(game, stats);
        
        let totalScore = (
            (popularityScore * this.rankingWeights.POPULARITY) +
            (qualityScore * this.rankingWeights.QUALITY) +
            (recencyScore * this.rankingWeights.RECENCY) +
            (performanceScore * this.rankingWeights.PERFORMANCE) +
            (monetizationScore * this.rankingWeights.MONETIZATION)
        );
        
        // Add manual boost if present
        if (stats.manualBoost) {
            totalScore += stats.manualBoost;
        }
        
        // Add featured bonus
        if (stats.featured) {
            totalScore += 25;
        }
        
        // Cap score at 100
        totalScore = Math.min(totalScore, 100);
        
        return Math.round(totalScore * 100) / 100;
    }

    // Demo function to simulate game interactions for testing
    simulateGameInteractions() {
        if (this.games.length > 0) {
            // Simulate clicks and ratings for some games
            const topGames = this.games.slice(0, 5);
            topGames.forEach((game, index) => {
                // Simulate varying levels of popularity
                const clicks = Math.floor(Math.random() * 100) + (5 - index) * 20;
                const rating = 3 + Math.random() * 2; // 3-5 stars
                const playTime = Math.floor(Math.random() * 3600) + 600; // 10 minutes to 1 hour
                
                for (let i = 0; i < clicks; i++) {
                    this.trackGameInteraction(game.id, 'click');
                }
                
                this.trackGameInteraction(game.id, 'rating', rating);
                this.trackGameInteraction(game.id, 'play_time', playTime);
                
                // Feature the top game
                if (index === 0) {
                    this.promoteToFeatured(game.id);
                }
            });
            
            console.log('Demo interactions simulated. Rankings updated.');
        }
    }

    async init() {
        this.showLoading();
        this.initializeSidebar();
        this.preventMobilePullToRefresh();
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

    preventMobilePullToRefresh() {
        // Prevent pull-to-refresh on mobile Safari
        if (this.isMobile()) {
            let startY = 0;
            let isAtTop = true;
            
            // Track if we're at the top of the page
            const updateScrollPosition = () => {
                isAtTop = window.scrollY <= 0;
            };
            
            // Listen for scroll events
            window.addEventListener('scroll', updateScrollPosition, { passive: true });
            
            // Handle touch events to prevent pull-to-refresh
            document.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    startY = e.touches[0].clientY;
                }
            }, { passive: true });
            
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                    const currentY = e.touches[0].clientY;
                    const deltaY = currentY - startY;
                    
                    // Prevent pull-to-refresh when scrolling down at the top of the page
                    if (isAtTop && deltaY > 0) {
                        e.preventDefault();
                    }
                }
            }, { passive: false });
            
            // Additional prevention for webkit browsers
            document.addEventListener('touchforcechange', (e) => {
                e.preventDefault();
            });
        }
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 789.95;
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
            // Try to load from local games first
            await this.loadLocalGames();
            
            // If local games are available, use them
            if (this.games && this.games.length > 0) {
                console.log(`Loaded ${this.games.length} games from local files`);
                // Apply ranking to games
                this.games = this.rankGames(this.games);
                this.filteredGames = this.games;
                return;
            }
            
            // Fallback to API if local games not available
            const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=100&page=1');
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                // Filter out games that don't have corresponding HTML files
                const availableGames = await this.filterAvailableGames(data);
                // Apply ranking to games
                this.games = this.rankGames(availableGames);
                this.filteredGames = this.games;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // Final fallback to mock games
            const mockGames = this.getMockGames();
            this.games = this.rankGames(mockGames);
            this.filteredGames = this.games;
        }
    }

    async filterAvailableGames(games) {
        const locale = this.getCurrentLocale();
        const availableGames = [];
        
        for (const game of games) {
            // Generate expected game URL
            let gameUrl;
            if (game.slug) {
                gameUrl = `games/${locale}/${game.slug}-${locale}.html`;
            } else {
                const slug = game.title.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                gameUrl = `games/${locale}/${slug}-${locale}.html`;
            }
            
            // Check if game file exists
            try {
                const response = await fetch(gameUrl, { method: 'HEAD' });
                if (response.ok) {
                    availableGames.push(game);
                } else {
                    console.warn(`Game file not found: ${gameUrl}`);
                }
            } catch (error) {
                console.warn(`Error checking game file: ${gameUrl}`, error);
            }
        }
        
        console.log(`Filtered ${availableGames.length} available games from ${games.length} total games`);
        return availableGames;
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
            this.games = this.rankGames(games);
            this.filteredGames = this.games;
        } else {
            // Use mock data as final fallback
            const mockGames = this.getMockGames();
            this.games = this.rankGames(mockGames);
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

    showGameNotFoundError(gameTitle) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <div class="notification-content">
                <strong>Game Not Available</strong>
                <p>"${gameTitle}" is not available at the moment. Please try another game.</p>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            background: #F44336;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    displayGames() {
        // Check if we're on mobile
        const isMobile = window.innerWidth <= 789.95;
        
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

        // Add related games section if we have games
        if (this.filteredGames.length > 0) {
            this.addRelatedGamesSection();
        }
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
        
        // Create featured game section first
        const featuredGame = this.games[0]; // First game as featured
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
            featuredCard.addEventListener('click', () => this.navigateToGame(featuredGame));
            
            mobileSections.appendChild(featuredSection);
        }

        // Create category sections
        categories.forEach(category => {
            const categoryGames = this.games.filter(game => game.category === category);
            if (categoryGames.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mobile-category-section';
            
            const gamesHtml = categoryGames.slice(0, 6).map(game => `
                <div class="game-card" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Play ${game.title}">
                    <img src="${game.thumb}" alt="${game.title}" class="game-thumb" loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc4IiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE3OCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzgiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9Ijg5IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBJbWFnZTwvdGV4dD4KPC9zdmc+'">
                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>
                    </div>
                </div>
            `).join('');

            section.innerHTML = `
                <div class="mobile-category-header">
                    <h2 class="mobile-category-title">${category} Games</h2>
                    <a href="#" class="mobile-view-more" data-category="${category}">View more</a>
                </div>
                <div class="mobile-games-row">
                    ${gamesHtml}
                </div>
            `;

            // Add event listeners for games in this section
            section.querySelectorAll('.game-card').forEach(card => {
                const gameId = parseInt(card.dataset.gameId);
                const game = this.games.find(g => g.id === gameId);
                if (game) {
                    card.addEventListener('click', () => this.navigateToGame(game));
                }
            });

            // Add event listener for "View more" link
            const viewMoreLink = section.querySelector('.mobile-view-more');
            viewMoreLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(category);
                this.switchToDesktopView();
            });

            mobileSections.appendChild(section);
        });

        // Create "All Games" section at the end
        this.createAllGamesSection();
    }

    createAllGamesSection() {
        const mobileSections = document.getElementById('mobileCategorySections');
        
        // Initialize pagination for all games
        this.currentPage = 1;
        this.gamesPerPage = 10;
        
        const allGamesSection = document.createElement('div');
        allGamesSection.className = 'mobile-category-section mobile-all-games-section';
        allGamesSection.id = 'allGamesSection';
        
        allGamesSection.innerHTML = `
            <div class="mobile-category-header">
                <h2 class="mobile-category-title">All Games</h2>
                <span class="mobile-games-count">${this.games.length} games</span>
            </div>
            <div class="mobile-all-games-grid" id="allGamesGrid">
                <!-- Games will be loaded here -->
            </div>
            <div class="mobile-load-more" id="loadMoreContainer" style="display: none;">
                <button class="mobile-load-more-btn" id="loadMoreBtn">Load More Games</button>
            </div>
        `;
        
        mobileSections.appendChild(allGamesSection);
        
        // Load initial games for the All Games section
        this.loadMoreGames();
        
        // Set up scroll listener for infinite scroll
        this.setupInfiniteScroll();
    }

    loadMoreGames() {
        const allGamesGrid = document.getElementById('allGamesGrid');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        if (!allGamesGrid) return;
        
        const startIndex = (this.currentPage - 1) * this.gamesPerPage;
        const endIndex = startIndex + this.gamesPerPage;
        const gamesToLoad = this.games.slice(startIndex, endIndex);
        
        gamesToLoad.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card mobile-all-game-card';
            gameCard.tabIndex = 0;
            gameCard.setAttribute('role', 'button');
            gameCard.setAttribute('aria-label', `Play ${game.title}`);
            
            gameCard.innerHTML = `
                <img src="${game.thumb}" alt="${game.title}" class="game-thumb" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc4IiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE3OCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzgiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9Ijg5IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBJbWFnZTwvdGV4dD4KPC9zdmc+'">
                <div class="game-info">
                    <h3 class="game-title">${game.title}</h3>
                </div>
            `;
            
            // Add click event listener
            gameCard.addEventListener('click', () => this.navigateToGame(game));
            gameCard.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateToGame(game);
                }
            });
            
            allGamesGrid.appendChild(gameCard);
        });
        
        // Show/hide load more button
        const hasMoreGames = endIndex < this.games.length;
        if (hasMoreGames) {
            loadMoreContainer.style.display = 'block';
            
            // Set up load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.onclick = () => {
                    this.currentPage++;
                    this.loadMoreGames();
                };
            }
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    setupInfiniteScroll() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        // Create intersection observer for infinite scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const hasMoreGames = (this.currentPage * this.gamesPerPage) < this.games.length;
                    if (hasMoreGames) {
                        this.currentPage++;
                        this.loadMoreGames();
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });
        
        if (loadMoreContainer) {
            observer.observe(loadMoreContainer);
        }
    }

    switchToDesktopView() {
        // Force desktop view for "View more" functionality
        const categorySections = document.getElementById('mobileCategorySections');
        const categoryShowcase = document.getElementById('categoryShowcase');
        const gamesGrid = document.getElementById('gamesGrid');
        
        if (categorySections) categorySections.style.display = 'none';
        if (categoryShowcase) categoryShowcase.style.display = 'block';
        if (gamesGrid) gamesGrid.style.display = 'grid';
        
        this.displayDesktopLayout();
    }

    addRelatedGamesSection() {
        const content = document.querySelector('.content');
        if (!content) return;

        // Remove existing related games section
        const existingRelated = content.querySelector('.related-games');
        if (existingRelated) {
            existingRelated.remove();
        }

        // Get related games (different category or random selection)
        const relatedGames = this.getRelatedGames();
        if (relatedGames.length === 0) return;

        const relatedSection = document.createElement('div');
        relatedSection.className = 'related-games';
        relatedSection.innerHTML = `
            <h2>You might also like</h2>
            <div class="related-games-grid" id="relatedGamesGrid"></div>
        `;

        content.appendChild(relatedSection);

        // Add related game cards
        const relatedGrid = document.getElementById('relatedGamesGrid');
        relatedGames.forEach(game => {
            const gameCard = this.createGameCard(game);
            gameCard.classList.add('related-game-card');
            relatedGrid.appendChild(gameCard);
        });
    }

    getRelatedGames() {
        if (!this.games || this.games.length === 0) return [];

        let relatedGames = [];
        
        // If we're showing a specific category, get games from other categories
        if (this.currentCategory !== 'all') {
            const otherCategoryGames = this.games.filter(game => 
                game.category !== this.currentCategory
            );
            
            // Randomly select up to 6 games from other categories
            relatedGames = this.shuffleArray(otherCategoryGames).slice(0, 6);
        } else {
            // If showing all games, get random popular games
            relatedGames = this.shuffleArray(this.games).slice(0, 6);
        }

        return relatedGames;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
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
            <img src="${game.thumb}" alt="Play ${game.title} - ${game.category} game online free at Kloopik" class="game-thumb" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc4IiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE3OCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzgiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9Ijg5IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBJbWFnZTwvdGV4dD4KPC9zdmc+'">
            ${labelsHtml}
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
            </div>
        `;

        return card;
    }

    getGameLabels(game) {
        const labels = [];
        const score = game.score || 0;
        const stats = game.stats || this.getGameStats(game.id);
        
        // Add labels based on ranking score and stats
        if (score > 80) {
            labels.push({ type: 'top', text: 'TOP' });
        } else if (score > 60) {
            labels.push({ type: 'hot', text: 'HOT' });
        }
        
        // Add new label for recently created games
        if (stats.createdAt) {
            const daysSinceCreated = (new Date() - new Date(stats.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated <= 7) {
                labels.push({ type: 'new', text: 'NEW' });
            }
        }
        
        // Add trending label for games with recent activity
        if (stats.clicks > 10 && stats.lastPlayed) {
            const daysSinceLastPlayed = (new Date() - new Date(stats.lastPlayed)) / (1000 * 60 * 60 * 24);
            if (daysSinceLastPlayed <= 1) {
                labels.push({ type: 'trending', text: 'TRENDING' });
            }
        }
        
        return labels;
    }

    async navigateToGame(game) {
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
        
        // Check if the game page exists before navigating
        try {
            const response = await fetch(gameUrl, { method: 'HEAD' });
            if (!response.ok) {
                throw new Error(`Game page not found: ${gameUrl}`);
            }
        } catch (error) {
            console.error('Game page not found:', error);
            this.showGameNotFoundError(game.title);
            return;
        }
        
        // Track game click for ranking system
        this.trackGameInteraction(game.id, 'click');
        
        // Track game click for analytics
        this.trackEvent('game_click', {
            game_title: game.title,
            game_category: game.category,
            game_id: game.id,
            game_score: game.score || 0
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

        // Games are already sorted by score from the ranking system
        this.filteredGames = filteredGames;
        this.displayGames();
    }

    updateActiveCategory(category) {
        // Update sidebar category items
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.category === category) {
                item.classList.add('active');
            }
        });
        
        // Update category showcase cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.category === category) {
                card.classList.add('active');
            }
        });
    }

    scrollToGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (gamesGrid) {
            gamesGrid.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    setupEventListeners() {
        // Category filtering (sidebar)
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const category = item.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Category showcase cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.filterByCategory(category);
                this.scrollToGames();
            });
            
            // Add keyboard navigation
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const category = card.dataset.category;
                    this.filterByCategory(category);
                    this.scrollToGames();
                }
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

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Debounce resize handler
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.displayGames();
        }, 100);
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