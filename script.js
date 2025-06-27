class GamePortal {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadGames();
        this.setupEventListeners();
        this.displayGames();
    }

    async loadGames() {
        try {
            const response = await fetch('https://gamemonetize.com/feed.php?format=0&num=100&page=1');
            const data = await response.json();
            this.games = data;
            this.filteredGames = data;
            document.getElementById('loading').style.display = 'none';
        } catch (error) {
            console.error('Error loading games:', error);
            document.getElementById('loading').innerHTML = 'Error loading games. Please try again later.';
        }
    }

    displayGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        gamesGrid.innerHTML = '';

        this.filteredGames.forEach(game => {
            const gameCard = this.createGameCard(game);
            gamesGrid.appendChild(gameCard);
        });
    }

    createGameCard(game) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => this.openGameModal(game);

        card.innerHTML = `
            <img src="${game.thumb}" alt="${game.title}" class="game-thumb" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI4MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjE0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-category">${game.category}</div>
                <p class="game-description">${game.description}</p>
            </div>
        `;

        return card;
    }

    openGameModal(game) {
        const modal = document.getElementById('gameModal');
        const gameFrame = document.getElementById('gameFrame');
        const modalTitle = document.getElementById('modalGameTitle');

        modalTitle.textContent = game.title;
        gameFrame.src = game.url;
        gameFrame.width = game.width || '800';
        gameFrame.height = game.height || '600';
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeGameModal() {
        const modal = document.getElementById('gameModal');
        const gameFrame = document.getElementById('gameFrame');
        
        modal.style.display = 'none';
        gameFrame.src = '';
        document.body.style.overflow = 'auto';
    }

    filterByCategory(category) {
        this.currentCategory = category;
        
        if (category === 'all') {
            this.filteredGames = this.games;
        } else {
            this.filteredGames = this.games.filter(game => 
                game.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        this.displayGames();
        this.updateActiveCategory(category);
    }

    searchGames(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        let gamesToFilter = this.currentCategory === 'all' ? this.games : 
            this.games.filter(game => game.category.toLowerCase() === this.currentCategory.toLowerCase());
        
        this.filteredGames = gamesToFilter.filter(game =>
            game.title.toLowerCase().includes(term) ||
            game.description.toLowerCase().includes(term) ||
            game.category.toLowerCase().includes(term) ||
            (game.tags && game.tags.toLowerCase().includes(term))
        );
        
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
        searchInput.addEventListener('input', (e) => {
            this.searchGames(e.target.value);
        });

        // Modal close functionality
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeGameModal();
        });

        // Close modal when clicking outside
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target.id === 'gameModal') {
                this.closeGameModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeGameModal();
            }
        });
    }
}

// Initialize the game portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GamePortal();
});