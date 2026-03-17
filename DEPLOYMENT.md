# Deployment Guide - Kloopik Gaming Portal

Complete deployment documentation for the Kloopik gaming portal, covering all major platforms and configurations.

## Table of Contents

- [Quick Start](#quick-start)
- [Platform Options](#platform-options)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Netlify Deployment](#netlify-deployment-recommended)
- [Vercel Deployment](#vercel-deployment-recommended)
- [Cloudflare Pages](#cloudflare-pages)
- [Security Headers](#security-headers)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Platform Recommendation

| Platform | Security | Setup | Recommendation |
|----------|----------|-------|----------------|
| **Netlify** | Full | Easy | ⭐⭐⭐⭐⭐ BEST |
| **Vercel** | Full | Easy | ⭐⭐⭐⭐⭐ BEST |
| **GitHub Pages + Cloudflare** | Full | Medium | ⭐⭐⭐⭐ Good |
| **GitHub Pages Only** | Partial | Easy | ⭐⭐⭐ OK |

---

## Platform Options

### Netlify (Recommended)

**Pros:**
- Full security headers via `_headers` or `netlify.toml`
- Free SSL certificate
- Global CDN
- One-click deployment from GitHub
- Automatic deployments on git push
- Deploy previews for pull requests
- Form handling and serverless functions

**Cons:**
- None for this use case

**Best For:** Production deployments, team projects

### Vercel (Recommended)

**Pros:**
- Full security headers via `vercel.json`
- Free SSL certificate
- Global Edge Network
- Excellent performance
- GitHub integration
- Automatic deployments

**Cons:**
- None for this use case

**Best For:** Production deployments, modern workflows

### GitHub Pages

**Pros:**
- Free hosting
- Simple setup
- GitHub integration
- Automatic HTTPS

**Cons:**
- `.htaccess` doesn't work (Apache-specific)
- No custom security headers without Cloudflare
- Limited configuration

**Best For:** Quick testing, personal projects

### Cloudflare Pages

**Pros:**
- Global CDN
- Free SSL
- GitHub integration
- Worker functions available

**Cons:**
- More complex setup for security headers

**Best For:** Projects needing CDN features

---

## Pre-Deployment Checklist

Before deploying to any platform:

### Files Ready
- [ ] All 706 game pages exist in `/catalog/`
- [ ] All 168 category pages exist in `/category/`
- [ ] `sitemap.xml` is present
- [ ] `robots.txt` is present
- [ ] CSS files are in `/css/`
- [ ] JS files are in `/js/`
- [ ] `categories.html` exists
- [ ] `data/` directory with 171 JSON files

### Content Verified
- [ ] Sample game page displays correctly
- [ ] Sample category page displays correctly
- [ ] Images load (from Playgama CDN)
- [ ] Styles apply correctly
- [ ] JavaScript functions work
- [ ] Search functionality works
- [ ] Favorites/recently played work

### SEO Ready
- [ ] Meta tags are unique per page
- [ ] Schema markup is valid (test at schema.org)
- [ ] Sitemap is valid (test at xml-sitemaps.com)
- [ ] Robots.txt allows crawling
- [ ] Canonical URLs are correct

### Build Scripts Test
```bash
# Verify build scripts work
npm run build:split-data
npm run build:pages
npm run build:categories
npm run build:sitemap

# Check for errors
echo "All builds completed successfully"
```

### Local Testing
```bash
# Start local server
npm run dev

# Test in browser:
# - Homepage loads
# - Categories load
# - Search works
# - Games open
# - No console errors
```

---

## GitHub Pages Deployment

### Basic Setup (No Custom Security Headers)

1. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: `main` branch
   - Folder: `/ (root)`
   - Enable "Enforce HTTPS"

2. **Push Code**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

3. **Wait for Deployment**
   - GitHub Pages builds in 2-3 minutes
   - Visit: `https://[username].github.io/mobileportal/`

### Custom Domain Setup

1. **Add CNAME File**
```bash
echo "www.kloopik.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

2. **Configure DNS**

At your domain registrar:
```
Type  | Name | Value
------|------|------
A     | @    | 185.199.108.153
A     | @    | 185.199.109.153
A     | @    | 185.199.110.153
A     | @    | 185.199.111.153
CNAME | www  | [username].github.io
```

3. **Enable Custom Domain in GitHub**
   - Settings > Pages
   - Custom domain: `www.kloopik.com`
   - Enable "Enforce HTTPS"

### Adding Security Headers with Cloudflare

GitHub Pages doesn't support `.htaccess`, but you can add security headers via Cloudflare Workers:

1. **Sign up at Cloudflare**
   - https://cloudflare.com (free plan)

2. **Add Your Domain**
   - Follow Cloudflare setup wizard
   - Update nameservers at registrar

3. **Create Worker**

Go to Workers > Create a Worker:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)

  // Add security headers
  newResponse.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "frame-src https://playgama.com; " +
    "frame-ancestors 'none'")

  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return newResponse
}
```

4. **Add Route**
   - Workers > Add route
   - Route: `*kloopik.com/*`
   - Worker: Select your worker

---

## Netlify Deployment (Recommended)

### Quick Setup

1. **Sign Up**
   - Visit https://netlify.com
   - Sign up with GitHub

2. **Deploy**
   - Click "Add new site" > "Import from Git"
   - Connect GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.` (root)
   - Click "Deploy site"

3. **Configure Security Headers**

Create `netlify.toml` (already exists):

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://playgama.com; frame-ancestors 'none'"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

4. **Custom Domain**
   - Site settings > Domain management
   - Add custom domain: `www.kloopik.com`
   - Follow DNS configuration instructions

---

## Vercel Deployment (Recommended)

### Quick Setup

1. **Sign Up**
   - Visit https://vercel.com
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Import from GitHub
   - Click "Deploy"

3. **Configure Security Headers**

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://playgama.com; frame-ancestors 'none'"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

4. **Custom Domain**
   - Project settings > Domains
   - Add domain: `www.kloopik.com`
   - Configure DNS as instructed

---

## Cloudflare Pages

### Setup

1. **Sign Up**
   - Visit https://pages.cloudflare.com

2. **Create Project**
   - Connect GitHub
   - Select repository
   - Build settings:
     - Build command: (leave empty)
     - Build output: `.`
   - Deploy

3. **Custom Domain**
   - Project > Custom domains
   - Add domain

---

## Security Headers

### Required Headers

All platforms should implement these security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://playgama.com; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Platform-Specific Files

| File | GitHub Pages | Netlify | Vercel | Cloudflare |
|------|--------------|---------|--------|------------|
| `.htaccess` | Ignored | Not needed | Not needed | Not needed |
| `_headers` | Ignored | Used | Ignored | Ignored |
| `netlify.toml` | Ignored | Used | Ignored | Ignored |
| `vercel.json` | Ignored | Ignored | Used | Ignored |

---

## Post-Deployment

### Verify Deployment

After deployment, test these URLs (replace with your domain):

```
https://yoursite.com/                    # Homepage
https://yoursite.com/sitemap.xml         # Sitemap
https://yoursite.com/robots.txt          # Robots
https://yoursite.com/categories.html     # Categories
https://yoursite.com/catalog/tb-world/   # Sample game
https://yoursite.com/category/action/    # Sample category
```

### Check Security Headers

```bash
curl -I https://yoursite.com
```

Look for:
- `content-security-policy`
- `x-frame-options`
- `strict-transport-security`

### Submit to Search Engines

**Google Search Console:**
1. Visit https://search.google.com/search-console
2. Add property: `https://yoursite.com`
3. Verify ownership
4. Submit sitemap: `https://yoursite.com/sitemap.xml`
5. Request indexing for homepage

**Bing Webmaster Tools:**
1. Visit https://www.bing.com/webmasters
2. Add site
3. Verify ownership
4. Submit sitemap

### Monitor Performance

**Tools to use:**
- Google Search Console (indexing, errors)
- Google Analytics (traffic, engagement)
- Lighthouse (performance, SEO)
- PageSpeed Insights (Core Web Vitals)

### Performance Tests

- [ ] Homepage loads in <2 seconds
- [ ] Lighthouse score >85
- [ ] LCP (Largest Contentful Paint) <2.5s
- [ ] FID (First Input Delay) <100ms
- [ ] CLS (Cumulative Layout Shift) <0.1

### Functionality Tests

- [ ] Featured games display correctly
- [ ] Category filtering works
- [ ] Search returns correct results
- [ ] Games open without errors
- [ ] Favorites persist across sessions
- [ ] Recently played works
- [ ] Mobile responsive layout works
- [ ] Service worker activates

---

## Troubleshooting

### Pages Not Loading

**Issue:** 404 errors for game/category pages

**Solution:**
- Verify all pages were pushed to GitHub
- Check file permissions (should be 644)
- Verify paths are correct in sitemap

### CSS Not Loading

**Issue:** Unstyled pages

**Solution:**
- Verify `/css/` folder was uploaded
- Check file paths in HTML
- Clear browser cache
- Check for CORS issues

### Images Not Showing

**Issue:** Broken game images

**Solution:**
- Game images load from Playgama CDN
- Check internet connection
- Verify image URLs in games.json
- Check for CSP blocking

### Security Headers Not Applied

**Issue:** Headers missing when testing

**Solution:**
- Netlify/Vercel: Check configuration files exist
- GitHub Pages: Use Cloudflare Worker
- Test with: `curl -I https://yoursite.com`

### Build Failures

**Issue:** GitHub Actions or platform builds fail

**Solution:**
```bash
# Test builds locally first
npm run build:all

# Check for errors
git status

# Verify all dependencies
npm install
```

---

## CI/CD Pipeline (Optional)

For automated deployments, you can set up GitHub Actions:

### .github/workflows/deploy.yml

```yaml
name: Build & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate pages
        run: npm run build:all

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

---

## Rollback Plan

If issues arise after deployment:

### Quick Rollback

**GitHub Pages:**
```bash
git log --oneline -5  # Find previous commit
git revert HEAD
git push origin main
```

**Netlify/Vercel:**
- Use dashboard to rollback to previous deployment
- Click on previous deployment > "Publish deploy"

### Emergency Fix

```bash
# Revert to last known good version
git reset --hard <previous-commit-hash>
git push origin main --force  # Use with caution
```

---

## Summary

**Recommended Deployment Path:**

1. Test locally: `npm run dev`
2. Build all assets: `npm run build:all`
3. Deploy to Netlify or Vercel (easiest, best security)
4. Configure custom domain
5. Submit sitemap to Google/Bing
6. Monitor Search Console for issues

**Timeline:**
- Setup: 5-15 minutes (depending on platform)
- DNS propagation: 1-24 hours
- Search indexing: 1-7 days

**Support:**
- Platform documentation (Netlify, Vercel, GitHub Pages)
- Google Search Console help
- Playgama partner support

---

Ready to deploy! Choose your platform and follow the steps above.
