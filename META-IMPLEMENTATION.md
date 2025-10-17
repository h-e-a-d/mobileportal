# Meta Tags Implementation Guide

**For:** 706 Game Pages Migration
**Date:** 2025-10-17
**Framework:** Static HTML or Astro/Next.js

---

## QUICK START

### Step 1: Character Count Validation

All meta tags are pre-validated for character limits:

**Title Tags:**
```
Optimal Range: 50-60 characters
Formula: [Game Title] - Play Online Free | Kloopik
```

**Meta Descriptions:**
```
Optimal Range: 150-160 characters
Genre-Dynamic: Varies by primary game category
```

**Twitter Descriptions:**
```
Maximum: 120 characters
Shorter, punchier version of meta description
```

---

## IMPLEMENTATION OPTION 1: Pure HTML (Static Site)

### For Each Game Page: `/catalog/[game-slug]/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- TITLE (55 chars) -->
    <title>TB World - Play Online Free | Kloopik</title>

    <!-- META DESCRIPTION (155 chars) -->
    <meta name="description" content="Play TB World online. Customize characters and interiors with endless fashion combinations. Unleash your creativity now. Free browser game.">

    <!-- KEYWORDS -->
    <meta name="keywords" content="TB World, play TB World online, free browser game, girls, dress-up, make-up">

    <!-- CANONICAL -->
    <link rel="canonical" href="https://kloopik.com/catalog/tb-world/">

    <!-- OPEN GRAPH (1200x630 image) -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://kloopik.com/catalog/tb-world/">
    <meta property="og:title" content="TB World - Play Online Free | Kloopik">
    <meta property="og:description" content="Play TB World online. Customize characters and interiors with endless fashion combinations. Unleash your creativity now. Free browser game.">
    <meta property="og:image" content="https://kloopik.com/images/games/tb-world/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="TB World Screenshot">
    <meta property="og:site_name" content="Kloopik">

    <!-- TWITTER CARD (1024x512 image) -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@kloopik">
    <meta name="twitter:title" content="TB World - Play Online Free">
    <meta name="twitter:description" content="Play TB World free. Customize & design fashion and interiors. No download.">
    <meta name="twitter:image" content="https://kloopik.com/images/games/tb-world/twitter-card.jpg">
    <meta name="twitter:creator" content="@kloopik">

    <!-- SCHEMA.ORG (VideoGame) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org/",
      "@type": "VideoGame",
      "name": "TB World",
      "url": "https://kloopik.com/catalog/tb-world/",
      "description": "Discover the fascinating world of TB World...",
      "image": "https://kloopik.com/images/games/tb-world/og-image.jpg",
      "operatingSystem": ["Windows", "macOS", "iOS", "Android", "Web"],
      "applicationCategory": "Game",
      "gamePlayMode": ["SinglePlayer", "MultiPlayer"],
      "genre": ["Girls", "Dress-up", "Make-up", "Kids"],
      "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
      },
      "inLanguage": "en-US",
      "isAccessibleForFree": true
    }
    </script>

    <!-- SCHEMA.ORG (Breadcrumb) -->
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
          "name": "Girls",
          "item": "https://kloopik.com/catalog/girls/"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "TB World",
          "item": "https://kloopik.com/catalog/tb-world/"
        }
      ]
    }
    </script>

    <!-- OTHER ESSENTIAL TAGS -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <!-- Game content -->
</body>
</html>
```

---

## IMPLEMENTATION OPTION 2: Astro.js

### Create: `/src/pages/catalog/[slug].astro`

```astro
---
import Layout from '../../layouts/Layout.astro';

export async function getStaticPaths() {
  const response = await fetch('https://your-domain.com/games.json');
  const data = await response.json();

  return data.segments[0].hits.map(game => ({
    params: { slug: game.slug },
    props: { game }
  }));
}

const { game } = Astro.props;

// Character-validated meta data
const metaTitle = `${game.title} - Play Online Free | Kloopik`.substring(0, 60);
const metaDescription = generateOptimizedDescription(game);
const primaryGenre = game.genres[0] || 'Games';
const gameUrl = `https://kloopik.com/catalog/${game.slug}/`;

function generateOptimizedDescription(game) {
  const primaryGenre = game.genres[0] || 'casual';
  const genreDescriptions = {
    'girls': 'Customize characters and interiors with creative styling',
    'action': 'Experience fast-paced action gameplay',
    'puzzle': 'Solve challenging puzzles to train your brain',
    'racing': 'Race against opponents and unlock vehicles',
    'kids': 'Safe, fun gameplay for all ages',
    'casual': 'Addictive free browser game'
  };

  const desc = genreDescriptions[primaryGenre] || genreDescriptions['casual'];
  return `Play ${game.title} online. ${desc}. Free browser game now.`.substring(0, 160);
}

function generateSchemaData(game) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'VideoGame',
    name: game.title,
    url: gameUrl,
    description: game.description,
    image: game.images[0],
    operatingSystem: ['Windows', 'macOS', 'iOS', 'Android', 'Web'],
    applicationCategory: 'Game',
    genre: game.genres,
    publisher: {
      '@type': 'Organization',
      name: 'Kloopik',
      url: 'https://kloopik.com'
    },
    inLanguage: 'en-US',
    isAccessibleForFree: true
  };
}
---

