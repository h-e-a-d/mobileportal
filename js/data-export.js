/**
 * Data Export & Deletion - GDPR Compliance
 * Allows users to export and delete their personal data
 */

class DataExport {
    /**
     * Export all user data as JSON file
     */
    static exportUserData() {
        try {
            const userData = {
                exported_at: new Date().toISOString(),
                website: 'Kloopik - www.kloopik.com',
                data_version: '1.0',

                // Game preferences
                favorites: this.getFavorites(),
                recent_games: this.getRecentlyPlayed(),

                // Cookie consent
                cookie_consent: this.getCookieConsent(),

                // Browser information (for reference)
                browser_info: {
                    user_agent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform
                },

                // Note about third-party data
                third_party_note: 'This export contains only data stored locally in your browser. For data collected by Google Analytics, please contact privacy@kloopik.com'
            };

            // Create downloadable JSON file
            const blob = new Blob([JSON.stringify(userData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `kloopik-data-export-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);

            console.log('[DataExport] User data exported successfully');

            // Show confirmation
            this.showNotification('Your data has been downloaded successfully!', 'success');

            return true;
        } catch (error) {
            console.error('[DataExport] Error exporting data:', error);
            this.showNotification('Error exporting data. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Get favorites data
     */
    static getFavorites() {
        try {
            const favorites = localStorage.getItem('kloopik_favorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (error) {
            console.error('[DataExport] Error getting favorites:', error);
            return [];
        }
    }

    /**
     * Get recently played games
     */
    static getRecentlyPlayed() {
        try {
            const recent = localStorage.getItem('kloopik_recent');
            return recent ? JSON.parse(recent) : [];
        } catch (error) {
            console.error('[DataExport] Error getting recent games:', error);
            return [];
        }
    }

    /**
     * Get cookie consent preferences
     */
    static getCookieConsent() {
        try {
            const consent = localStorage.getItem('kloopik_cookie_consent');
            const preferences = localStorage.getItem('kloopik_cookie_preferences');

            return {
                consent_given: consent || 'not_set',
                preferences: preferences ? JSON.parse(preferences) : null
            };
        } catch (error) {
            console.error('[DataExport] Error getting consent:', error);
            return null;
        }
    }

    /**
     * Delete all user data (Right to erasure / Right to be forgotten)
     */
    static deleteAllUserData() {
        // Show confirmation dialog
        const confirmed = confirm(
            'Are you sure you want to delete all your data?\n\n' +
            'This will remove:\n' +
            '• All favorite games\n' +
            '• Recently played games\n' +
            '• Cookie preferences\n' +
            '• All locally stored data\n\n' +
            'This action cannot be undone!'
        );

        if (!confirmed) {
            console.log('[DataExport] User cancelled data deletion');
            return false;
        }

        try {
            // Clear all localStorage
            const keysToRemove = [
                'kloopik_favorites',
                'kloopik_recent',
                'kloopik_checksum_fav',
                'kloopik_checksum_recent',
                'kloopik_cookie_consent',
                'kloopik_cookie_preferences'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // Clear all cookies
            this.deleteAllCookies();

            console.log('[DataExport] All user data deleted successfully');

            // Show confirmation and reload
            alert('All your data has been deleted successfully.\n\nThe page will now reload.');

            // Reload page to reset state
            window.location.reload();

            return true;
        } catch (error) {
            console.error('[DataExport] Error deleting data:', error);
            this.showNotification('Error deleting data. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Delete all cookies
     */
    static deleteAllCookies() {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

            // Delete cookie for all paths and domains
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
        }
    }

    /**
     * Clear only game-related data (favorites and recent)
     */
    static clearGameData() {
        const confirmed = confirm(
            'Clear all game favorites and recently played games?\n\n' +
            'This will not affect your cookie preferences.'
        );

        if (!confirmed) {
            return false;
        }

        try {
            localStorage.removeItem('kloopik_favorites');
            localStorage.removeItem('kloopik_recent');
            localStorage.removeItem('kloopik_checksum_fav');
            localStorage.removeItem('kloopik_checksum_recent');

            console.log('[DataExport] Game data cleared successfully');

            this.showNotification('Game data cleared successfully!', 'success');

            // Reload page to update UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);

            return true;
        } catch (error) {
            console.error('[DataExport] Error clearing game data:', error);
            this.showNotification('Error clearing game data. Please try again.', 'error');
            return false;
        }
    }

    /**
     * Show notification to user
     */
    static showNotification(message, type = 'info') {
        // Remove existing notification if present
        const existing = document.getElementById('data-export-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'data-export-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10002;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Add slide in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Get data statistics
     */
    static getDataStatistics() {
        try {
            const stats = {
                favorites_count: this.getFavorites().length,
                recent_games_count: this.getRecentlyPlayed().length,
                cookie_consent_given: !!localStorage.getItem('kloopik_cookie_consent'),
                total_local_storage_items: Object.keys(localStorage).filter(key =>
                    key.startsWith('kloopik_')
                ).length
            };

            console.log('[DataExport] Data statistics:', stats);
            return stats;
        } catch (error) {
            console.error('[DataExport] Error getting statistics:', error);
            return null;
        }
    }

    /**
     * Display data statistics to user
     */
    static showDataStatistics() {
        const stats = this.getDataStatistics();

        if (!stats) {
            alert('Error retrieving data statistics.');
            return;
        }

        const message = `Your Data on Kloopik:\n\n` +
            `• Favorite Games: ${stats.favorites_count}\n` +
            `• Recently Played: ${stats.recent_games_count}\n` +
            `• Cookie Consent: ${stats.cookie_consent_given ? 'Given' : 'Not set'}\n` +
            `• Total Data Items: ${stats.total_local_storage_items}\n\n` +
            `You can export or delete this data at any time.`;

        alert(message);
    }
}

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Make globally available
window.DataExport = DataExport;
