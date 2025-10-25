/**
 * Game Session Manager
 * Tracks game play sessions, time played, and statistics
 */

class GameSessionManager {
    constructor() {
        this.SESSIONS_KEY = 'kloopik_sessions';
        this.STATS_KEY = 'kloopik_game_stats';
        this.currentSession = null;
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.sessions = [];
        this.gameStats = {};
    }

    /**
     * Initialize
     */
    init() {
        this.sessions = this._loadSessions();
        this.gameStats = this._loadGameStats();
    }

    /**
     * Load sessions from localStorage
     */
    _loadSessions() {
        try {
            const data = localStorage.getItem(this.SESSIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[SessionManager] Error loading sessions:', error);
            return [];
        }
    }

    /**
     * Load game stats from localStorage
     */
    _loadGameStats() {
        try {
            const data = localStorage.getItem(this.STATS_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('[SessionManager] Error loading game stats:', error);
            return {};
        }
    }

    /**
     * Save sessions
     */
    _saveSessions() {
        try {
            // Keep only last 100 sessions
            const recentSessions = this.sessions.slice(-100);
            localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(recentSessions));
            this.sessions = recentSessions;
            return true;
        } catch (error) {
            console.error('[SessionManager] Error saving sessions:', error);
            return false;
        }
    }

    /**
     * Save game stats
     */
    _saveGameStats() {
        try {
            localStorage.setItem(this.STATS_KEY, JSON.stringify(this.gameStats));
            return true;
        } catch (error) {
            console.error('[SessionManager] Error saving game stats:', error);
            return false;
        }
    }

    /**
     * Start a new game session
     */
    startSession(gameId, gameTitle) {
        // End any existing session first
        if (this.currentSession) {
            this.endSession();
        }

        const validGameId = String(gameId);

        this.currentSession = {
            gameId: validGameId,
            gameTitle: gameTitle,
            startTime: Date.now(),
            endTime: null,
            duration: 0,
            active: true
        };

        this.sessionStartTime = Date.now();

        // Start timer to update duration
        this.sessionTimer = setInterval(() => {
            // Check if session still exists, clear timer if not
            if (!this.currentSession || !this.sessionStartTime) {
                if (this.sessionTimer) {
                    clearInterval(this.sessionTimer);
                    this.sessionTimer = null;
                }
                return;
            }

            // Update duration
            this.currentSession.duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        }, 1000);

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('session_start', {
                gameId: validGameId,
                gameTitle: gameTitle
            });
        }

        if (window.logger) {
            window.logger.info('[SessionManager] Session started:', gameTitle);
        }
    }

