# Security Quick Fixes - Action Items

## CRITICAL - Fix Within 48 Hours

### 1. Fix XSS via innerHTML (app.js)

**Location:** `/workspaces/mobileportal/js/app.js`

**Current vulnerable code:**
```javascript
// Line 639 - VULNERABLE
card.innerHTML = `
    <img src="${thumbnail}" alt="${game.title}">
    <h3 class="game-card-title">${game.title}</h3>
`;
```

**Secure replacement:**
```javascript
// SECURE - Use textContent
card.innerHTML = `
    <img src="${Sanitizer.sanitizeUrl(thumbnail)}" alt="${Sanitizer.escapeHtml(game.title)}">
    <h3 class="game-card-title">${Sanitizer.escapeHtml(game.title)}</h3>
`;
```

**Files to fix:**
- Line 170: Category icons innerHTML
- Line 318: Clear rows
- Line 379: All games section
- Line 443: Category row
- Line 639: Game card (MOST CRITICAL)
- Line 920: Empty state

---

### 2. Remove 'unsafe-inline' from CSP

**Location:** `/workspaces/mobileportal/.htaccess` line 13

**Option A: Use Nonces (Recommended)**
```apache
# Generate random nonce per request
# Then update CSP:
Content-Security-Policy: "\
    default-src 'self'; \
    script-src 'self' 'nonce-RANDOM_NONCE_HERE' https://www.googletagmanager.com; \
    style-src 'self' 'nonce-RANDOM_NONCE_HERE' https://fonts.googleapis.com;
"
```

**Option B: Use Hashes**
```bash
# Calculate hash of inline scripts
echo -n "YOUR_SCRIPT_CONTENT" | openssl dgst -sha256 -binary | openssl base64

# Add to CSP
script-src 'self' 'sha256-HASH_HERE' https://www.googletagmanager.com;
```

---

### 3. Fix Iframe Sandbox

**Location:** `/workspaces/mobileportal/index.html` line 185

**Current - INSECURE:**
```html
<iframe
    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock"
```

**Fixed - SECURE:**
```html
<iframe
    sandbox="allow-scripts allow-popups allow-pointer-lock"
```

**Key change:** REMOVE `allow-same-origin` - this is the critical fix!

---

### 4. Add Rate Limiting

**Create new file:** `/workspaces/mobileportal/js/rate-limiter.js`

```javascript
class RateLimiter {
    constructor(maxCalls, windowMs) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = [];
    }

    allow() {
        const now = Date.now();
        this.calls = this.calls.filter(time => now - time < this.windowMs);

        if (this.calls.length >= this.maxCalls) {
            console.warn('[Security] Rate limit exceeded');
            return false;
        }

        this.calls.push(now);
        return true;
    }

    reset() {
        this.calls = [];
    }
}

window.RateLimiter = RateLimiter;
```

**Update analytics.js:**
```javascript
// At top of Analytics class constructor
this.searchRateLimiter = new RateLimiter(10, 60000); // 10 per minute
this.gamePlayRateLimiter = new RateLimiter(20, 60000); // 20 per minute

// In trackSearch method
trackSearch(query, resultsCount) {
    if (!this.searchRateLimiter.allow()) {
        return; // Silently drop excessive calls
    }
    // ... existing code
}

// In trackGamePlay method
trackGamePlay(game) {
    if (!this.gamePlayRateLimiter.allow()) {
        return;
    }
    // ... existing code
}
```

---

### 5. Add SRI to External Resources

**Location:** `/workspaces/mobileportal/index.html`

**Generate SRI hashes:**
```bash
# For Google Fonts (example)
curl -s https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800\&display=swap | \
  openssl dgst -sha384 -binary | openssl base64 -A
```

**Update HTML:**
```html
<!-- Line 38 - Add integrity attribute -->
<link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
    integrity="sha384-YOUR_HASH_HERE"
    crossorigin="anonymous"
>
```

---

## HIGH PRIORITY - Fix Within 1 Week

