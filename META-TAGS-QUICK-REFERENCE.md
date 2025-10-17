# Meta Tags Quick Reference Card

**For:** 706 Game Pages | Kloopik Game Portal
**Version:** 1.0 | **Date:** 2025-10-17

---

## CRITICAL CHARACTER LIMITS

| Element | Min | Optimal | Max | Notes |
|---------|-----|---------|-----|-------|
| Title Tag | 30 | 55-60 | 70 | Desktop shows 50-60, Mobile 30-45 |
| Meta Description | 140 | 155-160 | 160 | Desktop 155-160, Mobile 120-130 |
| Twitter Description | 90 | 100-120 | 120 | Shorter, punchier version |
| Keywords | N/A | 5-10 | N/A | Comma-separated, no stuffing |
| OG Image | N/A | 1200x630 | N/A | Aspect ratio 1.91:1 |
| Twitter Image | N/A | 1024x512 | N/A | Aspect ratio 2:1 |

---

## TITLE TAG TEMPLATE

**Formula:** `[Game Title] - Play Online Free | Kloopik`

### Examples (with character counts):

```
TB World - Play Online Free | Kloopik
[46 chars] PASS

Playground Man! Ragdoll Show! - Play Free | Kloopik
[52 chars] PASS

Super Long Game Title With Many Words - Play Free
[50 chars - truncated] PASS
```

### Truncation Algorithm:
```
If length <= 60:  Use "[Game] - Play Online Free | Kloopik"
If length 61-70:  Use "[Game] - Play Free | Kloopik"
If length > 70:   Use "[Game truncated] | Kloopik"
```

---

## META DESCRIPTION TEMPLATE BY GENRE

### ACTION GAMES
```
Play [Game Title] online. Experience fast-paced action.
Compete online, unlock rewards. Free browser game now.
[155 chars]
```

### PUZZLE GAMES
```
[Game Title] - Solve challenging puzzles. Train your brain
with unique gameplay and increasing difficulty. Play free today.
[156 chars]
```

### RACING GAMES
```
Race in [Game Title] online. Unlock vehicles and tracks.
High-speed multiplayer action with opponents worldwide.
Play free now.
[152 chars]
```

### SPORTS GAMES
```
[Game Title] - Compete in sports online. Realistic gameplay
with achievements and leaderboards. Play free browser game.
[154 chars]
```

### GIRLS/DRESS-UP GAMES
```
[Game Title]. Unleash your creativity with styling and
customization. Endless fashion combinations. Play free now.
[158 chars]
```

### KIDS GAMES
```
[Game Title] - Safe, fun gameplay for kids. Educational,
entertaining, and addictive. Perfect for all ages.
Play free today.
[151 chars]
```

### CASUAL/OTHER
```
Play [Game Title] online. Addictive free browser game with
[genre tags]. Join thousands playing now. No download needed.
[158 chars]
```

---

## COMPLETE META TAG PACKAGE (Minimal HTML)

```html
<!-- TITLE -->
<title>TB World - Play Online Free | Kloopik</title>

<!-- META -->
<meta name="description" content="Play TB World online. Customize characters and interiors. Endless fashion combinations. Play free now.">
<meta name="keywords" content="TB World, play TB World online, dress-up games, girls games">
<link rel="canonical" href="https://kloopik.com/catalog/tb-world/">

<!-- OG -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://kloopik.com/catalog/tb-world/">
<meta property="og:title" content="TB World - Play Online Free | Kloopik">
<meta property="og:description" content="Play TB World online. Customize characters and interiors. Endless combinations. Play free.">
<meta property="og:image" content="https://kloopik.com/images/games/tb-world/og-1200x630.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- TWITTER -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@kloopik">
<meta name="twitter:title" content="TB World - Play Free">
<meta name="twitter:description" content="Play TB World. Customize & design. No download.">
<meta name="twitter:image" content="https://kloopik.com/images/games/tb-world/twitter-1024x512.jpg">

<!-- SCHEMA -->
<script type="application/ld+json">
{"@context":"https://schema.org/","@type":"VideoGame","name":"TB World","url":"https://kloopik.com/catalog/tb-world/","image":"https://kloopik.com/images/games/tb-world/og-1200x630.jpg","operatingSystem":["Windows","macOS","iOS","Android","Web"],"genre":["Girls","Dress-up","Make-up"]}
</script>
```

