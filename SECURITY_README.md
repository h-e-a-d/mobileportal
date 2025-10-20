# Security & Performance Implementation Guide

## 🔒 Security Features

### XSS Prevention

Always use the `Sanitizer` class for user input:

```javascript
// ✅ GOOD - Safe from XSS
const title = Sanitizer.escapeHtml(game.title);
element.textContent = game.title;

// ❌ BAD - Vulnerable to XSS
element.innerHTML = game.title;
```

### Input Validation

```javascript
// Validate game IDs
const gameId = Sanitizer.sanitizeGameId(userInput);
if (!gameId) {
    console.error('Invalid game ID');
    return;
}

// Validate URLs
const url = Sanitizer.sanitizeUrl(userInput);
if (!url) {
    console.error('Invalid URL');
    return;
}

// Validate slugs
const slug = Sanitizer.sanitizeSlug(userInput);
```

### Safe DOM Manipulation

```javascript
// ✅ Use createSafeElement
const element = Sanitizer.createSafeElement('div', game.title, {
    class: 'game-card',
    'data-id': game.id
});

// ✅ Or use textContent
const div = document.createElement('div');
div.textContent = game.title; // Safe - no HTML parsing
```

---

## 🚀 Performance Best Practices

### 1. Service Worker

Service worker is auto-registered. To clear cache:

```javascript
// Send message to service worker
navigator.serviceWorker.controller.postMessage({
    type: 'CLEAR_CACHE'
});
```

### 2. Image Optimization

- Convert images to WebP format
- Add `loading="lazy"` attribute
- Use responsive images with `srcset`

```html
<img
    src="game.webp"
    alt="Game title"
    loading="lazy"
    width="200"
    height="200"
>
```

### 3. Script Loading

All scripts use `defer` except:
- `sanitizer.js` (loaded first, synchronously)
- `cookie-consent.js` (needs to run before analytics)

---

## 🍪 Cookie Consent

### Check if user has consented

```javascript
if (window.cookieConsent && window.cookieConsent.hasAnalyticsConsent()) {
    // Load analytics
    window.Analytics.trackEvent('game_play');
}
```

### Reset consent (for testing)

```javascript
window.cookieConsent.resetConsent();
```

---

## 📊 Data Export (GDPR)

### Export user data

```javascript
DataExport.exportUserData();
// Downloads JSON file with all user data
```

### Delete all data

```javascript
DataExport.deleteAllUserData();
// Clears localStorage and cookies
```

### View statistics

```javascript
DataExport.showDataStatistics();
// Shows data summary in alert
```

---

## 🔍 Testing

### Security Testing

```bash
# Test XSS prevention
# Try injecting: <script>alert(1)</script> in search

# Test localStorage tampering
localStorage.setItem('kloopik_favorites', '["<script>alert(1)</script>"]');
location.reload();
# Should be sanitized and removed

# Test URL injection
# Try: #/game/<img src=x onerror=alert(1)>
# Should be sanitized
```

### Performance Testing

```bash
# Run Lighthouse
npx lighthouse http://localhost:8000 --view

# Test service worker
# 1. Load page
# 2. Open DevTools > Application > Service Workers
# 3. Verify "activated and running"
# 4. Go offline
# 5. Reload - should still work
```

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] `.htaccess` uploaded and working
- [ ] HTTPS configured and enforced
- [ ] Service worker tested
- [ ] Cookie consent tested (Accept/Reject/Customize)
- [ ] Privacy policy accessible at `/privacy.html`
- [ ] Analytics only loads after consent
- [ ] Data export/deletion working
- [ ] XSS protection tested
- [ ] Security headers verified (`curl -I https://domain.com`)
- [ ] Compression enabled (check response headers)
- [ ] Caching working (check 304 responses)

---

## 🚨 Incident Response

If a security issue is discovered:

1. **Assess severity** (Critical/High/Medium/Low)
2. **Contain** - Take affected systems offline if needed
3. **Notify** - Email privacy@kloopik.com
4. **Document** - Record timeline and details
5. **Fix** - Implement patches
6. **Review** - Post-incident analysis

For GDPR data breaches (if backend is added):
- **Notify supervisory authority within 72 hours**
- **Notify affected users if high risk**
- **Document breach details**

---

## 🛠️ Development Guidelines

### Adding New Features

1. **Always sanitize user input**
   ```javascript
   const userInput = Sanitizer.escapeHtml(input);
   ```

2. **Use textContent, not innerHTML**
   ```javascript
   element.textContent = userInput; // Safe
   ```

3. **Validate data from localStorage**
   ```javascript
   const data = storageManager.getFavorites(); // Already validated
   ```

4. **Check cookie consent before analytics**
   ```javascript
   if (window.cookieConsent?.hasAnalyticsConsent()) {
       // Track event
   }
   ```

### Code Review Checklist

- [ ] No innerHTML with user data
- [ ] All user input sanitized
- [ ] URLs validated
- [ ] localStorage data validated
- [ ] No eval() or Function() constructor
- [ ] No inline event handlers
- [ ] Images have alt text
- [ ] Loading states handled
- [ ] Errors logged properly

---

## 📚 Resources

### Security Headers
- [Content Security Policy Reference](https://content-security-policy.com/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Security Headers Scanner](https://securityheaders.com/)

### GDPR
- [GDPR Official Text](https://gdpr-info.eu/)
- [GDPR Checklist](https://gdpr.eu/checklist/)

### Performance
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Can I Use](https://caniuse.com/)

---

## 🐛 Known Issues

None currently reported.

---

## 📞 Support

- **Security Issues:** security@kloopik.com
- **Privacy Questions:** privacy@kloopik.com
- **General Support:** support@kloopik.com

---

*Last updated: October 20, 2025*
