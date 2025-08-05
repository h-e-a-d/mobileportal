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
        
        // Last played games tracking
        this.lastPlayedGames = this.loadLastPlayedGames();
        this.maxLastPlayedGames = 12;
        
        this.init();
    }


    // Last played games methods
    loadLastPlayedGames() {
        const saved = localStorage.getItem('lastPlayedGames');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (error) {
                console.error('Error parsing last played games:', error);
                return [];
            }
        }
        return [];
    }

    saveLastPlayedGames() {
        localStorage.setItem('lastPlayedGames', JSON.stringify(this.lastPlayedGames));
    }

    addToLastPlayed(game) {
        // Remove the game if it already exists in the list
        this.lastPlayedGames = this.lastPlayedGames.filter(g => g.id !== game.id);
        
        // Add the game to the beginning of the list
        this.lastPlayedGames.unshift({
            ...game,
            playedAt: new Date().toISOString()
        });
        
        // Keep only the maximum number of games
        if (this.lastPlayedGames.length > this.maxLastPlayedGames) {
            this.lastPlayedGames = this.lastPlayedGames.slice(0, this.maxLastPlayedGames);
        }
        
        // Save to localStorage
        this.saveLastPlayedGames();
    }

    getLastPlayedGames() {
        // Return games with their current data (in case titles or images have been updated)
        return this.lastPlayedGames.map(lastPlayedGame => {
            const currentGame = this.games.find(g => g.id === lastPlayedGame.id);
            return currentGame ? {
                ...currentGame,
                playedAt: lastPlayedGame.playedAt
            } : lastPlayedGame;
        }).filter(game => game !== null);
    }

    hasLastPlayedGames() {
        return this.lastPlayedGames.length > 0;
    }


    async init() {
        this.showLoading();
        this.initializeSidebar();
        await this.loadGames();
        this.setupEventListeners();
        this.updateLastPlayedCategoryVisibility();
        this.displayGames();
        this.hideLoading();
    }

    initializeSidebar() {
        // Simple sidebar initialization - no complex state management needed
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
                this.filteredGames = this.games;
                return;
            }
            
            console.log('No local games found, trying API...');
            
            // Fallback to API if local games not available
            const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=100&page=1');
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                // Filter out games that don't have corresponding HTML files
                const availableGames = await this.filterAvailableGames(data);
                console.log(`Loaded ${availableGames.length} games from API`);
                this.games = availableGames;
                this.filteredGames = this.games;
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // Final fallback to mock games
            console.log('Using mock games as fallback');
            const mockGames = this.getMockGames();
            this.games = mockGames;
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
        const currentLocale = this.getCurrentLocale();
        const fallbackLocales = ['en', 'de']; // Add more locales as needed
        const games = [];
        
        console.log('Loading local games...');
        
        // Try to load current locale first
        const localesToTry = [currentLocale, ...fallbackLocales.filter(l => l !== currentLocale)];
        
        for (const locale of localesToTry) {
            try {
                console.log(`Trying to load games for locale: ${locale}`);
                const response = await fetch(`games/${locale}/games-list.json`);
                console.log(`Response status for ${locale}:`, response.status);
                
                if (response.ok) {
                    const localeGames = await response.json();
                    console.log(`Loaded ${localeGames.length} games for ${locale}`);
                    games.push(...localeGames);
                    
                    // If we successfully loaded games for current locale, break
                    if (locale === currentLocale && localeGames.length > 0) {
                        console.log(`Successfully loaded games for current locale (${currentLocale}), skipping other locales`);
                        break;
                    }
                } else {
                    console.warn(`Failed to load games for ${locale}, status: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Could not load games for locale ${locale}:`, error);
            }
        }
        
        console.log(`Total games loaded: ${games.length}`);
        
        if (games.length > 0) {
            // Remove duplicates based on game ID
            const uniqueGames = this.removeDuplicateGames(games);
            console.log(`Games after deduplication: ${uniqueGames.length}`);
            
            this.games = uniqueGames;
            this.filteredGames = this.games;
        } else {
            // Use mock data as final fallback
            console.log('No local games found, using mock games');
            const mockGames = this.getMockGames();
            this.games = mockGames;
            this.filteredGames = this.games;
        }
    }

    removeDuplicateGames(games) {
        const uniqueGames = [];
        const seenIds = new Set();
        
        for (const game of games) {
            if (!seenIds.has(game.id)) {
                seenIds.add(game.id);
                uniqueGames.push(game);
            }
        }
        
        return uniqueGames;
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
        
        // Create "Last played" section first if there are played games
        if (this.hasLastPlayedGames()) {
            const lastPlayedGames = this.getLastPlayedGames();
            const lastPlayedSection = document.createElement('div');
            lastPlayedSection.className = 'mobile-category-section';
            
            const gamesHtml = lastPlayedGames.map(game => `
                <div class="game-card" data-game-id="${game.id}" tabindex="0" role="button" aria-label="Play ${game.title}">
                    <img src="${game.thumb}" alt="${game.title}" class="game-thumb" loading="lazy"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTc4IiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE3OCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNzgiIGhlaWdodD0iMTAwIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9Ijg5IiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+R2FtZSBJbWFnZTwvdGV4dD4KPC9zdmc+'">
                    <div class="game-info">
                        <h3 class="game-title">${game.title}</h3>
                    </div>
                </div>
            `).join('');

            lastPlayedSection.innerHTML = `
                <div class="mobile-category-header">
                    <h2 class="mobile-category-title">Last Played</h2>
                </div>
                <div class="mobile-games-row">
                    ${gamesHtml}
                </div>
            `;

            // Add event listeners for games in this section
            lastPlayedSection.querySelectorAll('.game-card').forEach(card => {
                const gameId = card.dataset.gameId;
                const game = lastPlayedGames.find(g => g.id == gameId); // Use == for type coercion
                if (game) {
                    console.log(`Adding click listener for last played game: ${game.title} (ID: ${game.id})`);
                    card.addEventListener('click', () => this.navigateToGame(game));
                } else {
                    console.warn(`No game found for ID: ${gameId}`);
                }
            });

            mobileSections.appendChild(lastPlayedSection);
        }
        
        // Create featured game section
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
            console.log(`Adding click listener for featured game: ${featuredGame.title} (ID: ${featuredGame.id})`);
            featuredCard.addEventListener('click', () => this.navigateToGame(featuredGame));
            
            mobileSections.appendChild(featuredSection);
        }

        // Create category sections
        categories.forEach(category => {
            const categoryGames = this.games.filter(game => game.category === category);
            if (categoryGames.length === 0) return;

            const section = document.createElement('div');
            section.className = 'mobile-category-section';
            
            const gamesHtml = categoryGames.map(game => `
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
                </div>
                <div class="mobile-games-row">
                    ${gamesHtml}
                </div>
            `;

            // Add event listeners for games in this section
            section.querySelectorAll('.game-card').forEach(card => {
                const gameId = card.dataset.gameId;
                const game = this.games.find(g => g.id == gameId); // Use == for type coercion
                if (game) {
                    console.log(`Adding click listener for ${category} game: ${game.title} (ID: ${game.id})`);
                    card.addEventListener('click', () => this.navigateToGame(game));
                } else {
                    console.warn(`No game found for ID: ${gameId} in category: ${category}`);
                }
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
            console.log(`Adding click listener for all games: ${game.title} (ID: ${game.id})`);
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

        const labelsHtml = '';

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


    async navigateToGame(game) {
        console.log(`navigateToGame called for: ${game.title} (ID: ${game.id})`);
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
            console.log(`Checking if game page exists: ${gameUrl}`);
            const response = await fetch(gameUrl, { method: 'HEAD' });
            console.log(`Game page check response: ${response.status}`);
            if (!response.ok) {
                throw new Error(`Game page not found: ${gameUrl}`);
            }
        } catch (error) {
            console.error('Game page not found:', error);
            console.log('Available game data:', game);
            this.showGameNotFoundError(game.title);
            return;
        }
        
        // Track simple click analytics
        this.trackEvent('game_click', {
            game_id: game.id,
            game_title: game.title,
            game_category: game.category
        });
        
        // Add game to last played list
        this.addToLastPlayed(game);
        
        // Update the "Last played" category visibility
        this.updateLastPlayedCategoryVisibility();
        
        
        window.location.href = gameUrl;
    }

    getCurrentLocale() {
        // Get locale from URL, localStorage, or default to 'en'
        const urlParams = new URLSearchParams(window.location.search);
        const urlLocale = urlParams.get('locale');
        const savedLocale = localStorage.getItem('preferred_locale');
        
        return urlLocale || savedLocale || 'en';
    }

    updateLastPlayedCategoryVisibility() {
        const lastPlayedCategory = document.getElementById('lastPlayedCategory');
        if (lastPlayedCategory) {
            if (this.hasLastPlayedGames()) {
                lastPlayedCategory.style.display = 'block';
            } else {
                lastPlayedCategory.style.display = 'none';
            }
        }
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.applyFilters();
        this.updateActiveCategory(category);
        
    }

    searchGames(searchTerm) {
        this.currentSearchTerm = searchTerm.toLowerCase();
        
        // Show search dropdown with results instead of filtering main content
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
            game.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (game.tags && game.tags.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (filteredGames.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No games found matching your search.</div>';
        } else {
            // Limit results to first 8 games for performance
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
        item.setAttribute('data-game-id', game.id);
        
        item.innerHTML = `
            <div class="search-result-icon">
                <img src="${game.thumb}" alt="${game.title}" loading="lazy"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMWExYjI4Ii8+Cjx0ZXh0IHg9IjE2IiB5PSIxOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY4NDJmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZvbnQtd2VpZ2h0PSJib2xkIj7wn4eK8J+HsLwvdGV4dD4KPC9zdmc+'">
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
        
        // Navigate to the selected game
        this.navigateToGame(game);
        
    }

    applyFilters() {
        let filteredGames = this.games;

        // Apply category filter
        if (this.currentCategory === 'last-played') {
            // Show last played games (max 12, most recent first)
            filteredGames = this.getLastPlayedGames();
        } else if (this.currentCategory !== 'all') {
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
        // For last played games, they are already sorted by most recent first
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
            if (e.key === '/' && e.ctrlKey) {
                e.preventDefault();
                this.toggleSearch();
            }
            
            // Close search on Escape
            if (e.key === 'Escape' && navSearch && navSearch.classList.contains('active')) {
                this.closeSearch();
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
        // Simplified sidebar toggle - mainly for desktop
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.getElementById('mainContainer');
        
        this.sidebarExpanded = !this.sidebarExpanded;
        
        if (this.sidebarExpanded) {
            sidebar.classList.remove('collapsed');
            mainContainer.classList.add('sidebar-expanded');
        } else {
            sidebar.classList.add('collapsed');
            mainContainer.classList.remove('sidebar-expanded');
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
                // Focus search input after animation
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
            
            // Clear search input and hide dropdown
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