/**
 * Ratings & Reviews Module
 * Handles game ratings and user reviews stored in localStorage
 */

class RatingsManager {
    constructor() {
        this.RATINGS_KEY = 'kloopik_ratings';
        this.REVIEWS_KEY = 'kloopik_reviews';
        this.REVIEW_MAX_LENGTH = 200;
        this.ratingsCache = null;
        this.reviewsCache = null;
    }

    /**
     * Initialize - load data into cache
     */
    init() {
        this.ratingsCache = this._loadRatings();
        this.reviewsCache = this._loadReviews();
    }

    /**
     * Load ratings from localStorage
     */
    _loadRatings() {
        try {
            const data = localStorage.getItem(this.RATINGS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[Ratings] Error loading ratings:', error);
            return {};
        }
    }

    /**
     * Load reviews from localStorage
     */
    _loadReviews() {
        try {
            const data = localStorage.getItem(this.REVIEWS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[Ratings] Error loading reviews:', error);
            return {};
        }
    }

    /**
     * Save ratings to localStorage
     */
    _saveRatings() {
        try {
            localStorage.setItem(this.RATINGS_KEY, JSON.stringify(this.ratingsCache));
            return true;
        } catch (error) {
            console.error('[Ratings] Error saving ratings:', error);
            return false;
        }
    }

    /**
     * Save reviews to localStorage
     */
    _saveReviews() {
        try {
            localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(this.reviewsCache));
            return true;
        } catch (error) {
            console.error('[Ratings] Error saving reviews:', error);
            return false;
        }
    }

    /**
     * Rate a game (1-5 stars)
     */
    rateGame(gameId, rating) {
        if (!gameId || rating < 1 || rating > 5) {
            console.error('[Ratings] Invalid rating parameters');
            return false;
        }

        const validId = String(gameId);

        if (!this.ratingsCache[validId]) {
            this.ratingsCache[validId] = {
                userRating: rating,
                timestamp: Date.now(),
                totalRatings: 1,
                sumRatings: rating
            };
        } else {
            // Update existing rating
            const oldRating = this.ratingsCache[validId].userRating || 0;
            this.ratingsCache[validId].userRating = rating;
            this.ratingsCache[validId].timestamp = Date.now();

            // Update aggregate (simulate multi-user for demo)
            if (oldRating > 0) {
                this.ratingsCache[validId].sumRatings += (rating - oldRating);
            } else {
                this.ratingsCache[validId].totalRatings++;
                this.ratingsCache[validId].sumRatings += rating;
            }
        }

        this._saveRatings();

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('game_rated', {
                gameId: validId,
                rating: rating
            });
        }

        return true;
    }

    /**
     * Get user's rating for a game
     */
    getUserRating(gameId) {
        const validId = String(gameId);
        return this.ratingsCache[validId]?.userRating || 0;
    }

    /**
     * Get average rating for a game
     */
    getAverageRating(gameId) {
        const validId = String(gameId);
        const data = this.ratingsCache[validId];

        if (!data || !data.totalRatings) {
            return 0;
        }

        return (data.sumRatings / data.totalRatings).toFixed(1);
    }

    /**
     * Get total rating count for a game
     */
    getRatingCount(gameId) {
        const validId = String(gameId);
        return this.ratingsCache[validId]?.totalRatings || 0;
    }

    /**
     * Add a review for a game
     */
    addReview(gameId, reviewText, rating = null) {
        if (!gameId || !reviewText) {
            console.error('[Ratings] Invalid review parameters');
            return false;
        }

        const validId = String(gameId);
        const trimmedText = reviewText.trim().substring(0, this.REVIEW_MAX_LENGTH);

        if (trimmedText.length === 0) {
            return false;
        }

        if (!this.reviewsCache[validId]) {
            this.reviewsCache[validId] = [];
        }

        const review = {
            id: this._generateReviewId(),
            text: trimmedText,
            rating: rating,
            timestamp: Date.now(),
            helpful: 0,
            reported: false
        };

        this.reviewsCache[validId].push(review);
        this._saveReviews();

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('review_added', {
                gameId: validId,
                reviewLength: trimmedText.length
            });
        }

        return review;
    }

    /**
     * Get reviews for a game
     */
    getReviews(gameId, limit = 10) {
        const validId = String(gameId);
        const reviews = this.reviewsCache[validId] || [];

        // Sort by helpful count, then by timestamp
        return reviews
            .filter(r => !r.reported)
            .sort((a, b) => {
                if (b.helpful !== a.helpful) {
                    return b.helpful - a.helpful;
                }
                return b.timestamp - a.timestamp;
            })
            .slice(0, limit);
    }

    /**
     * Mark review as helpful
     */
    markReviewHelpful(gameId, reviewId) {
        const validId = String(gameId);
        const reviews = this.reviewsCache[validId];

        if (!reviews) return false;

        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            review.helpful = (review.helpful || 0) + 1;
            this._saveReviews();
            return true;
        }

        return false;
    }

    /**
     * Report a review
     */
    reportReview(gameId, reviewId) {
        const validId = String(gameId);
        const reviews = this.reviewsCache[validId];

        if (!reviews) return false;

        const review = reviews.find(r => r.id === reviewId);
        if (review) {
            review.reported = true;
            this._saveReviews();
            return true;
        }

        return false;
    }

    /**
     * Get top rated games
     */
    getTopRatedGames(limit = 10, minRatings = 3) {
        const topGames = [];

        for (const [gameId, data] of Object.entries(this.ratingsCache)) {
            if (data.totalRatings >= minRatings) {
                topGames.push({
                    gameId: gameId,
                    avgRating: data.sumRatings / data.totalRatings,
                    totalRatings: data.totalRatings
                });
            }
        }

        return topGames
            .sort((a, b) => {
                // Sort by average rating, then by total ratings
                if (Math.abs(b.avgRating - a.avgRating) < 0.1) {
                    return b.totalRatings - a.totalRatings;
                }
                return b.avgRating - a.avgRating;
            })
            .slice(0, limit);
    }

    /**
     * Get rating statistics
     */
    getRatingStats(gameId) {
        const validId = String(gameId);
        const data = this.ratingsCache[validId];

        if (!data) {
            return {
                average: 0,
                total: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }

        // For now, distribution is simplified (would need backend for real data)
        return {
            average: (data.sumRatings / data.totalRatings).toFixed(1),
            total: data.totalRatings,
            userRating: data.userRating || 0
        };
    }

    /**
     * Generate unique review ID
     */
    _generateReviewId() {
        return `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export ratings data
     */
    exportData() {
        return {
            ratings: this.ratingsCache,
            reviews: this.reviewsCache,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import ratings data
     */
    importData(data) {
        try {
            if (data.ratings) {
                this.ratingsCache = data.ratings;
                this._saveRatings();
            }
            if (data.reviews) {
                this.reviewsCache = data.reviews;
                this._saveReviews();
            }
            return true;
        } catch (error) {
            console.error('[Ratings] Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all ratings and reviews
     */
    clearAllData() {
        this.ratingsCache = {};
        this.reviewsCache = {};
        localStorage.removeItem(this.RATINGS_KEY);
        localStorage.removeItem(this.REVIEWS_KEY);
        return true;
    }
}

// Create global instance
const ratingsManager = new RatingsManager();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ratingsManager.init());
} else {
    ratingsManager.init();
}
