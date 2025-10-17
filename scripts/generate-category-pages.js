#!/usr/bin/env node

/**
 * Category Pages Generator
 * Generates SEO-optimized category pages for all game genres
 */

const fs = require('fs');
const path = require('path');

class CategoryPageGenerator {
    constructor() {
        this.gamesData = null;
        this.games = [];
        this.categories = new Map();
        this.outputDir = path.join(__dirname, '..', 'category');
        this.gamesJsonPath = path.join(__dirname, '..', 'games.json');
        this.stats = {
            total: 0,
            generated: 0,
            errors: 0
        };
    }

    async generate() {
        console.log('📁 Starting category pages generation...\n');

        try {
            // Load games data
            await this.loadGamesData();

            // Extract games and categorize
            this.extractGames();

            // Create output directory
            this.createOutputDir();

            // Generate category pages
            await this.generateAllPages();

            // Generate categories index
            await this.generateCategoriesIndex();

            // Print summary
            this.printSummary();

        } catch (error) {
            console.error('❌ Fatal error:', error.message);
            process.exit(1);
        }
    }

    async loadGamesData() {
        console.log('📂 Loading games.json...');
        const data = fs.readFileSync(this.gamesJsonPath, 'utf8');
        this.gamesData = JSON.parse(data);
        console.log('✅ Games data loaded\n');
    }

    extractGames() {
        console.log('🔍 Extracting games and categories...');

        if (this.gamesData.segments && Array.isArray(this.gamesData.segments)) {
            this.gamesData.segments.forEach(segment => {
                if (segment.hits && Array.isArray(segment.hits)) {
                    segment.hits.forEach(game => {
                        this.games.push(game);

                        // Track categories
                        if (game.genres && Array.isArray(game.genres)) {
                            game.genres.forEach(genre => {
                                const genreKey = genre.toLowerCase();
                                if (!this.categories.has(genreKey)) {
                                    this.categories.set(genreKey, []);
                                }
                                this.categories.get(genreKey).push(game);
                            });
                        }
                    });
                }
            });
        }

        this.stats.total = this.categories.size;
        console.log(`✅ Extracted ${this.games.length} games`);
        console.log(`✅ Found ${this.categories.size} categories\n`);
    }

    createOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async generateAllPages() {
        console.log('🚀 Generating category pages...\n');

        let count = 0;
        for (const [category, games] of this.categories) {
            try {
                await this.generateCategoryPage(category, games);
                this.stats.generated++;
                count++;

                if (count % 20 === 0) {
                    console.log(`   Progress: ${count}/${this.categories.size} categories generated`);
                }
            } catch (error) {
                console.error(`❌ Error generating ${category}:`, error.message);
                this.stats.errors++;
            }
        }

        console.log('\n✅ All category pages generated\n');
    }

    async generateCategoryPage(category, games) {
        const categoryName = this.capitalize(category);
        const categorySlug = this.slugify(category);
        const gameCount = games.length;

        const html = this.generateCategoryHTML(categoryName, categorySlug, games, gameCount);

        // Create directory
        const catDir = path.join(this.outputDir, categorySlug);
        if (!fs.existsSync(catDir)) {
            fs.mkdirSync(catDir, { recursive: true });
        }

        // Write file
        const filePath = path.join(catDir, 'index.html');
        fs.writeFileSync(filePath, html, 'utf8');
    }

    generateCategoryHTML(categoryName, categorySlug, games, gameCount) {
        const description = this.getCategoryDescription(categoryName, gameCount);
        const keywords = this.getCategoryKeywords(categoryName);
        const gameCards = this.generateGameCards(games);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Primary Meta Tags -->
    <title>${categoryName} Games - Play ${gameCount}+ Free ${categoryName} Games Online | Kloopik</title>
    <meta name="title" content="${categoryName} Games - Play Free Online | Kloopik">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Kloopik">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://kloopik.com/category/${categorySlug}/">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://kloopik.com/category/${categorySlug}/">
    <meta property="og:title" content="${categoryName} Games - Play ${gameCount}+ Free Games">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://kloopik.com/images/og-${categorySlug}.jpg">
    <meta property="og:site_name" content="Kloopik">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://kloopik.com/category/${categorySlug}/">
    <meta property="twitter:title" content="${categoryName} Games - ${gameCount}+ Free Games">
    <meta property="twitter:description" content="${this.truncate(description, 120)}">
    <meta property="twitter:image" content="https://kloopik.com/images/twitter-${categorySlug}.jpg">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/game-page.css">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- JSON-LD Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "${categoryName} Games",
        "description": "${this.escapeJson(description)}",
        "url": "https://kloopik.com/category/${categorySlug}/",
        "publisher": {
            "@type": "Organization",
            "name": "Kloopik",
            "url": "https://kloopik.com"
        },
        "numberOfItems": ${gameCount}
    }
    </script>

    <!-- Breadcrumb Schema -->
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
                "name": "${categoryName} Games",
                "item": "https://kloopik.com/category/${categorySlug}/"
            }
        ]
    }
    </script>
