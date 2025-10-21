/**
 * Kloopik Gaming Portal - Safe DOM Helper Utilities
 * Provides safe methods to create DOM elements without XSS vulnerabilities
 * Replaces innerHTML usage throughout the application
 */

class DOMHelper {
    /**
     * Create an element with optional classes and attributes
     */
    static createElement(tag, options = {}) {
        const element = document.createElement(tag);

        // Add classes
        if (options.className) {
            if (Array.isArray(options.className)) {
                element.classList.add(...options.className);
            } else {
                element.className = options.className;
            }
        }

        // Add attributes
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    element.setAttribute(key, value);
                }
            });
        }

        // Add data attributes
        if (options.data) {
            Object.entries(options.data).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }

        // Set text content (safe from XSS)
        if (options.text) {
            element.textContent = options.text;
        }

        // Set HTML content (only if explicitly allowed and sanitized)
        if (options.html && options.allowHTML) {
            element.innerHTML = Sanitizer.sanitizeHtml(options.html);
        }

        // Add children
        if (options.children) {
            if (Array.isArray(options.children)) {
                options.children.forEach(child => {
                    if (child instanceof Node) {
                        element.appendChild(child);
                    }
                });
            } else if (options.children instanceof Node) {
                element.appendChild(options.children);
            }
        }

        // Add event listeners
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        return element;
    }

    /**
     * Create a game card element safely
     */
    static createGameCard(game, isFavorite = false, onClick, onFavoriteClick) {
        const card = this.createElement('div', {
            className: 'game-card',
            data: {
                gameId: game.id,
                gameSlug: game.slug
            }
        });

        // Get thumbnail
        const thumbnail = window.gamesManager ?
            window.gamesManager.getGameThumbnail(game) :
            (game.images && game.images[0]) || '';

        // Create image
        const img = this.createElement('img', {
            className: 'game-card-image',
            attributes: {
                src: thumbnail,
                alt: game.title || 'Game',
                loading: 'lazy',
                width: '200',
                height: '150',
                decoding: 'async'
            }
        });

        // Image error handling
        img.onerror = function() {
            if (window.gamesManager) {
                this.src = window.gamesManager.generatePlaceholderImage(game.title);
            }
        };

        card.appendChild(img);

        // Create overlay
        const overlay = this.createElement('div', {
            className: 'game-card-overlay'
        });

        // Create title (safe from XSS - using textContent)
        const title = this.createElement('h3', {
            className: 'game-card-title',
            text: game.title || 'Untitled Game'
        });

        overlay.appendChild(title);
        card.appendChild(overlay);

        // Create favorite button
        const favoriteBtn = this.createFavoriteButton(game.id, isFavorite);

        // Add event listeners
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onFavoriteClick) onFavoriteClick(e);
        });

        card.appendChild(favoriteBtn);

        // Card click event
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.game-card-favorite')) {
                if (onClick) onClick(e);
            }
        });

        return card;
    }

    /**
     * Create a favorite button SVG icon
     */
    static createFavoriteButton(gameId, isFavorite = false) {
        const button = this.createElement('button', {
            className: `game-card-favorite ${isFavorite ? 'is-favorite' : ''}`,
            data: {
                gameId: gameId
            },
            attributes: {
                'aria-label': isFavorite ? 'Remove from favorites' : 'Add to favorites',
                type: 'button'
            }
        });

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '18');
        svg.setAttribute('height', '18');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');

        svg.appendChild(path);
        button.appendChild(svg);

        return button;
    }

    /**
     * Create a category row safely
     */
    static createCategoryRow(category, games) {
        const section = this.createElement('section', {
            className: 'category-section',
            data: {
                category: category
            }
        });

        // Create header
        const header = this.createElement('div', {
            className: 'category-header'
        });

        const categoryTitle = this.createElement('h2', {
            className: 'category-title',
            text: category.charAt(0).toUpperCase() + category.slice(1)
        });

        const gamesCount = this.createElement('span', {
            className: 'category-count',
            text: `${games.length} games`
        });

        header.appendChild(categoryTitle);
        header.appendChild(gamesCount);
        section.appendChild(header);

        // Create carousel
        const carousel = this.createElement('div', {
            className: 'category-carousel'
        });

        const carouselTrack = this.createElement('div', {
            className: 'carousel-track'
        });

        // Add game cards
        games.forEach(game => {
            const isFavorite = window.storageManager ?
                window.storageManager.isFavorite(game.id) : false;

            const card = this.createGameCard(
                game,
                isFavorite,
                () => {
                    if (window.kloopikApp) {
                        window.kloopikApp.openGame(game);
                    }
                },
                () => {
                    if (window.kloopikApp) {
                        window.kloopikApp.toggleFavorite(game.id);
                    }
                }
            );
            carouselTrack.appendChild(card);
        });

        carousel.appendChild(carouselTrack);
        section.appendChild(carousel);

        return section;
    }

    /**
     * Create sidebar category item
     */
    static createSidebarItem(category, isActive = false) {
        const item = this.createElement('div', {
            className: `sidebar-item ${isActive ? 'active' : ''}`,
            data: {
                category: category
            }
        });

        // Create icon div
        const icon = this.createElement('div', {
            className: 'sidebar-item-icon',
            text: '🎮'
        });

        // Create text
        const text = this.createElement('span', {
            className: 'sidebar-item-text',
            text: category.charAt(0).toUpperCase() + category.slice(1)
        });

        item.appendChild(icon);
        item.appendChild(text);

        return item;
    }

    /**
     * Create empty state message
     */
    static createEmptyState(message = 'No games found') {
        const container = this.createElement('div', {
            className: 'empty-state-container'
        });

        const icon = this.createElement('div', {
            className: 'empty-state-icon',
            text: '🎮'
        });

        const text = this.createElement('p', {
            className: 'empty-state-text',
            text: message
        });

        const suggestion = this.createElement('p', {
            className: 'empty-state-suggestion',
            text: 'Try adjusting your search or browse all games'
        });

        container.appendChild(icon);
        container.appendChild(text);
        container.appendChild(suggestion);

        return container;
    }

    /**
     * Clear all children from an element
     */
    static clearElement(element) {
        if (element) {
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
        }
    }

    /**
     * Safely set text content
     */
    static setText(element, text) {
        if (element) {
            element.textContent = text || '';
        }
    }

    /**
     * Safely append multiple children
     */
    static appendChildren(parent, children) {
        if (!parent) return;

        if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof Node) {
                    parent.appendChild(child);
                }
            });
        } else if (children instanceof Node) {
            parent.appendChild(children);
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DOMHelper = DOMHelper;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMHelper;
}
