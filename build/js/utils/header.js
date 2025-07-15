/**
 * Global header utilities
 */
class HeaderManager {
    constructor() {
        this.searchInput = null;
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('searchInput');
        if (this.searchInput) {
            this.setupSearch();
        }
    }

    setupSearch() {
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm.length > 2) {
                this.performSearch(searchTerm);
            }
        });

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm.length > 0) {
                    // Redirect to home page with search query
                    window.location.href = `../../index.html?search=${encodeURIComponent(searchTerm)}`;
                }
            }
        });
    }

    performSearch(searchTerm) {
        // Simple search suggestion (can be enhanced)
        console.log('Searching for:', searchTerm);
        
        // Track search analytics
        if (window.analytics) {
            window.analytics.trackSearch(searchTerm);
        }
    }
}

// Initialize header manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HeaderManager();
});