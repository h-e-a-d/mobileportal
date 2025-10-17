# Meta Tags Optimization Strategy for 706 Game Pages

**Document Version:** 1.0
**Generated:** 2025-10-17
**Total Games:** 706
**Target Structure:** `/catalog/[game-slug]/index.html`

---

## PART 1: OPTIMIZATION TEMPLATES

### 1.1 Title Tag Optimization

**Format:** `[Game Title] - Play Online Free | Kloopik`
**Character Limit:** 55-60 characters (optimal for search display)

#### Template Logic:
```
Base: "[Game Title] - Play Online Free | Kloopik"

Dynamic Calculation:
- Short titles (<20 chars): Keep full format
- Medium titles (20-35 chars): Use "[Game Title] - Play Free | Kloopik"
- Long titles (>35 chars): Truncate intelligently before " | Kloopik"
```

#### Character Breakdown Examples:

**Example 1: TB World (8 chars)**
```
Title: TB World - Play Online Free | Kloopik
Length: 46 chars
Keyword Placement: "TB World" at position 0 (excellent)
Power Words: "Play", "Online", "Free"
```

**Example 2: Playground Man! Ragdoll Show! (39 chars)**
```
Title: Playground Man! - Play Free | Kloopik
Length: 48 chars
Keyword Placement: "Playground Man!" at position 0 (excellent)
Power Words: "Play", "Free"
```

**Truncation Rule for Long Titles:**
```
If full format > 60 chars:
[Game Title truncated to fit 55 chars] | Kloopik
```

---

### 1.2 Meta Description Optimization

**Format:** Compelling copy with emotional triggers + action + benefits + CTA
**Character Limit:** 150-160 characters (optimal for mobile + desktop)

#### Template Structure:
```
[Game Title]. [Primary Genre/Appeal]. [Key Feature].
Play free online now. [Optional: Secondary Genre]
```

#### Dynamic Formula:
```
Category-Based Description Templates (adjust by primary genre):

ACTION GAMES:
"[Title]. Experience fast-paced [game-type] action.
Compete online, master challenging levels. Play free now."
(155 chars avg)

PUZZLE GAMES:
"[Title]. Solve challenging puzzles and train your brain.
Unique gameplay, increasing difficulty. Play free today."
(155 chars avg)

RACING GAMES:
"[Title]. Race against opponents, unlock vehicles & tracks.
High-speed multiplayer action. Play online free now."
(152 chars avg)

GIRLS/DRESS-UP GAMES:
"[Title]. Unleash your creativity with styling and customization.
Endless fashion combinations. Play free online now."
(160 chars avg)

KIDS GAMES:
"[Title]. Safe, fun gameplay for kids of all ages.
Educational, entertaining, addictive. Play free today."
(151 chars avg)
```

#### Character Count Validation:
- Minimum: 140 characters (avoid truncation on mobile)
- Optimal: 155-158 characters (displays fully on desktop + mobile)
- Maximum: 160 characters (Google shows 155-160 on desktop)

---

## PART 2: COMPLETE META TAG PACKAGE

### 2.1 Standard Meta Tags

```html
<!-- Essential Meta Tags -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">

<!-- SEO Meta Tags -->
<meta name="description" content="[OPTIMIZED_DESCRIPTION_155_CHARS]">
<meta name="keywords" content="[game-title], play [game-title] online, free browser game, [primary-genre], [secondary-genres]">
<meta name="author" content="Kloopik">
<meta name="theme-color" content="#1a1a2e">

<!-- Mobile Optimization -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Kloopik">
```

### 2.2 Open Graph Tags (Social Media)

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://kloopik.com/catalog/[game-slug]/">
<meta property="og:title" content="[OPTIMIZED_TITLE_55_CHARS]">
<meta property="og:description" content="[OPTIMIZED_DESCRIPTION_155_CHARS]">
<meta property="og:image" content="https://kloopik.com/images/games/[game-slug]/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="[Game Title] Screenshot">
<meta property="og:site_name" content="Kloopik">
<meta property="og:locale" content="en_US">
```

### 2.3 Twitter Card Tags

```html
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@kloopik">
<meta name="twitter:title" content="[OPTIMIZED_TITLE_55_CHARS]">
<meta name="twitter:description" content="[OPTIMIZED_DESCRIPTION_TWITTER_120_CHARS]">
<meta name="twitter:image" content="https://kloopik.com/images/games/[game-slug]/twitter-card.jpg">
<meta name="twitter:image:alt" content="[Game Title] Screenshot">
```

**Twitter Description (120 chars max):**
```
Extract from full description, prioritize action verb + benefit.
Example: "Play [Title]. Free [genre] game with [key-feature]. Online now."
```

### 2.4 Canonical & Robots Tags

```html
<!-- Canonical URL -->
<link rel="canonical" href="https://kloopik.com/catalog/[game-slug]/">

