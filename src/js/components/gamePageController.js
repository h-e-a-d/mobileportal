/**
 * Game Page Controller
 * Handles individual game page functionality
 */
class GamePageController {
    constructor(options = {}) {
        this.gameTitle = options.gameTitle || '';
        this.gameCategory = options.gameCategory || '';
        this.gameSlug = options.gameSlug || '';
        this.locale = options.locale || 'en';
        
        this.isFullscreen = false;
        this.relatedGames = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRelatedGames();
        this.trackGameView();
        this.setupAudioContext();
    }

    setupEventListeners() {
        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Share button
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.openShareModal());
        }

        // Game frame load handling
        const gameFrame = document.getElementById('gameFrame');
        if (gameFrame) {
            gameFrame.addEventListener('load', () => this.onGameLoad());
            gameFrame.addEventListener('error', () => this.onGameError());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());
    }

    toggleFullscreen() {
        const gameContainer = document.querySelector('.game-frame-container');
        
        if (!this.isFullscreen) {
            this.enterFullscreen(gameContainer);
        } else {
            this.exitFullscreen();
        }
    }

    enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        element.classList.add('fullscreen-mode');
        this.isFullscreen = true;
        
        // Add exit button
        this.addFullscreenExitButton(element);
        
        // Track fullscreen event
        this.trackEvent('fullscreen_enter');
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        const gameContainer = document.querySelector('.game-frame-container');
        gameContainer.classList.remove('fullscreen-mode');
        this.isFullscreen = false;
        
        // Remove exit button
        this.removeFullscreenExitButton();
        
        // Track fullscreen event
        this.trackEvent('fullscreen_exit');
    }

    addFullscreenExitButton(container) {
        const exitBtn = document.createElement('button');
        exitBtn.className = 'fullscreen-exit';
        exitBtn.innerHTML = '×';
        exitBtn.title = 'Exit Fullscreen';
        exitBtn.addEventListener('click', () => this.exitFullscreen());
        container.appendChild(exitBtn);
    }

    removeFullscreenExitButton() {
        const exitBtn = document.querySelector('.fullscreen-exit');
        if (exitBtn) {
            exitBtn.remove();
        }
    }

    onFullscreenChange() {
        const gameContainer = document.querySelector('.game-frame-container');
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            gameContainer.classList.remove('fullscreen-mode');
            this.isFullscreen = false;
            this.removeFullscreenExitButton();
        }
    }

    openShareModal() {
        // Create share modal if it doesn't exist
        if (!document.getElementById('shareModal')) {
            this.createShareModal();
        }
        
        const shareModal = document.getElementById('shareModal');
        shareModal.classList.add('active');
        
        // Track share event
        this.trackEvent('share_modal_open');
    }

    createShareModal() {
        const modal = document.createElement('div');
        modal.id = 'shareModal';
        modal.className = 'share-modal';
        
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const encodedTitle = encodeURIComponent(this.gameTitle);
        
        modal.innerHTML = `
            <div class="share-modal-content">
                <h3>Share This Game</h3>
                <div class="share-buttons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" 
                       target="_blank" class="share-btn facebook">
                        Facebook
                    </a>
                    <a href="https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}" 
                       target="_blank" class="share-btn twitter">
                        Twitter
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}" 
                       target="_blank" class="share-btn linkedin">
                        LinkedIn
                    </a>
                    <button class="share-btn copy" onclick="gamePageController.copyToClipboard('${currentUrl}')">
                        Copy Link
                    </button>
                </div>
                <div class="share-url">
                    <input type="text" id="shareUrl" value="${currentUrl}" readonly>
                    <button onclick="gamePageController.copyToClipboard('${currentUrl}')">Copy</button>
                </div>
                <div class="text-center">
                    <button class="btn btn-secondary" onclick="gamePageController.closeShareModal()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeShareModal();
            }
        });
    }

    closeShareModal() {
        const shareModal = document.getElementById('shareModal');
        if (shareModal) {
            shareModal.classList.remove('active');
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Link copied to clipboard!');
            this.trackEvent('share_copy');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.showNotification('Failed to copy link', 'error');
        });
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        `;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'f':
            case 'F':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.toggleFullscreen();
                }
                break;
            case 'Escape':
                if (this.isFullscreen) {
                    this.exitFullscreen();
                }
                if (document.getElementById('shareModal')?.classList.contains('active')) {
                    this.closeShareModal();
                }
                break;
        }
    }

    onGameLoad() {
        const loading = document.getElementById('gameLoading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Track game load
        this.trackEvent('game_load');
    }

    onGameError() {
        const loading = document.getElementById('gameLoading');
        if (loading) {
            loading.innerHTML = '<div class="error-message">Failed to load game. Please try again later.</div>';
        }
        
        // Track game error
        this.trackEvent('game_error');
    }

    async loadRelatedGames() {
        try {
            // In a real implementation, this would fetch related games from an API
            // For now, we'll simulate with a timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const relatedGamesContainer = document.getElementById('relatedGames');
            if (relatedGamesContainer) {
                relatedGamesContainer.innerHTML = this.generateRelatedGamesHTML();
            }
        } catch (error) {
            console.error('Failed to load related games:', error);
        }
    }

    generateRelatedGamesHTML() {
        // Mock related games data
        const mockGames = [
            {
                title: 'Similar Game 1',
                category: this.gameCategory,
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkdhbWU8L3RleHQ+Cjwvc3ZnPg==',
                slug: 'similar-game-1'
            },
            {
                title: 'Similar Game 2',
                category: this.gameCategory,
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkdhbWU8L3RleHQ+Cjwvc3ZnPg==',
                slug: 'similar-game-2'
            },
            {
                title: 'Similar Game 3',
                category: this.gameCategory,
                thumb: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyMCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIiBmb250LXNpemU9IjEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkdhbWU8L3RleHQ+Cjwvc3ZnPg==',
                slug: 'similar-game-3'
            }
        ];

        return mockGames.map(game => `
            <div class="related-game-card" onclick="window.location.href='${game.slug}-${this.locale}.html'">
                <img src="${game.thumb}" alt="${game.title}" class="related-game-thumb">
                <div class="related-game-info">
                    <div class="related-game-title">${game.title}</div>
                    <div class="related-game-category">${game.category}</div>
                </div>
            </div>
        `).join('');
    }

    trackGameView() {
        // Track page view
        this.trackEvent('game_view');
    }

    setupAudioContext() {
        // Handle AudioContext warnings by enabling audio on first user interaction
        let audioEnabled = false;
        
        const enableAudio = () => {
            if (!audioEnabled) {
                try {
                    // Try to resume any suspended audio contexts
                    const gameFrame = document.getElementById('gameFrame');
                    if (gameFrame && gameFrame.contentWindow) {
                        gameFrame.contentWindow.postMessage({
                            type: 'ENABLE_AUDIO',
                            action: 'resume'
                        }, '*');
                    }
                    audioEnabled = true;
                } catch (error) {
                    console.log('Audio context handling:', error);
                }
            }
        };

        // Listen for user interactions to enable audio
        const userInteractionEvents = ['click', 'touchstart', 'keydown'];
        userInteractionEvents.forEach(eventType => {
            document.addEventListener(eventType, enableAudio, { once: true });
        });
    }

    trackEvent(eventName, parameters = {}) {
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                game_title: this.gameTitle,
                game_category: this.gameCategory,
                game_slug: this.gameSlug,
                page_location: window.location.href,
                ...parameters
            });
        }

        // Custom tracking (can be extended for other analytics platforms)
        console.log(`Track event: ${eventName}`, {
            gameTitle: this.gameTitle,
            gameCategory: this.gameCategory,
            gameSlug: this.gameSlug,
            ...parameters
        });
    }
}

// Make gamePageController available globally for onclick handlers
window.gamePageController = null;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Controller will be initialized from the game page template
});