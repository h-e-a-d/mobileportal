/**
 * Cookie Consent Manager - GDPR Compliant
 * Manages user consent for cookies and analytics
 */

class CookieConsent {
    constructor() {
        this.consentKey = 'kloopik_cookie_consent';
        this.preferencesKey = 'kloopik_cookie_preferences';
        this.currentModal = null;

        // Cookie categories
        this.categories = {
            essential: {
                name: 'Essential Cookies',
                description: 'Required for the website to function properly. These cannot be disabled.',
                required: true,
                enabled: true
            },
            analytics: {
                name: 'Analytics Cookies',
                description: 'Help us understand how visitors interact with our website by collecting anonymous data.',
                required: false,
                enabled: false
            },
            functional: {
                name: 'Functional Cookies',
                description: 'Remember your preferences and provide enhanced features.',
                required: false,
                enabled: false
            }
        };

        this.init();
    }

    /**
     * Initialize cookie consent manager
     */
    init() {
        // Check if consent has been given
        const consent = this.getConsent();

        if (!consent) {
            // No consent yet, show banner
            this.showBanner();
        } else {
            // Load preferences
            this.loadPreferences();

            // Initialize analytics if consented
            if (this.categories.analytics.enabled) {
                this.loadAnalytics();
            }
        }
    }

