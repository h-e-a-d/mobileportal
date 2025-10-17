# Kloopik - Free Online Gaming Portal

A modern, serverless gaming website powered by Playgama's partner program. Built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Functionality
- **700+ Games**: Browse and play games from Playgama's extensive catalog
- **Category Filtering**: Filter games by genre (Action, Puzzle, Racing, Sports, etc.)
- **Search**: Real-time search across game titles, descriptions, and tags
- **Favorites**: Save favorite games locally (localStorage)
- **Recently Played**: Track recently played games
- **Responsive Design**: Mobile-first design that works on all devices

### Technical Features
- **SEO-Ready**: Semantic HTML, meta tags, prepared for multi-language support
- **Hash-Based Routing**: Clean URLs for game pages (#/game/game-slug)
- **Lazy Loading**: Efficient image loading for performance
- **Pagination**: Load more games for better initial load time
- **Local Storage**: Client-side data persistence
- **Dark Theme**: Modern CrazyGames-inspired design

## Project Structure

```
kloopik/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # All styles (variables, components, responsive)
├── js/
│   ├── app.js             # Main application logic and UI
│   ├── games.js           # Game data management and filtering
│   ├── storage.js         # localStorage for favorites/recent
│   └── router.js          # Hash-based routing and SEO meta tags
├── games.json             # Playgama game catalog (1.9MB, 700+ games)
└── README-KLOOPIK.md      # This file
```

## Setup & Installation

### Local Development

1. **Clone or download the project**

2. **Start a local web server**

Using Python:
```bash
python3 -m http.server 8000
```

Using Node.js:
```bash
npx serve .
```

Using PHP:
```bash
php -S localhost:8000
```

3. **Open in browser**
```
http://localhost:8000
```

### No Build Process Required
This is a static website with no dependencies or build tools. All files can be served directly.

## Deployment

### Static Hosting Options

**Netlify** (Recommended)
1. Drag and drop the project folder to Netlify
2. Or connect your Git repository
3. Deploy! (No build configuration needed)

**Vercel**
```bash
vercel --prod
```

**GitHub Pages**
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select main branch as source

**Cloudflare Pages**
1. Connect Git repository
2. Leave build settings empty
3. Deploy

**AWS S3 + CloudFront**
1. Upload files to S3 bucket
2. Enable static website hosting
3. Optional: Add CloudFront for CDN

**Firebase Hosting**
```bash
firebase init hosting
firebase deploy
```

### Custom Domain
After deploying, configure your custom domain (e.g., kloopik.com) in your hosting provider's settings.

## Configuration

### Replace CLID (Partner ID)

Your Playgama partner CLID is already embedded in the games.json file. Each game's `gameURL` contains your unique `clid` parameter:

```
https://playgama.com/export/game/game-name?clid=p_YOUR_CLID_HERE
```

If you need to update your CLID:
1. Download a fresh games.json from widgets.playgama.com (while logged in)
2. Replace the existing games.json file

### Customize Branding

**Colors** (in `css/styles.css`):
```css
:root {
    --color-primary: #ff6b35;       /* Main accent color */
    --color-secondary: #4a90e2;     /* Secondary accent */
    --color-bg-primary: #0a0a0f;    /* Background */
}
```

**Site Name** (in `index.html`):
```html
<h1>KLOOPIK</h1>
```

**Meta Tags** (in `index.html` and `js/router.js`):
Update title, description, and Open Graph tags

## SEO Optimization (Next Steps)

The website is already prepared for SEO with:
- Semantic HTML structure
- Meta tags (title, description, OG tags)
- Hash-based routing for game pages
- Alt text for images
- Proper heading hierarchy

### Recommended Next Steps:
1. **Add sitemap.xml**: Generate sitemap for all game pages
2. **robots.txt**: Control search engine crawling
3. **Multi-language support**: Add language routing (/en/, /es/, etc.)
4. **Server-side rendering**: Move to Next.js/Nuxt for better SEO
5. **Schema markup**: Add JSON-LD for game structured data
6. **Canonical URLs**: Add canonical tags for game pages
7. **Social sharing**: Optimize OG images per game

### Translation Preparation
The codebase is structured to easily add multi-language support:
- Router supports language paths (prepared but commented out)
- Meta tags can be dynamically updated per language
- Game data already includes English content

To add translations:
1. Create language JSON files (e.g., `lang/es.json`)
2. Uncomment i18n code in `router.js`
3. Update URL structure to include language prefix
4. Add language switcher to UI

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- **Initial Load**: ~2MB (games.json)
- **Lazy Loading**: Images loaded as needed
- **Pagination**: 48 games per page initially
- **Caching**: Browser caches static assets

### Optimization Tips:
1. Enable Gzip/Brotli compression on server
2. Use CDN for faster global delivery
3. Consider splitting games.json into chunks
4. Add service worker for offline support

## Analytics & Tracking

To add analytics, insert tracking code in `index.html`:

**Google Analytics 4**:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Partner Revenue

All games embed Playgama's iframe with your CLID parameter. Revenue is tracked automatically through:
- Ad impressions in games
- In-app purchases (if applicable)
- User engagement metrics

Track your earnings at: https://widgets.playgama.com/dashboard

## Support & Issues

For Playgama partner support:
- Email: partners@playgama.com
- Discord: Partner Network

## License

Games are provided by Playgama. Website code is available for use as a Playgama partner.

## Credits

- **Games**: Provided by Playgama
- **Design Inspiration**: CrazyGames
- **Fonts**: Google Fonts (Inter)

---

Built with ❤️ for Playgama Partners
