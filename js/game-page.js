/**
 * Game Page JavaScript
 * Handles game page functionality including favorites, fullscreen, and interactions
 */

class GamePage {
    constructor() {
        this.gameId = null;
        this.gameSlug = null;
        this.gameIframe = null;
        this.favoriteBtn = null;
        this.fullscreenBtn = null;

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get elements
        this.gameIframe = document.getElementById('game-iframe');
        this.favoriteBtn = document.querySelector('.favorite-btn');
        this.fullscreenBtn = document.querySelector('.fullscreen-btn');

        // Get game data from button
        if (this.favoriteBtn) {
            this.gameId = this.favoriteBtn.dataset.gameId;
            this.gameSlug = window.location.pathname.split('/').filter(Boolean).pop();
        }

        // Setup event listeners
        this.setupEventListeners();

        // Initialize favorite state
        this.updateFavoriteButton();

        // Track page view
        this.trackPageView();

        // Add to recently played
        this.addToRecentlyPlayed();
    }

    setupEventListeners() {
        // Favorite button
        if (this.favoriteBtn) {
            this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        // Fullscreen button
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    toggleFavorite() {
        if (!this.gameId) return;

        const isFavorite = storageManager.isFavorite(this.gameId);

        if (isFavorite) {
            storageManager.removeFavorite(this.gameId);
        } else {
            storageManager.addFavorite(this.gameId);
        }

        this.updateFavoriteButton();

        // Track event
        if (typeof gtag !== 'undefined') {
            gtag('event', isFavorite ? 'remove_favorite' : 'add_favorite', {
                game_id: this.gameId,
                game_slug: this.gameSlug
            });
        }
    }

    updateFavoriteButton() {
        if (!this.favoriteBtn || !this.gameId) return;

        const isFavorite = storageManager.isFavorite(this.gameId);

        if (isFavorite) {
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.querySelector('span').textContent = 'Favorited';
        } else {
            this.favoriteBtn.classList.remove('active');
            this.favoriteBtn.querySelector('span').textContent = 'Favorite';
        }
    }

    toggleFullscreen() {
        const container = this.gameIframe?.closest('.game-player');
        if (!container) return;

        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.mozRequestFullScreen) {
                container.mozRequestFullScreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    onFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement ||
                               document.webkitFullscreenElement ||
                               document.mozFullScreenElement ||
                               document.msFullscreenElement);

        if (this.fullscreenBtn) {
            this.fullscreenBtn.querySelector('span').textContent =
                isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
        }
    }

    handleKeyboard(e) {
        // F key for fullscreen
        if (e.key === 'f' || e.key === 'F') {
            if (!this.isTyping(e)) {
                e.preventDefault();
                this.toggleFullscreen();
            }
        }
    }

    isTyping(e) {
        const target = e.target;
        return target.tagName === 'INPUT' ||
               target.tagName === 'TEXTAREA' ||
               target.isContentEditable;
    }

    addToRecentlyPlayed() {
        if (!this.gameId) return;
        storageManager.addRecentlyPlayed(this.gameId);
    }

    trackPageView() {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });

            gtag('event', 'game_view', {
                game_id: this.gameId,
                game_slug: this.gameSlug,
                game_title: document.querySelector('h1')?.textContent
            });
        }
    }
}

// Initialize game page
const gamePage = new GamePage();

// Expose to window for debugging
window.gamePage = gamePage;
