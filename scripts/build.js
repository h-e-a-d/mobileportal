const fs = require('fs');
const path = require('path');
const GameGenerator = require('../src/js/gameGenerator');

/**
 * Build script for the Mobile Portal
 * Generates game pages from XML feeds and performs optimization
 */
class BuildScript {
    constructor() {
        this.gameGenerator = new GameGenerator();
        this.buildDir = path.join(__dirname, '../build');
        this.srcDir = path.join(__dirname, '../src');
        this.rootDir = path.join(__dirname, '..');
    }

    async run() {
        console.log('🚀 Starting build process...');
        
        try {
            // Step 1: Clean build directory
            await this.cleanBuildDir();
            
            // Step 2: Generate game pages from XML feeds
            await this.generateGamePages();
            
            // Step 3: Copy static assets
            await this.copyStaticAssets();
            
            // Step 4: Generate sitemap
            await this.generateSitemap();
            
            // Step 5: Generate robots.txt
            await this.generateRobotsTxt();
            
            console.log('✅ Build completed successfully!');
            console.log(`📁 Build output: ${this.buildDir}`);
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async cleanBuildDir() {
        console.log('🧹 Cleaning build directory...');
        
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(this.buildDir, { recursive: true });
    }

    async generateGamePages() {
        console.log('🎮 Generating game pages from XML feeds...');
        
        try {
            await this.gameGenerator.processAllFeeds();
            console.log('✅ Game pages generated successfully');
        } catch (error) {
            console.error('❌ Failed to generate game pages:', error);
            throw error;
        }
    }

    async copyStaticAssets() {
        console.log('📂 Copying static assets...');
        
        // Copy CSS files
        this.copyDirectory(path.join(this.srcDir, 'css'), path.join(this.buildDir, 'css'));
        
        // Copy JS files
        this.copyDirectory(path.join(this.srcDir, 'js'), path.join(this.buildDir, 'js'));
        
        // Copy game pages
        this.copyDirectory(path.join(this.rootDir, 'games'), path.join(this.buildDir, 'games'));
        
        // Copy config
        this.copyDirectory(path.join(this.rootDir, 'config'), path.join(this.buildDir, 'config'));
        
        // Copy root files
        const rootFiles = ['index.html', 'favicon.ico', 'manifest.json'];
        rootFiles.forEach(file => {
            const srcPath = path.join(this.rootDir, file);
            if (fs.existsSync(srcPath)) {
                const destPath = path.join(this.buildDir, file);
                fs.copyFileSync(srcPath, destPath);
            }
        });
        
        console.log('✅ Static assets copied successfully');
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(src)) return;
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        
        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    async generateSitemap() {
        console.log('🗺️  Generating sitemap...');
        
        const sitemapEntries = [];
        const baseUrl = 'https://yourdomain.com'; // Replace with your domain
        
        // Add homepage
        sitemapEntries.push({
            url: baseUrl,
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: '1.0'
        });
        
        // Add game pages
        const gamesDir = path.join(this.rootDir, 'games');
        if (fs.existsSync(gamesDir)) {
            const locales = fs.readdirSync(gamesDir);
            
            locales.forEach(locale => {
                const localeDir = path.join(gamesDir, locale);
                if (fs.statSync(localeDir).isDirectory()) {
                    const gameFiles = fs.readdirSync(localeDir);
                    
                    gameFiles.forEach(file => {
                        if (file.endsWith('.html')) {
                            sitemapEntries.push({
                                url: `${baseUrl}/games/${locale}/${file}`,
                                lastmod: new Date().toISOString(),
                                changefreq: 'weekly',
                                priority: '0.8'
                            });
                        }
                    });
                }
            });
        }
        
        const sitemap = this.generateSitemapXML(sitemapEntries);
        fs.writeFileSync(path.join(this.buildDir, 'sitemap.xml'), sitemap);
        
        console.log(`✅ Sitemap generated with ${sitemapEntries.length} entries`);
    }

    generateSitemapXML(entries) {
        const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        const footer = '</urlset>';
        
        const urls = entries.map(entry => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');
        
        return header + urls + '\n' + footer;
    }

    async generateRobotsTxt() {
        console.log('🤖 Generating robots.txt...');
        
        const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://yourdomain.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /config/
Disallow: /src/
Disallow: /feeds/
Disallow: /scripts/

# Allow game pages
Allow: /games/
Allow: /css/
Allow: /js/
Allow: /images/
`;
        
        fs.writeFileSync(path.join(this.buildDir, 'robots.txt'), robots);
        
        console.log('✅ robots.txt generated successfully');
    }
}

// Run build script if called directly
if (require.main === module) {
    const buildScript = new BuildScript();
    buildScript.run();
}

module.exports = BuildScript;