#!/usr/bin/env node

/**
 * Sitemap Generator
 * Generates sitemap.xml for all game pages and categories
 */

const fs = require('fs');
const path = require('path');

class SitemapGenerator {
    constructor() {
        this.gamesData = null;
        this.games = [];
        this.categories = new Set();
        this.gamesJsonPath = path.join(__dirname, '..', 'games.json');
        this.outputPath = path.join(__dirname, '..', 'sitemap.xml');
        this.baseUrl = 'https://kloopik.com';
        this.urls = [];
    }

    async generate() {
        console.log('🗺️  Starting sitemap generation...\n');

        try {
            // Load games data
            await this.loadGamesData();

            // Extract games and categories
            this.extractGames();

            // Build URL list
            this.buildUrlList();

            // Generate sitemap XML
            this.generateSitemap();

            // Write sitemap
            this.writeSitemap();

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

        // Extract all games from segments
        if (this.gamesData.segments && Array.isArray(this.gamesData.segments)) {
            this.gamesData.segments.forEach(segment => {
                if (segment.hits && Array.isArray(segment.hits)) {
                    segment.hits.forEach(game => {
                        this.games.push(game);

                        // Track categories
                        if (game.genres && Array.isArray(game.genres)) {
                            game.genres.forEach(genre => {
                                this.categories.add(genre.toLowerCase());
                            });
                        }
                    });
                }
            });
        }

        console.log(`✅ Extracted ${this.games.length} games`);
        console.log(`✅ Found ${this.categories.size} categories\n`);
    }

    buildUrlList() {
        console.log('🔗 Building URL list...\n');

        // Homepage
        this.urls.push({
            loc: this.baseUrl + '/',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: '1.0'
        });

        // Category pages
        this.categories.forEach(category => {
            this.urls.push({
                loc: this.baseUrl + '/category/' + this.slugify(category) + '/',
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8'
            });
        });

        // Game pages
        this.games.forEach(game => {
            this.urls.push({
                loc: this.baseUrl + '/catalog/' + game.slug + '/',
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'monthly',
                priority: '0.7'
            });
        });

        console.log(`✅ Built ${this.urls.length} URLs\n`);
    }

    generateSitemap() {
        console.log('📝 Generating sitemap XML...');

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        this.urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${this.escapeXml(url.loc)}</loc>\n`;
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        this.sitemapXml = xml;
        console.log('✅ Sitemap XML generated\n');
    }

    writeSitemap() {
        console.log('💾 Writing sitemap.xml...');
        fs.writeFileSync(this.outputPath, this.sitemapXml, 'utf8');
        console.log('✅ Sitemap written\n');
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    printSummary() {
        console.log('═'.repeat(50));
        console.log('📊 SITEMAP SUMMARY');
        console.log('═'.repeat(50));
        console.log(`Total URLs:       ${this.urls.length}`);
        console.log(`Homepage:         1`);
        console.log(`Category pages:   ${this.categories.size}`);
        console.log(`Game pages:       ${this.games.length}`);
        console.log(`Output file:      ${this.outputPath}`);
        console.log(`File size:        ${(this.sitemapXml.length / 1024).toFixed(2)} KB`);
        console.log('═'.repeat(50));
        console.log('\n✨ Done! Sitemap is ready for search engines!\n');
        console.log('📌 Next steps:');
        console.log('   1. Submit sitemap to Google Search Console');
        console.log('   2. Submit to Bing Webmaster Tools');
        console.log('   3. Add sitemap URL to robots.txt\n');
    }
}

// Run generator
const generator = new SitemapGenerator();
generator.generate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