### 6. Strengthen Input Validation (router.js)

**Location:** `/workspaces/mobileportal/js/router.js` line 59

**Replace getCurrentPath() method:**
```javascript
getCurrentPath() {
    const hash = window.location.hash.slice(1);
    if (!hash) return this.defaultRoute;

    // Strict whitelist - only allow safe characters
    if (!/^[a-z0-9\-\/]{1,100}$/i.test(hash)) {
        console.warn('[Router] Invalid hash rejected:', hash);
        return this.defaultRoute;
    }

    // Prevent path traversal
    if (hash.includes('..') || hash.includes('//')) {
        console.warn('[Router] Path traversal attempt blocked');
        return this.defaultRoute;
    }

    return hash;
}
```

---

### 7. Fix localStorage Checksum (storage.js)

**Location:** `/workspaces/mobileportal/js/storage.js` line 16

**Replace weak checksum with Web Crypto API:**
```javascript
async _calculateChecksum(data) {
    const encoder = new TextEncoder();
    const dataStr = JSON.stringify(data);

    // Use SHA-256 instead of base64
    const hashBuffer = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(dataStr)
    );

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Update getFavorites() to be async
async getFavorites() {
    try {
        const favoritesStr = localStorage.getItem(this.FAVORITES_KEY);
        const checksumStr = localStorage.getItem(this.CHECKSUM_KEY + '_fav');

        if (!favoritesStr) return [];

        const parsed = JSON.parse(favoritesStr);

        // Verify checksum
        if (checksumStr) {
            const expectedChecksum = await this._calculateChecksum(parsed);
            if (checksumStr !== expectedChecksum) {
                console.warn('[Storage] Integrity check failed');
                this.clearFavorites();
                return [];
            }
        }

        return this._validateGameIds(parsed);
    } catch (error) {
        console.error('[Storage] Error:', error);
        return [];
    }
}
```

---

### 8. Fix Analytics GDPR Compliance

**Location:** `/workspaces/mobileportal/index.html` lines 4-10

**Move GTM loading to after consent:**
```html
<!-- REMOVE from <head> -->
<!-- Delete lines 4-10 -->

<!-- Add to end of <body> instead -->
<script>
// Only load GTM after consent
document.addEventListener('DOMContentLoaded', () => {
    const checkConsent = setInterval(() => {
        if (window.cookieConsent && window.cookieConsent.hasAnalyticsConsent()) {
            clearInterval(checkConsent);
            loadGTM();
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkConsent), 5000);
});

function loadGTM() {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PK768FJP');
}
</script>
```

---

### 9. Add Prototype Pollution Protection

**Location:** `/workspaces/mobileportal/js/games.js` line 26

**Secure JSON parsing:**
```javascript
const text = await response.text();
const data = JSON.parse(text, (key, value) => {
    // Block prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        console.warn('[Security] Prototype pollution blocked');
        return undefined;
    }
    return value;
});

// Freeze to prevent modification
Object.freeze(data);
```

---

### 10. Fix Service Worker HTTPS Enforcement

**Location:** `/workspaces/mobileportal/sw.js` line 78

**Add HTTPS upgrade:**
```javascript
// Skip cross-origin requests but upgrade to HTTPS
if (url.origin !== location.origin) {
    if (url.protocol === 'http:') {
        console.warn('[ServiceWorker] Upgrading to HTTPS:', url.href);
        const httpsUrl = url.href.replace('http://', 'https://');
        event.respondWith(fetch(httpsUrl));
    } else {
        event.respondWith(fetch(request));
    }
    return;
}
```

---

## MEDIUM PRIORITY - Fix Within 2 Weeks

### 11. Add Clickjacking Protection to Cookie Banner

**Location:** `/workspaces/mobileportal/js/cookie-consent.js` line 117

**Add frame detection:**
```javascript
showBanner() {
    // Prevent clickjacking
    if (window.top !== window.self) {
        console.warn('[CookieConsent] Page is framed, banner suppressed');
        return;
    }

    // Check if already visible
    if (document.getElementById('cookie-consent-banner')) {
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.style.cssText = 'z-index: 2147483647 !important; isolation: isolate;';
    // ... rest of code
}
```