---

## URL STRUCTURE

**Good:**
```
/catalog/tb-world/
/catalog/playground-man-ragdoll-show/
/catalog/action-adventure-games/
```

**Bad:**
```
/catalog/TB_World/ (uppercase + underscore)
/catalog/the-tb-world-free-online-game/ (too long, stop words)
/catalog/tb-world?param=value (avoid query strings)
```

### URL Rules:
- Keep under 60 characters
- Lowercase only
- Hyphens for word separation
- Remove stop words (the, a, and)
- Include primary keyword first

---

## POWER WORDS FOR META TAGS

### Action/Energy Words
```
Play, Unleash, Discover, Experience, Compete, Master,
Challenge, Conquer, Dominate, Thrash
```

### Benefit Words
```
Free, Easy, Quick, Addictive, Fun, Creative, Relaxing,
Exciting, Amazing, Incredible
```

### Call-to-Action Words
```
Play Now, Try Free, Join Now, Start Today, Play Today,
No Download, Instant Play
```

### Numbers (for freshness)
```
700+, 2025, 25+, 1000+, #1, Top, Best
```

---

## OPEN GRAPH IMAGE SPECIFICATIONS

**Dimensions:** 1200 x 630 pixels (1.91:1 ratio)
**Format:** JPG or PNG
**File Size:** < 200KB
**HTTPS:** Required

**Design Tips:**
- Use game screenshot as base
- Add semi-transparent overlay
- Include game title as text overlay
- Ensure text is readable at 300x300px thumbnail
- Use high contrast colors

---

## TWITTER CARD SPECIFICATIONS

**Dimensions:** 1024 x 512 pixels (2:1 ratio)
**Format:** JPG or PNG
**File Size:** < 150KB
**HTTPS:** Required

**Design Tips:**
- Slightly different crop than OG image
- Focus on most striking game element
- Include title text in image
- Use 18pt+ font for readability
- High contrast background

---

## SCHEMA.ORG MINIMUM REQUIRED

```json
{
  "@context": "https://schema.org/",
  "@type": "VideoGame",
  "name": "Game Title",
  "url": "https://kloopik.com/catalog/game-slug/",
  "description": "Game description",
  "image": "https://kloopik.com/images/games/game-slug/og-1200x630.jpg",
  "operatingSystem": ["Windows", "macOS", "iOS", "Android", "Web"],
  "applicationCategory": "Game",
  "genre": ["Primary Genre", "Secondary Genre"],
  "inLanguage": "en-US",
  "isAccessibleForFree": true
}
```

---

## VALIDATION CHECKLIST (Per Game Page)

### Pre-Launch
- [ ] Title tag is 55-60 characters
- [ ] Meta description is 150-160 characters
- [ ] No special characters breaking HTML
- [ ] Canonical URL points to self
- [ ] OG image exists and loads
- [ ] Twitter image exists and loads
- [ ] Schema.org validates (no errors)
- [ ] All URLs are HTTPS
- [ ] Images are optimized (<200KB OG, <150KB Twitter)

### Post-Launch (Monitor)
- [ ] Page indexed in Google Search
- [ ] Schema appears in Google Search results
- [ ] Social preview displays correctly on Facebook
- [ ] Twitter Card shows on Twitter shares
- [ ] Mobile rendering displays full title/description

---

## GENRE-SPECIFIC KEYWORDS

### ACTION
- action games online free
- shooting games browser
- adventure games play online
- fast-paced games

### PUZZLE
- puzzle games online
- brain training games
- logic games browser
- solve puzzles free

### RACING
- racing games online free
- car games browser
- multiplayer racing
- speed games online

### SPORTS
- sports games online
- basketball games free
- football games browser
- competitive sports

### GIRLS/DRESS-UP
- dress up games free
- fashion games online
- makeover games
- styling games browser

### KIDS
- free kids games online
- games for children
- safe games kids
- educational games

---

## COMMON MISTAKES TO AVOID