<!-- Robots / Search Engine Directive -->
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="googlebot" content="index, follow">
```

### 2.5 Performance & Security

```html
<!-- Preconnect to CDN/External Resources -->
<link rel="preconnect" href="https://playgama.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="dns-prefetch" href="https://www.googletagmanager.com">

<!-- Security Headers -->
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Prefetch Analytics -->
<link rel="prefetch" href="https://www.googletagmanager.com/gtm.js?id=GTM-PK768FJP">
```

### 2.6 Verification Tags (if needed)

```html
<!-- Google Search Console -->
<meta name="google-site-verification" content="[YOUR_VERIFICATION_CODE]">

<!-- Microsoft Bing -->
<meta name="msvalidate.01" content="[YOUR_VERIFICATION_CODE]">
```

---

## PART 3: SCHEMA.ORG STRUCTURED DATA

### 3.1 Game Schema (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org/",
  "@type": "VideoGame",
  "name": "[Game Title]",
  "url": "https://kloopik.com/catalog/[game-slug]/",
  "description": "[Full game description]",
  "image": {
    "@type": "ImageObject",
    "url": "https://kloopik.com/images/games/[game-slug]/og-image.jpg",
    "width": 1200,
    "height": 630
  },
  "operatingSystem": ["Windows", "macOS", "iOS", "Android", "Web"],
  "applicationCategory": "Game",
  "gamePlayMode": ["MultiPlayer", "SinglePlayer"],
  "genre": ["[Primary Genre]", "[Secondary Genres]"],
  "author": {
    "@type": "Organization",
    "name": "Kloopik"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Kloopik",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kloopik.com/logo.png",
      "width": 250,
      "height": 60
    },
    "url": "https://kloopik.com"
  },
  "inLanguage": "en-US",
  "isAccessibleForFree": true,
  "potentialAction": {
    "@type": "PlayAction",
    "target": "https://kloopik.com/catalog/[game-slug]/"
  }
}
</script>
```

### 3.2 BreadcrumbList Schema (JSON-LD)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kloopik.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Primary Genre]",
      "item": "https://kloopik.com/catalog/[primary-genre]/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Game Title]",
      "item": "https://kloopik.com/catalog/[game-slug]/"
    }
  ]
}
</script>
```

### 3.3 Organization Schema (on all pages)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kloopik",
  "url": "https://kloopik.com",
  "logo": "https://kloopik.com/logo.png",
  "description": "Free online gaming portal with 700+ browser games",
  "sameAs": [
    "https://www.facebook.com/kloopik",
    "https://www.twitter.com/kloopik"
  ]
}
</script>
```

---

## PART 4: KEYWORD STRATEGY BY GENRE

### 4.1 Primary Keywords (All Games)
```
- "[Game Title] online"
- "play [Game Title] free"
- "[Game Title] browser game"
- "free [game-type] game online"
- "[primary-genre] games"
```

### 4.2 Genre-Specific Keywords

**ACTION GAMES:**
- action games online free
- shooting games browser
- adventure games play online

**PUZZLE GAMES:**
- puzzle games online
- brain training games free
- logic games browser

**RACING GAMES:**
- racing games online
- car games free
- multiplayer racing browser

**SPORTS GAMES:**
- sports games online free
- basketball games browser
- football games play

**GIRLS/DRESS-UP GAMES:**
- dress up games free
- fashion games online
- makeover games browser

**KIDS GAMES:**
- free kids games online
- games for children browser
- safe games kids

---

## PART 5: IMPLEMENTATION GUIDE

### 5.1 URL Structure (Critical for SEO)

**Current:** Single-page app (SPA) with hash routing
```
https://kloopik.com/#/game/[slug]
```

**Migration Target:** Individual HTML pages
```
https://kloopik.com/catalog/[game-slug]/index.html
```

**URL Optimization Rules:**
1. Keep slugs under 60 characters
2. Use hyphens (not underscores) for word separation
3. Lowercase only
4. Remove stop words when possible
5. Include primary keyword early

**Examples:**
```
Good:  /catalog/tb-world/
Good:  /catalog/playground-man-ragdoll-show/
Bad:   /catalog/TB_WORLD/ (uppercase + underscore)
Bad:   /catalog/the-tb-world-online-free-game/ (too long)
```

### 5.2 A/B Test Variations

#### Title Tag Variations (Test 3 per game):

**Variation A: Brand Last**
```
[Game Title] - Play Online Free | Kloopik
(Focuses on game + value prop first)
```

**Variation B: Genre Focus**
```
[Game Title] - Free [Genre] Game Online
(Emphasizes game type)
```