    /**
     * Get current consent status
     */
    getConsent() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            return consent;
        } catch (error) {
            console.error('[CookieConsent] Error reading consent:', error);
            return null;
        }
    }

    /**
     * Load saved preferences
     */
    loadPreferences() {
        try {
            const prefs = localStorage.getItem(this.preferencesKey);
            if (prefs) {
                const parsed = JSON.parse(prefs);

                // Update category states
                if (parsed.analytics !== undefined) {
                    this.categories.analytics.enabled = parsed.analytics;
                }
                if (parsed.functional !== undefined) {
                    this.categories.functional.enabled = parsed.functional;
                }
            }
        } catch (error) {
            console.error('[CookieConsent] Error loading preferences:', error);
        }
    }

    /**
     * Save consent preferences
     */
    savePreferences() {
        try {
            const prefs = {
                analytics: this.categories.analytics.enabled,
                functional: this.categories.functional.enabled,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(this.preferencesKey, JSON.stringify(prefs));
            localStorage.setItem(this.consentKey, 'granted');

            return true;
        } catch (error) {
            console.error('[CookieConsent] Error saving preferences:', error);
            return false;
        }
    }

    /**
     * Show cookie consent banner
     */
    showBanner() {
        // Don't show if already visible
        if (document.getElementById('cookie-consent-banner')) {
            return;
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <p>
                        <strong>🍪 We use cookies</strong>
                    </p>
                    <p>
                        We use cookies and similar technologies to improve your experience,
                        analyze site traffic, and personalize content. By clicking "Accept All",
                        you consent to our use of cookies.
                        <a href="/privacy.html" target="_blank" rel="noopener">Learn more in our Privacy Policy</a>
                    </p>
                </div>
                <div class="cookie-consent-buttons">
                    <button class="cookie-consent-btn cookie-accept-btn" id="cookie-accept-all">
                        Accept All
                    </button>
                    <button class="cookie-consent-btn cookie-reject-btn" id="cookie-reject-all">
                        Reject All
                    </button>
                    <button class="cookie-consent-btn cookie-customize-btn" id="cookie-customize">
                        Customize
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Attach event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', () => {
            this.acceptAll();
        });

        document.getElementById('cookie-reject-all').addEventListener('click', () => {
            this.rejectAll();
        });

        document.getElementById('cookie-customize').addEventListener('click', () => {
            this.showCustomizeModal();
        });
    }

    /**
     * Hide cookie consent banner
     */
    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    /**
     * Accept all cookies
     */
    acceptAll() {
        this.categories.analytics.enabled = true;
        this.categories.functional.enabled = true;

        this.savePreferences();
        this.loadAnalytics();
        this.hideBanner();

        console.log('[CookieConsent] All cookies accepted');
    }

    /**
     * Reject all non-essential cookies
     */
    rejectAll() {
        this.categories.analytics.enabled = false;
        this.categories.functional.enabled = false;

        this.savePreferences();
        this.disableAnalytics();
        this.hideBanner();

        console.log('[CookieConsent] Non-essential cookies rejected');
    }

    /**
     * Show cookie customization modal
     */
    showCustomizeModal() {
        // Hide banner first
        this.hideBanner();

        // Don't show if already visible
        if (this.currentModal) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal';
        modal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2>Cookie Preferences</h2>
                    <p>Choose which cookies you want to accept</p>
                </div>
                <div class="cookie-settings-body">
                    ${this.renderCookieCategories()}
                </div>
                <div class="cookie-settings-footer">
                    <button class="cookie-cancel-btn" id="cookie-cancel">
                        Cancel
                    </button>
                    <button class="cookie-save-btn" id="cookie-save-preferences">
                        Save Preferences
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentModal = modal;

        // Attach event listeners
        document.getElementById('cookie-save-preferences').addEventListener('click', () => {
            this.saveCustomPreferences();
        });

        document.getElementById('cookie-cancel').addEventListener('click', () => {
            this.closeCustomizeModal();
            this.showBanner(); // Show banner again
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCustomizeModal();
                this.showBanner();
            }
        });

        // Attach toggle listeners
        this.attachToggleListeners();
    }

    /**
     * Render cookie category toggles
     */
    renderCookieCategories() {
        let html = '';

        for (const [key, category] of Object.entries(this.categories)) {
            const disabled = category.required ? 'disabled' : '';
            const checked = category.enabled ? 'checked' : '';

            html += `
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h3>
                            ${category.name}
                            ${category.required ? '<span class="cookie-category-required">Required</span>' : ''}
                        </h3>
                        <label class="cookie-toggle">
                            <input
                                type="checkbox"
                                data-category="${key}"
                                ${disabled}
                                ${checked}
                            >
                            <span class="cookie-toggle-slider"></span>
                        </label>
                    </div>
                    <p class="cookie-category-description">${category.description}</p>
                </div>
            `;
        }

        return html;
    }

    /**
     * Attach event listeners to toggle switches
     */
    attachToggleListeners() {
        const toggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]');

        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const category = e.target.getAttribute('data-category');
                if (category && !this.categories[category].required) {
                    this.categories[category].enabled = e.target.checked;
                }
            });
        });
    }

    /**
     * Save custom preferences from modal
     */
    saveCustomPreferences() {
        this.savePreferences();

        // Load or disable analytics based on preference
        if (this.categories.analytics.enabled) {
            this.loadAnalytics();
        } else {
            this.disableAnalytics();
        }

        this.closeCustomizeModal();

        console.log('[CookieConsent] Custom preferences saved:', {
            analytics: this.categories.analytics.enabled,
            functional: this.categories.functional.enabled
        });
    }

    /**
     * Close customization modal
     */
    closeCustomizeModal() {
        if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
        }
    }

    /**
     * Load Google Analytics
     */
    loadAnalytics() {
        // Only load if not already loaded
        if (window.dataLayer && window.dataLayer.length > 0) {
            console.log('[CookieConsent] Analytics already loaded');
            return;
        }

        // Google Tag Manager is already loaded in the head
        // Just ensure it's not disabled
        if (window['ga-disable-GTM-PK768FJP'] !== undefined) {
            window['ga-disable-GTM-PK768FJP'] = false;
        }

        console.log('[CookieConsent] Analytics enabled');
    }

    /**
     * Disable Google Analytics
     */
    disableAnalytics() {
        // Disable Google Analytics
        window['ga-disable-GTM-PK768FJP'] = true;

        // Clear analytics cookies
        this.deleteAnalyticsCookies();

        console.log('[CookieConsent] Analytics disabled');
    }

    /**
     * Delete analytics cookies
     */
    deleteAnalyticsCookies() {
        const cookiesToDelete = ['_ga', '_gat', '_gid', '_gat_gtag_GTM_PK768FJP'];

        cookiesToDelete.forEach(cookieName => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        });
    }

    /**
     * Reset all consent (for testing or user request)
     */
    resetConsent() {
        try {
            localStorage.removeItem(this.consentKey);
            localStorage.removeItem(this.preferencesKey);

            this.deleteAnalyticsCookies();

            // Reset categories
            this.categories.analytics.enabled = false;
            this.categories.functional.enabled = false;

            console.log('[CookieConsent] Consent reset');

            // Reload page to show banner again
            window.location.reload();
        } catch (error) {
            console.error('[CookieConsent] Error resetting consent:', error);
        }
    }

    /**
     * Get current consent status (for external use)
     */
    hasAnalyticsConsent() {
        return this.categories.analytics.enabled;
    }

    /**
     * Get current consent status (for external use)
     */
    hasFunctionalConsent() {
        return this.categories.functional.enabled;
    }
}

// Initialize cookie consent when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cookieConsent = new CookieConsent();
    });
} else {
    window.cookieConsent = new CookieConsent();
}

// Add slide down animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateY(0);
            opacity: 1;
        }
        to {
            transform: translateY(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