</head>
<body>
    <!-- Header -->
    <header class="site-header">
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <img src="/images/logo.png" alt="Kloopik - Free Online Games" width="120" height="40">
                </a>
                <nav class="main-nav">
                    <a href="/">Home</a>
                    <a href="/categories/">Categories</a>
                    <a href="/#favorites">Favorites</a>
                    <a href="/#recent">Recent</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
        <div class="container">
            <ol itemscope itemtype="https://schema.org/BreadcrumbList">
                <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <a itemprop="item" href="/">
                        <span itemprop="name">Home</span>
                    </a>
                    <meta itemprop="position" content="1" />
                </li>
                <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <span itemprop="name">${categoryName} Games</span>
                    <meta itemprop="position" content="2" />
                </li>
            </ol>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="category-page">
        <div class="container">
            <!-- Category Header -->
            <div class="category-header">
                <h1>${categoryName} Games</h1>
                <p class="category-description">${description}</p>
                <p class="game-count">${gameCount} games available</p>
            </div>

            <!-- Games Grid -->
            <div class="games-grid">
                ${gameCards}
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="site-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Kloopik</h4>
                    <p>Play free online games instantly in your browser. No downloads required!</p>
                </div>
                <div class="footer-section">
                    <h4>Popular Categories</h4>
                    <ul>
                        <li><a href="/category/action/">Action</a></li>
                        <li><a href="/category/puzzle/">Puzzle</a></li>
                        <li><a href="/category/racing/">Racing</a></li>
                        <li><a href="/category/sports/">Sports</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Kloopik. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/js/storage.js"></script>
    <script src="/js/analytics.js"></script>
</body>
</html>`;
    }

    generateGameCards(games) {
        return games.map(game => {
            const image = this.getGameImage(game);
            const title = game.title || 'Untitled';
            const slug = game.slug || '';

            return `
                <div class="game-card">
                    <a href="/catalog/${slug}/" class="game-card-link">
                        <div class="game-card-image">
                            <img src="${image}" alt="${title}" width="200" height="150" loading="lazy">
                        </div>
                        <div class="game-card-title">${title}</div>
                    </a>
                </div>`;
        }).join('\n                ');
    }

    async generateCategoriesIndex() {
        console.log('📝 Generating categories index page...');

        const categories = Array.from(this.categories.entries())
            .sort((a, b) => b[1].length - a[1].length); // Sort by game count

        const categoryCards = categories.map(([slug, games]) => {
            const name = this.capitalize(slug);
            const count = games.length;
            return `
                <div class="category-card">
                    <a href="/category/${this.slugify(slug)}/" class="category-card-link">
                        <h3>${name}</h3>
                        <p>${count} games</p>
                    </a>
                </div>`;
        }).join('\n                ');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Game Categories - Browse ${this.categories.size} Categories | Kloopik</title>
    <meta name="description" content="Browse ${this.categories.size} game categories with ${this.games.length} free online games. Find action, puzzle, racing, sports and more games to play instantly.">
    <link rel="canonical" href="https://kloopik.com/categories/">
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/game-page.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <img src="/images/logo.png" alt="Kloopik" width="120" height="40">
                </a>
                <nav class="main-nav">
                    <a href="/">Home</a>
                    <a href="/categories/">Categories</a>
                </nav>
            </div>
        </div>
    </header>

    <main class="categories-index">
        <div class="container">
            <h1>Browse Game Categories</h1>
            <p>Explore ${this.categories.size} categories with ${this.games.length} free games</p>
            <div class="categories-grid">
                ${categoryCards}
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2024 Kloopik. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

        fs.writeFileSync(path.join(__dirname, '..', 'categories.html'), html, 'utf8');
        console.log('✅ Categories index generated\n');
    }

    getCategoryDescription(category, count) {
        const templates = {
            Action: `Play ${count}+ free action games online. Fast-paced gameplay, intense challenges, and thrilling adventures await. No download required.`,
            Puzzle: `Solve ${count}+ free puzzle games online. Train your brain with challenging puzzles, logic games, and mind-bending challenges. Play now.`,
            Racing: `Race in ${count}+ free racing games online. High-speed action, amazing tracks, and competitive gameplay. Start your engines now.`,
            Sports: `Play ${count}+ free sports games online. Football, basketball, soccer and more. Compete, win championships, and dominate the field.`,
            Adventure: `Explore ${count}+ free adventure games online. Epic quests, mysterious worlds, and exciting journeys await. Start your adventure now.`,
            Arcade: `Play ${count}+ classic arcade games online. Retro gameplay, high scores, and endless fun. No quarters needed.`,
            Strategy: `Master ${count}+ free strategy games online. Plan, build, conquer. Test your tactical skills in these challenging games.`,
            Girls: `Play ${count}+ free girls games online. Fashion, dress-up, cooking and creative games. Fun and engaging gameplay for everyone.`,
            Kids: `Enjoy ${count}+ free kids games online. Safe, educational, and fun games for children. No download required.`,
            Shooting: `Battle in ${count}+ free shooting games online. FPS action, intense battles, and competitive gameplay. Lock and load now.`
        };

        return templates[category] || `Play ${count}+ free ${category.toLowerCase()} games online. Fun, engaging gameplay in your browser. No download or registration required.`;
    }

    getCategoryKeywords(category) {
        return `${category.toLowerCase()} games, free ${category.toLowerCase()} games, ${category.toLowerCase()} games online, play ${category.toLowerCase()} games, browser ${category.toLowerCase()} games, free online games`;
    }

    getGameImage(game) {
        if (game.images && game.images.length > 0) {
            return game.images[0];
        }
        return `https://via.placeholder.com/200x150/667eea/ffffff?text=${encodeURIComponent(game.title || 'Game')}`;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    escapeJson(text) {
        return text.replace(/"/g, '\\"').replace(/\n/g, ' ');
    }

    printSummary() {
        console.log('═'.repeat(50));
        console.log('📊 CATEGORY PAGES SUMMARY');
        console.log('═'.repeat(50));
        console.log(`Total categories: ${this.stats.total}`);
        console.log(`Generated:        ${this.stats.generated} ✅`);
        console.log(`Errors:           ${this.stats.errors}`);
        console.log(`Output directory: ${this.outputDir}`);
        console.log('═'.repeat(50));
        console.log('\n✨ Done! Category pages are ready!\n');
    }
}

// Run generator
const generator = new CategoryPageGenerator();
generator.generate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