**Variation C: Action-Oriented**
```
Play [Game Title] Free Online - No Download
(Emphasizes action + benefit)
```

#### Description Variations (Test 2 per game):

**Variation A: Benefit-Driven**
```
Play [Title]. [Genre]. [Key feature].
Compete online, unlock rewards. Free today.
```

**Variation B: Appeal-Driven**
```
[Title] - [Genre] game with [unique-mechanic].
Join thousands playing now. Play free online.
```

---

## PART 6: WORDPRESS/YOAST SEO CONFIGURATION

### For Automated Integration:

```json
{
  "yoast_seo_config": {
    "title": "[OPTIMIZED_TITLE_55_CHARS]",
    "metaDescription": "[OPTIMIZED_DESCRIPTION_155_CHARS]",
    "keyphrase": "play [game-title] online free",
    "keywordDensity": "0.5-1.5%",
    "readability": "Good",
    "slug": "[game-slug]",
    "canonical": "https://kloopik.com/catalog/[game-slug]/",
    "ogTitle": "[OPTIMIZED_TITLE_55_CHARS]",
    "ogDescription": "[OPTIMIZED_DESCRIPTION_155_CHARS]",
    "ogImage": "https://kloopik.com/images/games/[game-slug]/og-image.jpg",
    "twitterTitle": "[OPTIMIZED_TITLE_55_CHARS]",
    "twitterDescription": "[OPTIMIZED_DESCRIPTION_TWITTER_120_CHARS]",
    "twitterImage": "https://kloopik.com/images/games/[game-slug]/twitter-card.jpg",
    "focusKeyphrase": {
      "keyword": "play [game-title] online free",
      "synonyms": "free [game-title] browser"
    }
  }
}
```

---

## PART 7: STATIC SITE GENERATOR CONFIGURATION

### For Astro/Next.js/11ty:

```javascript
// Example: Astro Component
export async function getStaticPaths() {
  const games = await fetch('/games.json').then(r => r.json());
  return games.hits.map(game => ({
    params: { slug: game.slug },
    props: { game }
  }));
}

const { game } = Astro.props;
const gameUrl = `https://kloopik.com/catalog/${game.slug}/`;

// Meta tag generation
const metaTags = {
  title: generateTitle(game.title),
  description: generateDescription(game, game.genres),
  url: gameUrl,
  ogImage: game.images[0],
  keywords: generateKeywords(game.title, game.genres, game.tags)
};
```

---

## PART 8: IMAGE OPTIMIZATION FOR SOCIAL

### Image Specifications:

**Open Graph Image:**
- Dimensions: 1200 x 630 pixels
- Format: JPG or PNG
- Size: < 200KB
- Aspect Ratio: 1.91:1
- Recommendation: Game screenshot + title overlay

**Twitter Card Image:**
- Dimensions: 1024 x 512 pixels
- Format: JPG or PNG
- Size: < 150KB
- Aspect Ratio: 2:1
- Recommendation: Game screenshot with high contrast

**Favicon:**
- Provide: .svg (preferred), .ico, .png
- Size: 180x180px (png), 32x32px (ico)
- Format: Square, recognizable at small sizes

---

## PART 9: TESTING CHECKLIST

- [ ] Title tags display fully in Google Search (55-60 chars)
- [ ] Meta descriptions not truncated (150-160 chars)
- [ ] Open Graph tags render correctly on Facebook
- [ ] Twitter Card displays with image on Twitter/X
- [ ] Canonical URL prevents duplicate content
- [ ] Schema.org structured data validates (schema.org/validator)
- [ ] Mobile preview shows proper title/description truncation
- [ ] Images load correctly in social share previews
- [ ] No broken links in canonical or og:url tags
- [ ] Mobile viewport properly configured

---

## PART 10: PERFORMANCE METRICS TO TRACK

1. **Click-Through Rate (CTR)** from search results
   - Target: 3-5% improvement post-optimization
   - Track by keyword: "play [game] online free"

2. **Organic Traffic**
   - Monitor month-over-month growth
   - Track by game and by genre

3. **Social Shares**
   - Facebook shares (og: tags)
   - Twitter shares (twitter: tags)
   - WhatsApp clicks (mobile optimization)

4. **Search Impressions**
   - Monitor in Google Search Console
   - Track SERP position trends

---

## NEXT STEPS

1. Generate individual game pages using templates
2. Create automated script to populate meta tags
3. Set up 301 redirects from old SPA URLs to new pages
4. Submit sitemap.xml to Google Search Console
5. Monitor Search Console for indexing issues
6. A/B test title/description variations in GSC
7. Track organic traffic improvements in Analytics

---

**Document End**