| Mistake | Problem | Solution |
|---------|---------|----------|
| Title > 60 chars | Truncated in search | Use truncation algorithm |
| Description < 140 chars | Looks incomplete | Pad to 150-160 chars |
| Missing canonical | Duplicate content issues | Always include canonical |
| OG image wrong size | Distorted on Facebook | Use 1200x630 exactly |
| Schema @type wrong | Not recognized by Google | Use "VideoGame" type |
| Keywords stuffed | Penalized by Google | 5-10 keywords maximum |
| Non-HTTPS URLs | Security warnings | All URLs must be HTTPS |
| Broken og:image | Empty preview | Test image URLs before launch |

---

## REAL-WORLD EXAMPLES

### Example 1: Girls/Dress-Up Game
```
Slug: tb-world
Title: TB World - Play Online Free | Kloopik (46 chars)
Description: Play TB World online. Customize characters and
interiors with endless fashion combinations. Unleash creativity
now. Free browser game. (154 chars)
Primary Genre: Girls
Secondary: Dress-up, Make-up, Kids
```

### Example 2: Action Game
```
Slug: playground-man-ragdoll-show
Title: Playground Man! - Play Free | Kloopik (48 chars)
Description: Experience ragdoll physics action in Playground
Man! Solve puzzles and destroy objects creatively. Compete
globally. Play free browser game now. (153 chars)
Primary Genre: Action
Secondary: Physics, Ragdoll, Skill
```

### Example 3: Puzzle Game
```
Slug: brain-challenge
Title: Brain Challenge - Play Free Online | Kloopik (50 chars)
Description: Solve challenging brain training puzzles in Brain
Challenge. Improve memory and logic with increasing difficulty.
Perfect for all ages. Play free today. (159 chars)
Primary Genre: Puzzle
Secondary: Educational, Casual, Brain
```

---

## TOOLS & RESOURCES

### Testing:
- Google Search Console: https://search.google.com/search-console
- Schema Validator: https://schema.org/validator/
- OG Debugger: https://www.opengraphcheck.com/
- Twitter Validator: https://cards-dev.twitter.com/validator

### Optimization:
- Meta Tag Generator: `/js/meta-tag-generator.js` (included)
- Character Counter: Built-in to most editors
- Image Optimizer: TinyPNG, Squoosh

### Monitoring:
- Google Search Console (impressions, CTR)
- Google Analytics (organic traffic)
- Bing Webmaster Tools

---

## AUTOMATION SCRIPT USAGE

### Generate meta tags for all games:

```bash
# Node.js
node scripts/generate-meta-tags.js

# Output: meta-tags-output.json with all 706 games

# Python (if using Python build):
python scripts/generate_meta_tags.py
```

### Output includes:
- 706 meta packages (one per game)
- Summary statistics
- Error log (if any)
- JSON structure for easy insertion

---

## QUICK AUDIT COMMAND

```bash
# Check meta tags on any game page
curl -I https://kloopik.com/catalog/tb-world/

# View all meta tags
curl https://kloopik.com/catalog/tb-world/ | grep -E '<meta|<title|og:|twitter:' | head -20
```

---

## NEXT 90 DAYS OPTIMIZATION ROADMAP

### Week 1-2: Implementation
- [ ] Generate meta tags for all 706 games
- [ ] Implement on all game pages
- [ ] Test validation with 10 random games
- [ ] Submit sitemap to Google Search Console

### Week 3-4: Verification
- [ ] Verify indexing in Google Search
- [ ] Check schema.org in search results
- [ ] Monitor Search Console for crawl errors
- [ ] Test social media previews

### Month 2: Monitoring
- [ ] Track impressions by game/genre
- [ ] Analyze CTR data
- [ ] Identify underperforming titles
- [ ] A/B test title variations

### Month 3: Optimization
- [ ] Update low-CTR game descriptions
- [ ] Refine genre-based templates
- [ ] Expand keyword targeting
- [ ] Plan next iteration

---

**Reference Card Complete**

For detailed implementation, see:
- `META-TAGS-STRATEGY.md` - Full strategy document
- `META-IMPLEMENTATION.md` - Code examples for different frameworks
- `game-meta-template.html` - HTML template with all tags
- `js/meta-tag-generator.js` - JavaScript generation tool