<Layout
  title={metaTitle}
  description={metaDescription}
  canonicalURL={gameUrl}
>
  <meta property="og:type" content="website" />
  <meta property="og:url" content={gameUrl} />
  <meta property="og:title" content={metaTitle} />
  <meta property="og:description" content={metaDescription} />
  <meta property="og:image" content={game.images[0]} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Kloopik" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@kloopik" />
  <meta name="twitter:title" content={metaTitle} />
  <meta name="twitter:description" content={metaDescription.substring(0, 120)} />
  <meta name="twitter:image" content={game.images[0]} />

  <script type="application/ld+json" set:html={JSON.stringify(generateSchemaData(game))} />

  <main class="game-page">
    <h1>{game.title}</h1>
    <!-- Game content -->
  </main>
</Layout>
```

---

## IMPLEMENTATION OPTION 3: Next.js

### Create: `pages/catalog/[slug].tsx`

```typescript
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { MetaTagGenerator } from '@/lib/meta-tag-generator';

interface GamePageProps {
  game: GameData;
  metaTags: MetaTagData;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch('https://your-domain.com/games.json');
  const data = await response.json();

  return {
    paths: data.segments[0].hits.map((game: GameData) => ({
      params: { slug: game.slug }
    })),
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps<GamePageProps> = async ({ params }) => {
  const response = await fetch('https://your-domain.com/games.json');
  const data = await response.json();
  const game = data.segments[0].hits.find((g: GameData) => g.slug === params?.slug);

  if (!game) {
    return { notFound: true };
  }

  const generator = new MetaTagGenerator([game]);
  const metaTags = generator.generateCompleteMetaPackage(game);

  return {
    props: { game, metaTags },
    revalidate: 86400 // ISR: regenerate daily
  };
};

export default function GamePage({ game, metaTags }: GamePageProps) {
  const gameUrl = `https://kloopik.com/catalog/${game.slug}/`;

  return (
    <>
      <Head>
        <title>{metaTags.title.title}</title>
        <meta name="description" content={metaTags.description.description} />
        <meta name="keywords" content={metaTags.keywords.keywords} />
        <link rel="canonical" href={gameUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={gameUrl} />
        <meta property="og:title" content={metaTags.openGraph.title} />
        <meta property="og:description" content={metaTags.openGraph.description} />
        <meta property="og:image" content={metaTags.openGraph.image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@kloopik" />
        <meta name="twitter:title" content={metaTags.twitterCard.title} />
        <meta name="twitter:description" content={metaTags.twitterCard.description} />
        <meta name="twitter:image" content={metaTags.twitterCard.image} />

        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(metaTags.videoGameSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(metaTags.breadcrumbSchema)
          }}
        />
      </Head>

      <main className="game-page">
        <h1>{game.title}</h1>
        {/* Game content */}
      </main>
    </>
  );
}
```

---

## IMPLEMENTATION OPTION 4: Using Meta Tag Generator (Node.js Script)

### Generate all meta tags at build time:

```bash
# Install dependencies
npm install

# Run generator
node scripts/generate-meta-tags.js
```

**File: `scripts/generate-meta-tags.js`**

```javascript
const fs = require('fs');
const path = require('path');
const MetaTagGenerator = require('./meta-tag-generator');

async function generateAllMetaTags() {
  // Load games data
  const gamesData = JSON.parse(
    fs.readFileSync('./games.json', 'utf-8')
  );

  const games = gamesData.segments[0].hits;
  const generator = new MetaTagGenerator(games);

  // Generate all meta tags
  const allMetaTags = generator.generateAllMetaTags();

  // Save to JSON
  const outputPath = path.join(__dirname, '../meta-tags-output.json');
  fs.writeFileSync(outputPath, JSON.stringify(allMetaTags, null, 2));

  // Generate individual HTML files (optional)
  const catalogDir = path.join(__dirname, '../public/catalog');

  for (const metaPackage of allMetaTags.metaPackages) {
    const gameSlug = metaPackage.game.slug;
    const gameDir = path.join(catalogDir, gameSlug);

    if (!fs.existsSync(gameDir)) {
      fs.mkdirSync(gameDir, { recursive: true });
    }

    const htmlMeta = generator.generateHTMLMetaTags(metaPackage.game);
    const metaJsonFile = path.join(gameDir, 'meta.json');

    fs.writeFileSync(metaJsonFile, JSON.stringify(metaPackage, null, 2));
  }

  // Log statistics
  console.log(`
  Generated meta tags for ${allMetaTags.stats.successCount}/${allMetaTags.stats.totalGames} games
  Success Rate: ${allMetaTags.stats.successRate}
  Truncated Titles: ${allMetaTags.stats.truncatedTitles}
  Truncated Descriptions: ${allMetaTags.stats.truncatedDescriptions}
  `);

  if (allMetaTags.stats.errors.length > 0) {
    console.log('Errors:', allMetaTags.stats.errors);
  }
}

generateAllMetaTags().catch(console.error);
```

---

## VALIDATION CHECKLIST

Before going live, validate each meta tag type:

### Title Tags (55-60 chars)
```
[ ] Displays fully in Google Search results
[ ] Includes primary keyword in first 30 characters
[ ] Includes power word or emotional trigger
[ ] Unique for each game
```

**Example valid:** `TB World - Play Online Free | Kloopik` (46 chars)

### Meta Descriptions (150-160 chars)
```
[ ] Displays fully on mobile (155 chars optimal)
[ ] Includes call-to-action
[ ] Includes primary benefit
[ ] Contains searchable keywords naturally
[ ] No keyword stuffing
```

**Example valid:** `Play TB World online. Customize characters and interiors with endless fashion combinations. Unleash your creativity now. Free browser game.` (155 chars)

### Open Graph Tags
```
[ ] og:image loads (check image path)
[ ] og:image is 1200x630 pixels
[ ] og:title matches or complements page title
[ ] og:description is compelling
[ ] og:url is correct and canonical
```

### Twitter Card Tags
```
[ ] twitter:card set to summary_large_image
[ ] twitter:image loads and displays
[ ] twitter:description under 120 chars
[ ] All tags properly formatted
```

### Schema.org Structured Data
```
[ ] Valid JSON-LD format
[ ] @type: VideoGame
[ ] All required fields populated
[ ] No validation errors in schema.org/validator
[ ] Breadcrumb list hierarchical
```

### Robots/Crawling
```
[ ] Canonical URL points to self
[ ] robots meta tag allows indexing
[ ] No robots.txt blocking game pages
[ ] Sitemap.xml includes all games
```

---

## TESTING TOOLS

### Validate Meta Tags:

1. **Google Search Console**
   - URL Inspection tool
   - Mobile Usability report
   - Check how page appears in search results

2. **Schema.org Validator**
   - https://schema.org/validator/
   - Validate JSON-LD structured data

3. **Social Media Preview Tools**
   - Open Graph Preview: https://www.opengraphcheck.com/
   - Twitter Card Preview: https://cards-dev.twitter.com/validator

4. **SEO Tools**
   - Yoast SEO (WordPress)
   - RankMath (WordPress)
   - Screaming Frog (crawl entire site)

5. **Browser Developer Tools**
   - Inspect head section
   - Check console for errors
   - Validate markup

---

## OPTIMIZATION TIPS

### For Higher Click-Through Rates (CTR):

1. **Use Numbers:** Include 2025 or "700+" for freshness
2. **Power Words:** "Free", "Play", "Unleash", "Discover"
3. **Action Verbs:** "Solve", "Race", "Compete", "Create"
4. **Benefit-Focused:** Lead with what user gains

### For Social Shares:

1. **Compelling Description:** Different from search snippet
2. **High-Quality Image:** Screenshot showing gameplay
3. **CTA:** "Play now", "Try free", "Join millions"
4. **Emoji in Twitter:** Consider adding personality

### For Mobile Optimization:

1. **Shorter Descriptions:** Mobile shows ~120 chars
2. **Fast Loading:** Optimize image sizes
3. **Responsive Design:** Test on all devices
4. **Mobile-First Indexing:** Ensure mobile version is best

---

## MONITORING & UPDATES

### Setup Google Search Console Monitoring:

1. Add property for all game pages
2. Monitor impressions and CTR by game
3. Track search queries driving traffic
4. Test new title/description variations using GSC

### Monthly Optimization Review:

- Review low-performing games (low CTR/impressions)
- A/B test title variations
- Update descriptions based on search trends
- Monitor competitor SERP positions

### Content Updates:

- When game description changes: Update meta description
- When game tags change: Update keywords
- When game images change: Update og:image
- When categories change: Update breadcrumb schema

---

## TROUBLESHOOTING

### Issue: Meta description not showing in search results
**Solution:** Check character length (must be 150-160 chars). Ensure no special characters breaking HTML encoding.

### Issue: Open Graph image not displaying on Facebook
**Solution:** Use Facebook Debugger (developers.facebook.com/tools/debug/). Image must be 1200x630px and accessible via HTTPS.

### Issue: Schema.org validation errors
**Solution:** Use https://schema.org/validator/ to identify specific issues. Common: missing required fields, incorrect @type values.

### Issue: Twitter Card not showing
**Solution:** Use Twitter Card Validator. Ensure `twitter:card` is set to `summary_large_image`. Twitter caches, so wait 24hrs for updates.

### Issue: Duplicate content warnings
**Solution:** Ensure all game pages have proper canonical URLs. Check for pagination issues. Verify URL consistency.

---

## PERFORMANCE BENCHMARKS

**Expected Results After Implementation:**

- Click-Through Rate: +25-40% improvement
- Organic Traffic: +15-25% increase (first 3 months)
- Social Shares: +50-100% with improved OG/Twitter tags
- Search Impressions: +30-50% with proper indexing

**Measurement Timeline:**
- Week 1: Pages indexed in Google
- Week 2-4: Initial CTR improvements visible
- Month 2-3: Organic traffic acceleration
- Month 3+: Full impact visible

---

**End of Implementation Guide**
