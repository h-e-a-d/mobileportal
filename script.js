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
        
        // Pagination properties
        this.currentPage = 1;
        this.gamesPerPage = 100;
        this.hasMoreGames = true;
        this.isLoadingMore = false;
        
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadGames();
        this.setupEventListeners();
        this.setupInfiniteScroll();
        this.displayGames();
        this.hideLoading();
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
                    // Append new games to existing ones
                    this.games = [...this.games, ...data];
                } else {
                    // First load
                    this.games = data;
                }
                
                this.filteredGames = this.games;
                
                // Check if there are more games available
                this.hasMoreGames = data.length === this.gamesPerPage;
                
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error loading games:', error);
            
            // Use expanded mock games as fallback
            if (!append) {
                console.log('Using expanded mock games as fallback');
                this.games = this.getExpandedMockGames();
                this.filteredGames = this.games;
                this.hasMoreGames = true; // Enable infinite scroll for mock games
            } else {
                // For subsequent pages, generate more mock games
                console.log(`Generating mock games for page ${page}`);
                const newMockGames = this.generateMockGamesForPage(page);
                this.games = [...this.games, ...newMockGames];
                this.filteredGames = this.games;
                this.hasMoreGames = page < 10; // Limit to 10 pages of mock games
            }
        } finally {
            this.isLoadingMore = false;
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

    getExpandedMockGames() {
        const categories = ['Action', 'Adventure', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Arcade'];
        const games = [];
        
        // Generate 20 games per category for initial load
        categories.forEach((category, categoryIndex) => {
            for (let i = 0; i < 20; i++) {
                const gameId = categoryIndex * 20 + i + 1;
                games.push({
                    id: gameId,
                    title: this.generateGameTitle(category, i + 1),
                    description: this.generateGameDescription(category),
                    category: category,
                    thumb: this.generateGameThumbnail(category),
                    url: `https://games.example.com/${category.toLowerCase()}/${gameId}`,
                    width: '800',
                    height: '600'
                });
            }
        });
        
        return games;
    }

    generateMockGamesForPage(page) {
        const categories = ['Action', 'Adventure', 'Puzzle', 'Racing', 'Sports', 'Strategy', 'Arcade'];
        const games = [];
        const baseId = (page - 1) * 100; // 100 games per page
        
        // Generate 100 games for this page
        for (let i = 0; i < 100; i++) {
            const category = categories[i % categories.length];
            const gameId = baseId + i + 1;
            
            games.push({
                id: gameId,
                title: this.generateGameTitle(category, Math.floor(i / categories.length) + 1),
                description: this.generateGameDescription(category),
                category: category,
                thumb: this.generateGameThumbnail(category),
                url: `https://games.example.com/${category.toLowerCase()}/${gameId}`,
                width: '800',
                height: '600'
            });
        }
        
        return games;
    }

    generateGameTitle(category, number) {
        const titleTemplates = {
            'Action': [
                `Battle Arena ${number}`, `Combat Strike ${number}`, `War Zone ${number}`, 
                `Fighting Champion ${number}`, `Action Hero ${number}`, `Battle Royale ${number}`
            ],
            'Adventure': [
                `Quest Adventure ${number}`, `Fantasy Journey ${number}`, `Treasure Hunt ${number}`,
                `Mystery Island ${number}`, `Epic Quest ${number}`, `Adventure World ${number}`
            ],
            'Puzzle': [
                `Brain Teaser ${number}`, `Logic Puzzle ${number}`, `Mind Bender ${number}`,
                `Puzzle Master ${number}`, `Smart Challenge ${number}`, `Think Tank ${number}`
            ],
            'Racing': [
                `Speed Racer ${number}`, `Fast Track ${number}`, `Racing Pro ${number}`,
                `Turbo Drive ${number}`, `Speed Demon ${number}`, `Race Champion ${number}`
            ],
            'Sports': [
                `Sports Star ${number}`, `Athletic Challenge ${number}`, `Championship ${number}`,
                `Pro Player ${number}`, `Sports Arena ${number}`, `Victory Cup ${number}`
            ],
            'Strategy': [
                `Strategic Warfare ${number}`, `Tactical Command ${number}`, `Empire Builder ${number}`,
                `Master Planner ${number}`, `Strategy King ${number}`, `War Council ${number}`
            ],
            'Arcade': [
                `Retro Arcade ${number}`, `Classic Game ${number}`, `Pixel Adventure ${number}`,
                `Arcade Master ${number}`, `Vintage Fun ${number}`, `Pixel Perfect ${number}`
            ]
        };
        
        const templates = titleTemplates[category] || [`${category} Game ${number}`];
        return templates[number % templates.length];
    }

    generateGameDescription(category) {
        const descriptions = {
            'Action': [
                'Experience intense combat and thrilling action sequences.',
                'Battle against enemies in this fast-paced action game.',
                'Fight your way through challenging levels and boss battles.',
                'Action-packed gameplay with stunning combat mechanics.'
            ],
            'Adventure': [
                'Embark on an epic journey filled with mystery and excitement.',
                'Explore vast worlds and discover hidden treasures.',
                'Adventure awaits in this captivating story-driven game.',
                'Uncover secrets and solve puzzles in your quest.'
            ],
            'Puzzle': [
                'Challenge your mind with brain-teasing puzzles.',
                'Test your logic and problem-solving skills.',
                'Solve increasingly difficult puzzles to progress.',
                'A perfect blend of challenge and entertainment.'
            ],
            'Racing': [
                'Feel the adrenaline rush of high-speed racing.',
                'Compete against the best racers in the world.',
                'Master different tracks and unlock new vehicles.',
                'Experience realistic racing physics and controls.'
            ],
            'Sports': [
                'Compete in your favorite sports with realistic gameplay.',
                'Train hard and become the ultimate sports champion.',
                'Experience the thrill of professional sports competition.',
                'Master the skills needed to win championships.'
            ],
            'Strategy': [
                'Plan your moves carefully in this strategic masterpiece.',
                'Build and manage your empire with tactical precision.',
                'Outsmart your opponents with superior strategy.',
                'Command armies and conquer territories.'
            ],
            'Arcade': [
                'Classic arcade fun with a modern twist.',
                'Simple controls, endless entertainment.',
                'Nostalgic gameplay meets contemporary design.',
                'Perfect for quick gaming sessions.'
            ]
        };
        
        const categoryDescriptions = descriptions[category] || ['An exciting game experience.'];
        return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    }

    generateGameThumbnail(category) {
        const colors = {
            'Action': '#FF4444',
            'Adventure': '#44FF44', 
            'Puzzle': '#4444FF',
            'Racing': '#FF8800',
            'Sports': '#00FFFF',
            'Strategy': '#FF00FF',
            'Arcade': '#FFFF00'
        };
        
        const color = colors[category] || '#6842FF';
        return `data:image/svg+xml;base64,${btoa(`<svg width="280" height="180" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="280" height="180" fill="#333"/>
<text x="140" y="90" text-anchor="middle" fill="${color}" font-family="Arial" font-size="16" font-weight="bold">${category}</text>
</svg>`)}`;
    }

    async loadMoreGames() {
        if (!this.hasMoreGames || this.isLoadingMore) {
            return;
        }

        console.log('Loading more games...');
        this.currentPage++;
        
        // Show loading indicator
        this.showLoadingIndicator();
        
        try {
            await this.loadGames(this.currentPage, true);
            this.applyFilters(); // Re-apply current filters to include new games
            this.displayGames(true); // Pass true to append new games
        } catch (error) {
            console.error('Error loading more games:', error);
        } finally {
            this.hideLoadingIndicator();
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

    setupInfiniteScroll() {
        const content = document.querySelector('.content');
        if (!content) return;

        let scrollTimeout;
        
        content.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkScrollPosition();
            }, 100);
        });

        // Also listen to window scroll for cases where content doesn't scroll
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.checkScrollPosition();
            }, 100);
        });
    }

    checkScrollPosition() {
        if (!this.hasMoreGames || this.isLoadingMore || this.isMobile()) {
            return;
        }

        const scrollableElement = document.querySelector('.content') || document.documentElement;
        const scrollTop = scrollableElement.scrollTop || window.pageYOffset;
        const scrollHeight = scrollableElement.scrollHeight || document.documentElement.scrollHeight;
        const clientHeight = scrollableElement.clientHeight || window.innerHeight;

        // Load more when user scrolls to within 500px of the bottom
        const threshold = 500;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

        if (distanceFromBottom <= threshold) {
            console.log('Near bottom, loading more games...');
            this.loadMoreGames();
        }
    }

    displayGames(append = false) {
        const isMobile = this.isMobile();
        
        console.log('Display games called. Mobile:', isMobile, 'Width:', window.innerWidth);
        console.log('Games available:', this.games.length, 'Filtered games:', this.filteredGames.length);
        
        if (isMobile) {
            this.displayMobileLayout();
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
        } else {
            // Remove loading indicator if it exists
            this.hideLoadingIndicator();
        }

        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = '<div class="no-games">No games found matching your criteria.</div>';
            return;
        }

        if (append) {
            // When appending, only add games that aren't already displayed
            const existingGameIds = new Set();
            const existingCards = gamesGrid.querySelectorAll('.game-card[data-game-id]');
            existingCards.forEach(card => {
                existingGameIds.add(parseInt(card.dataset.gameId));
            });

            this.filteredGames.forEach(game => {
                if (!existingGameIds.has(game.id)) {
                    const gameCard = this.createGameCard(game);
                    gameCard.dataset.gameId = game.id;
                    gamesGrid.appendChild(gameCard);
                }
            });
        } else {
            // Full reload - display all games
            this.filteredGames.forEach(game => {
                const gameCard = this.createGameCard(game);
                gameCard.dataset.gameId = game.id;
                gamesGrid.appendChild(gameCard);
            });
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
        if (this.hasMoreGames && this.currentPage === 1) {
            this.createMobileLoadMoreSection();
        }
    }

    createMobileLoadMoreSection() {
        const mobileSections = document.getElementById('mobileCategorySections');
        
        const loadMoreSection = document.createElement('div');
        loadMoreSection.className = 'mobile-category-section mobile-load-more-section';
        loadMoreSection.id = 'mobileLoadMoreSection';
        
        loadMoreSection.innerHTML = `
            <div class="mobile-category-header">
                <h2 class="mobile-category-title">More Games Available</h2>
            </div>
            <div class="mobile-load-more-container">
                <p>Discover hundreds more games!</p>
                <button class="mobile-load-more-btn" id="mobileLoadMoreBtn">Load More Games</button>
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
        const gamePageUrl = `game-${game.id}-${gameSlug}.html`;
        
        // Check if the game page already exists
        try {
            const response = await fetch(gamePageUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log(`Game page already exists: ${gamePageUrl}`);
                // Page exists, navigate to it
                window.location.href = gamePageUrl;
                return;
            }
        } catch (error) {
            console.log(`Game page doesn't exist, will create: ${gamePageUrl}`);
        }
        
        // Page doesn't exist, generate it and create a downloadable HTML file
        await this.generateAndDownloadGamePage(game, gamePageUrl);
        
        // Track game play
        this.trackEvent('game_play', {
            game_id: game.id,
            game_title: game.title,
            game_category: game.category
        });
    }

    async generateAndDownloadGamePage(game, filename) {
        const gamePageHtml = this.createGamePageTemplate(game);
        
        // Create a blob with the HTML content
        const blob = new Blob([gamePageHtml], { type: 'text/html' });
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;
        
        // Add to DOM, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the blob URL
        URL.revokeObjectURL(downloadLink.href);
        
        console.log(`Game page ${filename} has been generated and downloaded`);
        
        // Show user a notification
        this.showGamePageNotification(game, filename);
    }

    showGamePageNotification(game, filename) {
        // Create a notification to inform the user
        const notification = document.createElement('div');
        notification.className = 'game-page-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>Game Page Generated!</h3>
                <p><strong>"${game.title}"</strong> page has been created as <code>${filename}</code></p>
                <p>The file has been downloaded. Open it in your browser to play the game!</p>
                <div class="notification-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-dismiss">Got it!</button>
                </div>
            </div>
        `;
        
        // Make notification mobile-responsive
        const isMobile = this.isMobile();
        notification.style.cssText = `
            position: fixed;
            top: ${isMobile ? '80px' : '20px'};
            right: ${isMobile ? '10px' : '20px'};
            left: ${isMobile ? '10px' : 'auto'};
            background: var(--black-300);
            border: 2px solid var(--brand-100);
            border-radius: var(--border-radius-lg);
            padding: var(--spacing-6);
            color: var(--white-100);
            z-index: 10000;
            max-width: ${isMobile ? 'none' : '400px'};
            box-shadow: var(--shadow-xl);
            animation: slideInRight 0.3s ease;
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-content h3 {
                color: var(--brand-100);
                margin-bottom: var(--spacing-3);
            }
            .notification-content p {
                margin-bottom: var(--spacing-3);
                line-height: 1.5;
            }
            .notification-content code {
                background: var(--black-400);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
                color: var(--brand-100);
            }
            .notification-actions {
                text-align: right;
                margin-top: var(--spacing-4);
            }
            .btn-dismiss {
                background: var(--brand-100);
                color: var(--white-100);
                border: none;
                padding: var(--spacing-2) var(--spacing-4);
                border-radius: var(--border-radius-pill);
                font-weight: var(--font-weight-bold);
                cursor: pointer;
                transition: all var(--transition-normal);
            }
            .btn-dismiss:hover {
                background: var(--brand-200);
                transform: translateY(-1px);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    generateGameSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }


    createGamePageTemplate(game) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play ${game.title} - SuperGames</title>
    <meta name="description" content="Play ${game.title} online for free. ${game.description}">
    <meta name="keywords" content="${game.title}, ${game.category} game, online games, free games">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="Play ${game.title} - SuperGames">
    <meta property="og:description" content="${game.description}">
    <meta property="og:image" content="${game.thumb}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="Play ${game.title} - SuperGames">
    <meta property="twitter:description" content="${game.description}">
    <meta property="twitter:image" content="${game.thumb}">
    
    <!-- Preload fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="styles.css">
    
    <style>
        .game-page {
            min-height: 100vh;
            background: var(--black-100);
            padding-top: var(--header-height);
        }
        
        .game-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: var(--spacing-6);
        }
        
        .game-header {
            text-align: center;
            margin-bottom: var(--spacing-8);
        }
        
        .game-title {
            font-size: 3rem;
            font-weight: var(--font-weight-black);
            color: var(--brand-100);
            margin-bottom: var(--spacing-4);
            background: linear-gradient(45deg, var(--brand-100), var(--brand-200));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .game-meta {
            display: flex;
            justify-content: center;
            gap: var(--spacing-6);
            margin-bottom: var(--spacing-6);
        }
        
        .game-category {
            background: var(--brand-100);
            color: var(--white-100);
            padding: var(--spacing-2) var(--spacing-4);
            border-radius: var(--border-radius-pill);
            font-weight: var(--font-weight-bold);
        }
        
        .game-description {
            font-size: var(--font-size-large);
            color: var(--white-200);
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .game-frame-container {
            position: relative;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            background: var(--black-300);
            border-radius: var(--border-radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }
        
        .game-frame {
            width: 100%;
            height: 600px;
            border: none;
            display: block;
        }
        
        .game-controls {
            display: flex;
            justify-content: center;
            gap: var(--spacing-4);
            margin-top: var(--spacing-6);
        }
        
        .btn-back {
            background: var(--black-400);
            color: var(--white-100);
            padding: var(--spacing-3) var(--spacing-6);
            border: 2px solid var(--black-400);
            border-radius: var(--border-radius-pill);
            font-weight: var(--font-weight-bold);
            text-decoration: none;
            transition: all var(--transition-normal);
        }
        
        .btn-back:hover {
            background: var(--brand-100);
            border-color: var(--brand-100);
            color: var(--white-100);
        }
        
        .fullscreen-btn {
            background: var(--brand-100);
            color: var(--white-100);
            border: none;
            padding: var(--spacing-3) var(--spacing-6);
            border-radius: var(--border-radius-pill);
            font-weight: var(--font-weight-bold);
            cursor: pointer;
            transition: all var(--transition-normal);
        }
        
        .fullscreen-btn:hover {
            background: var(--brand-200);
            transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
            .game-container {
                padding: var(--spacing-4);
            }
            
            .game-title {
                font-size: 2rem;
            }
            
            .game-meta {
                flex-direction: column;
                align-items: center;
                gap: var(--spacing-3);
            }
            
            .game-frame {
                height: 400px;
            }
            
            .game-controls {
                flex-direction: column;
                align-items: center;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-left">
                <div class="nav-logo">
                    <a href="/">
                        <h1>SuperGames</h1>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="game-page">
        <div class="game-container">
            <header class="game-header">
                <h1 class="game-title">${game.title}</h1>
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
                <a href="/" class="btn-back">← Back to Games</a>
                <button class="fullscreen-btn" onclick="toggleFullscreen()">Fullscreen</button>
            </div>
        </div>
    </div>

    <script>
        function toggleFullscreen() {
            const frame = document.querySelector('.game-frame');
            if (frame.requestFullscreen) {
                frame.requestFullscreen();
            } else if (frame.webkitRequestFullscreen) {
                frame.webkitRequestFullscreen();
            } else if (frame.msRequestFullscreen) {
                frame.msRequestFullscreen();
            }
        }
        
        // Track page view
        console.log('Game page loaded: ${game.title}');
        
        // Simple analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Play ${game.title}',
                page_location: window.location.href
            });
        }
    </script>
</body>
</html>`;
    }



    filterByCategory(category) {
        this.currentCategory = category;
        
        // Reset pagination when changing filters
        this.currentPage = 1;
        this.hasMoreGames = true;
        
        this.applyFilters();
        this.updateActiveCategory(category);
        this.displayGames(false); // Full reload
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