---

### 12. Fix Service Worker Cache Validation

**Location:** `/workspaces/mobileportal/sw.js` line 119

**Add content type validation:**
```javascript
if (request.method === 'GET' && networkResponse.status === 200) {
    const contentType = networkResponse.headers.get('content-type') || '';
    const url = new URL(request.url);

    // Only cache safe content from same origin
    const safeMimeTypes = ['text/html', 'text/css', 'application/javascript', 'image/', 'font/'];
    const isSafe = safeMimeTypes.some(type => contentType.includes(type));
    const isSameOrigin = url.origin === location.origin;

    if (isSafe && isSameOrigin) {
        const responseClone = networkResponse.clone();
        caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
        });
    } else {
        console.warn('[ServiceWorker] Skipping cache:', request.url);
    }
}
```

---

### 13. Adjust CORS Headers

**Location:** `/workspaces/mobileportal/.htaccess` lines 54-56

**Fix for compatibility:**
```apache
# Adjust overly strict CORS headers
Header always set Cross-Origin-Embedder-Policy "unsafe-none"
Header always set Cross-Origin-Opener-Policy "same-origin-allow-popups"
Header always set Cross-Origin-Resource-Policy "cross-origin"

# Better: Use conditional headers
<FilesMatch "\.(html|htm)$">
    Header always set Cross-Origin-Embedder-Policy "credentialless"
</FilesMatch>
```

---

## Testing Commands

### Manual Security Tests
```bash
# Test XSS in search
# Enter: <script>alert('XSS')</script>
# Expected: No alert, escaped text shown

# Test CSP
# Open DevTools Console
# Try: eval('alert(1)')
# Expected: CSP blocks execution

# Test rate limiting
# Run in console:
for(let i=0; i<100; i++) {
    window.Analytics.trackSearch('test'+i, 0);
}
# Expected: Max 10 tracked per minute
```

### Automated Scans
```bash
# Check security headers
curl -I https://kloopik.com | grep -i "x-\|content-security\|strict-transport"

# Mozilla Observatory
https://observatory.mozilla.org/analyze/kloopik.com

# SecurityHeaders.com
https://securityheaders.com/?q=kloopik.com

# CSP Evaluator
https://csp-evaluator.withgoogle.com/
```

---

## Verification Checklist

After implementing fixes, verify:

- [ ] No innerHTML without escapeHtml()
- [ ] CSP has no 'unsafe-inline' OR uses nonces
- [ ] Iframe lacks 'allow-same-origin'
- [ ] Rate limiting blocks excessive calls
- [ ] External resources have integrity=""
- [ ] Router rejects invalid hashes
- [ ] localStorage uses strong checksums
- [ ] GTM loads after consent
- [ ] Prototype pollution protection active
- [ ] Service Worker upgrades HTTP to HTTPS
- [ ] Cookie banner detects framing
- [ ] Cache validates content types

---

## Quick Security Scan Script

Create `/workspaces/mobileportal/scripts/security-scan.sh`:

```bash
#!/bin/bash

echo "🔒 Security Quick Scan"
echo "====================="

# Check for unsafe patterns
echo "❌ Checking for innerHTML usage..."
grep -rn "innerHTML\s*=" js/ | wc -l

echo "❌ Checking for eval usage..."
grep -rn "eval(" js/ | wc -l

echo "✅ Checking for Sanitizer usage..."
grep -rn "Sanitizer\." js/ | wc -l

echo "✅ Checking CSP headers..."
grep "Content-Security-Policy" .htaccess _headers

echo "✅ Checking iframe sandbox..."
grep "sandbox=" index.html

echo "Done! Review output above."
```

Run with: `bash scripts/security-scan.sh`

---

**Last Updated:** October 21, 2025
**See Also:** SECURITY_AUDIT_REPORT.md (full detailed report)
