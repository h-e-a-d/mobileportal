const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

class GameGenerator {
    constructor() {
        this.locales = require('../../config/locales.json');
        this.templatesDir = path.join(__dirname, '../templates');
        this.gamesDir = path.join(__dirname, '../../games');
        this.feedsDir = path.join(__dirname, '../../feeds');
    }

    /**
     * Parse XML feed and generate game pages
     * @param {string} xmlFilePath - Path to XML file
     */
    async processXMLFeed(xmlFilePath) {
        try {
            const xmlContent = fs.readFileSync(xmlFilePath, 'utf8');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            
            const games = this.parseGamesFromXML(xmlDoc);
            console.log(`Found ${games.length} games in XML feed`);
            
            for (const game of games) {
                await this.generateGamePages(game);
            }
            
            console.log('Game page generation completed successfully');
        } catch (error) {
            console.error('Error processing XML feed:', error);
            throw error;
        }
    }

    /**
     * Parse games from XML document
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} Array of game objects
     */
    parseGamesFromXML(xmlDoc) {
        const games = [];
        const gameElements = xmlDoc.getElementsByTagName('game');
        
        for (let i = 0; i < gameElements.length; i++) {
            const gameElement = gameElements[i];
            
            const game = {
                id: this.getElementText(gameElement, 'id'),
                title: this.getElementText(gameElement, 'title'),
                description: this.getElementText(gameElement, 'description'),
                category: this.getElementText(gameElement, 'category'),
                thumb: this.getElementText(gameElement, 'thumb'),
                url: this.getElementText(gameElement, 'url'),
                width: this.getElementText(gameElement, 'width') || '800',
                height: this.getElementText(gameElement, 'height') || '600',
                tags: this.getElementText(gameElement, 'tags') || '',
                slug: this.generateSlug(this.getElementText(gameElement, 'title'))
            };
            
            games.push(game);
        }
        
        return games;
    }

    /**
     * Get text content from XML element
     * @param {Element} parent - Parent element
     * @param {string} tagName - Tag name to find
     * @returns {string} Text content
     */
    getElementText(parent, tagName) {
        const element = parent.getElementsByTagName(tagName)[0];
        return element ? element.textContent : '';
    }

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Game title
     * @returns {string} URL slug
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Generate game pages for all locales
     * @param {Object} game - Game object
     */
    async generateGamePages(game) {
        const template = fs.readFileSync(
            path.join(this.templatesDir, 'game-page.html'),
            'utf8'
        );
        
        for (const [localeCode, locale] of Object.entries(this.locales.locales)) {
            const localizedGame = this.localizeGame(game, locale);
            const html = this.processTemplate(template, localizedGame, locale);
            
            const fileName = `${game.slug}-${localeCode}.html`;
            const filePath = path.join(this.gamesDir, localeCode, fileName);
            
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filePath, html);
            console.log(`Generated: ${filePath}`);
        }
    }

    /**
     * Localize game object for specific locale
     * @param {Object} game - Game object
     * @param {Object} locale - Locale configuration
     * @returns {Object} Localized game object
     */
    localizeGame(game, locale) {
        // In a real implementation, you might have localized game data
        // For now, we'll use the original game data
        return {
            ...game,
            locale: locale.code,
            localizedStrings: locale.strings
        };
    }

    /**
     * Process HTML template with game data
     * @param {string} template - HTML template
     * @param {Object} game - Game object
     * @param {Object} locale - Locale configuration
     * @returns {string} Processed HTML
     */
    processTemplate(template, game, locale) {
        let html = template;
        
        // Replace game data placeholders
        html = html.replace(/\{gameTitle\}/g, game.title);
        html = html.replace(/\{gameDescription\}/g, game.description);
        html = html.replace(/\{gameCategory\}/g, game.category);
        html = html.replace(/\{gameThumb\}/g, game.thumb);
        html = html.replace(/\{gameUrl\}/g, game.url);
        html = html.replace(/\{gameWidth\}/g, game.width);
        html = html.replace(/\{gameHeight\}/g, game.height);
        html = html.replace(/\{gameSlug\}/g, game.slug);
        html = html.replace(/\{localeCode\}/g, locale.code);
        
        // Replace meta tags
        const title = locale.meta.title
            .replace(/\{gameTitle\}/g, game.title)
            .replace(/\{gameDescription\}/g, game.description);
        const description = locale.meta.description
            .replace(/\{gameTitle\}/g, game.title)
            .replace(/\{gameDescription\}/g, game.description);
        const keywords = locale.meta.keywords
            .replace(/\{gameTitle\}/g, game.title)
            .replace(/\{gameCategory\}/g, game.category);
        
        html = html.replace(/\{metaTitle\}/g, title);
        html = html.replace(/\{metaDescription\}/g, description);
        html = html.replace(/\{metaKeywords\}/g, keywords);
        
        // Replace localized strings
        Object.entries(locale.strings).forEach(([key, value]) => {
            const placeholder = new RegExp(`\\{${key}\\}`, 'g');
            html = html.replace(placeholder, value);
        });
        
        return html;
    }

    /**
     * Process all XML files in feeds directory
     */
    async processAllFeeds() {
        try {
            const files = fs.readdirSync(this.feedsDir);
            const xmlFiles = files.filter(file => file.endsWith('.xml'));
            
            console.log(`Found ${xmlFiles.length} XML files to process`);
            
            for (const xmlFile of xmlFiles) {
                const xmlPath = path.join(this.feedsDir, xmlFile);
                console.log(`Processing: ${xmlFile}`);
                await this.processXMLFeed(xmlPath);
            }
        } catch (error) {
            console.error('Error processing feeds:', error);
            throw error;
        }
    }
}

module.exports = GameGenerator;

// CLI usage
if (require.main === module) {
    const generator = new GameGenerator();
    
    const args = process.argv.slice(2);
    if (args.length === 0) {
        // Process all feeds
        generator.processAllFeeds();
    } else {
        // Process specific XML file
        const xmlFile = args[0];
        generator.processXMLFeed(xmlFile);
    }
}