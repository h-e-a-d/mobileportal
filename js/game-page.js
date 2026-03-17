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

        // Setup iframe error handling
        this.setupIframeErrorHandling();

        // Setup image error handling for all images on the page
        this.setupImageErrorHandling();
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

    setupIframeErrorHandling() {
        if (!this.gameIframe) return;

        // Monitor iframe load status
        let loadTimeout;
        let hasLoaded = false;

        // Set a timeout to detect if the iframe fails to load
        loadTimeout = setTimeout(() => {
            if (!hasLoaded) {
                console.warn('[GamePage] Game iframe may have failed to load');
                this.showIframeError();
            }
        }, 10000); // 10 second timeout

        // Listen for iframe load success
        this.gameIframe.addEventListener('load', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            console.log('[GamePage] Game iframe loaded successfully');
        });

        // Listen for iframe error
        this.gameIframe.addEventListener('error', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            console.error('[GamePage] Game iframe failed to load');
            this.showIframeError();
        });
    }

    showIframeError() {
        // Create error message overlay
        const container = this.gameIframe?.closest('.game-container');
        if (!container) return;

        // Check if error already shown
        if (container.querySelector('.iframe-error-message')) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'iframe-error-message';
        errorDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            z-index: 1000;
            max-width: 400px;
        `;

        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 1rem 0;">Game Loading Issue</h3>
            <p style="margin: 0 0 1rem 0;">The game may be temporarily unavailable or experiencing issues.</p>
            <button onclick="location.reload()" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            ">Try Again</button>
            <a href="/" style="
                display: block;
                margin-top: 1rem;
                color: #a0a0ff;
                text-decoration: none;
            ">Return to Home</a>
        `;

        container.style.position = 'relative';
        container.appendChild(errorDiv);
    }

    setupImageErrorHandling() {
        // Add error handling to all images on the page
        const images = document.querySelectorAll('img[src*="playgama.com"]');

        images.forEach(img => {
            // Skip if already has error handler
            if (img.dataset.errorHandled) return;

            img.dataset.errorHandled = 'true';

            let retryCount = 0;
            const maxRetries = 2;
            const originalSrc = img.src;

            img.onerror = function() {
                // Retry loading the image
                if (retryCount < maxRetries && originalSrc && !originalSrc.startsWith('data:')) {
                    retryCount++;
                    const separator = originalSrc.includes('?') ? '&' : '?';
                    this.src = `${originalSrc}${separator}retry=${retryCount}`;
                    console.log('[GamePage] Retrying image load:', originalSrc, 'attempt:', retryCount);
                    return;
                }

                // After retries, use placeholder
                const title = img.alt || 'Game';
                const initial = title[0].toUpperCase();
                const colors = ['#ff6b35', '#4a90e2', '#9b59b6', '#e74c3c', '#2ecc71'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="${color}"/><text x="50%" y="50%" font-family="Arial" font-size="120" fill="white" text-anchor="middle" dy=".3em">${initial}</text></svg>`;
                this.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;

                console.warn('[GamePage] Image load failed after retries, using placeholder:', originalSrc);
            };
        });
    }
}

// Initialize game page
const gamePage = new GamePage();

// Expose to window for debugging
window.gamePage = gamePage;