    /**
     * End current session
     */
    endSession() {
        if (!this.currentSession) {
            return null;
        }

        // Stop timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }

        // Finalize session
        this.currentSession.endTime = Date.now();
        this.currentSession.duration = Math.floor((this.currentSession.endTime - this.currentSession.startTime) / 1000);
        this.currentSession.active = false;

        // Save session
        this.sessions.push(this.currentSession);
        this._saveSessions();

        // Update game stats
        this._updateGameStats(this.currentSession);

        // Track analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('session_end', {
                gameId: this.currentSession.gameId,
                duration: this.currentSession.duration
            });
        }

        const session = this.currentSession;
        this.currentSession = null;
        this.sessionStartTime = null;

        return session;
    }

    /**
     * Get current session
     */
    getCurrentSession() {
        return this.currentSession;
    }

    /**
     * Get current session duration in seconds
     */
    getCurrentDuration() {
        if (!this.currentSession) {
            return 0;
        }
        return Math.floor((Date.now() - this.sessionStartTime) / 1000);
    }

    /**
     * Get formatted current duration
     */
    getFormattedCurrentDuration() {
        return this._formatDuration(this.getCurrentDuration());
    }

    /**
     * Update game statistics
     */
    _updateGameStats(session) {
        const gameId = session.gameId;

        if (!this.gameStats[gameId]) {
            this.gameStats[gameId] = {
                gameId: gameId,
                gameTitle: session.gameTitle,
                totalPlays: 0,
                totalTime: 0,
                averageTime: 0,
                lastPlayed: null,
                firstPlayed: null
            };
        }

        const stats = this.gameStats[gameId];
        stats.totalPlays++;
        stats.totalTime += session.duration;
        stats.averageTime = Math.floor(stats.totalTime / stats.totalPlays);
        stats.lastPlayed = session.endTime;

        if (!stats.firstPlayed) {
            stats.firstPlayed = session.startTime;
        }

        this._saveGameStats();
    }

    /**
     * Get stats for a specific game
     */
    getGameStats(gameId) {
        const validGameId = String(gameId);
        return this.gameStats[validGameId] || {
            gameId: validGameId,
            totalPlays: 0,
            totalTime: 0,
            averageTime: 0,
            lastPlayed: null,
            firstPlayed: null
        };
    }

    /**
     * Get all game stats
     */
    getAllGameStats() {
        return Object.values(this.gameStats);
    }

    /**
     * Get most played games
     */
    getMostPlayedGames(limit = 10) {
        return Object.values(this.gameStats)
            .sort((a, b) => b.totalPlays - a.totalPlays)
            .slice(0, limit);
    }

    /**
     * Get games with most time spent
     */
    getMostTimeSpent(limit = 10) {
        return Object.values(this.gameStats)
            .sort((a, b) => b.totalTime - a.totalTime)
            .slice(0, limit);
    }

    /**
     * Get recent sessions
     */
    getRecentSessions(limit = 20) {
        return this.sessions
            .slice(-limit)
            .reverse();
    }

    /**
     * Get total play time across all games
     */
    getTotalPlayTime() {
        return Object.values(this.gameStats)
            .reduce((total, stats) => total + stats.totalTime, 0);
    }

    /**
     * Get total number of games played
     */
    getTotalGamesPlayed() {
        return Object.keys(this.gameStats).length;
    }

    /**
     * Get total play sessions
     */
    getTotalSessions() {
        return Object.values(this.gameStats)
            .reduce((total, stats) => total + stats.totalPlays, 0);
    }

    /**
     * Format duration in seconds to readable string
     */
    _formatDuration(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${minutes}m ${secs}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    /**
     * Get formatted total play time
     */
    getFormattedTotalPlayTime() {
        return this._formatDuration(this.getTotalPlayTime());
    }

    /**
     * Get play statistics summary
     */
    getStatsSummary() {
        const totalTime = this.getTotalPlayTime();
        const totalGames = this.getTotalGamesPlayed();
        const totalSessions = this.getTotalSessions();

        return {
            totalGames: totalGames,
            totalSessions: totalSessions,
            totalTime: totalTime,
            totalTimeFormatted: this._formatDuration(totalTime),
            averageSessionTime: totalSessions > 0 ? Math.floor(totalTime / totalSessions) : 0,
            averageSessionTimeFormatted: totalSessions > 0
                ? this._formatDuration(Math.floor(totalTime / totalSessions))
                : '0s',
            mostPlayedGame: this.getMostPlayedGames(1)[0] || null,
            longestSession: this._getLongestSession()
        };
    }

    /**
     * Get longest session
     */
    _getLongestSession() {
        if (this.sessions.length === 0) return null;

        return this.sessions.reduce((longest, session) => {
            return session.duration > (longest?.duration || 0) ? session : longest;
        }, null);
    }

    /**
     * Export session data
     */
    exportData() {
        return {
            sessions: this.sessions,
            gameStats: this.gameStats,
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import session data
     */
    importData(data) {
        try {
            if (data.sessions && Array.isArray(data.sessions)) {
                this.sessions = [...this.sessions, ...data.sessions];
                this._saveSessions();
            }
            if (data.gameStats) {
                // Merge stats
                for (const [gameId, stats] of Object.entries(data.gameStats)) {
                    if (this.gameStats[gameId]) {
                        this.gameStats[gameId].totalPlays += stats.totalPlays;
                        this.gameStats[gameId].totalTime += stats.totalTime;
                        this.gameStats[gameId].averageTime = Math.floor(
                            this.gameStats[gameId].totalTime / this.gameStats[gameId].totalPlays
                        );
                    } else {
                        this.gameStats[gameId] = stats;
                    }
                }
                this._saveGameStats();
            }
            return true;
        } catch (error) {
            console.error('[SessionManager] Error importing data:', error);
            return false;
        }
    }

    /**
     * Clear all session data
     */
    clearAllData() {
        this.sessions = [];
        this.gameStats = {};
        localStorage.removeItem(this.SESSIONS_KEY);
        localStorage.removeItem(this.STATS_KEY);

        if (this.currentSession) {
            this.endSession();
        }

        return true;
    }
}

// Create global instance
const gameSessionManager = new GameSessionManager();

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => gameSessionManager.init());
} else {
    gameSessionManager.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameSessionManager.currentSession) {
        gameSessionManager.endSession();
    }
});
