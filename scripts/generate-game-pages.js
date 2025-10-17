#!/usr/bin/env node

/**
 * Game Pages Generator
 * Generates SEO-optimized HTML pages for all games from games.json
 */

const fs = require('fs');
const path = require('path');

class GamePageGenerator {
    constructor() {
        this.gamesData = null;
        this.template = null;
        this.games = [];
        this.categories = new Map();
        this.outputDir = path.join(__dirname, '..', 'catalog');
        this.templatePath = path.join(this.outputDir, 'game-template.html');
        this.gamesJsonPath = path.join(__dirname, '..', 'games.json');
        this.stats = {
            total: 0,
            generated: 0,
            errors: 0
        };
    }

    async generate() {
        console.log('🎮 Starting game pages generation...\n');

        try {
            // Load games data
            await this.loadGamesData();

            // Load template
            await this.loadTemplate();

            // Extract and process games
            this.extractGames();

            // Generate pages
            await this.generateAllPages();

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

    async loadTemplate() {
        console.log('📄 Loading template...');
        this.template = fs.readFileSync(this.templatePath, 'utf8');
        console.log('✅ Template loaded\n');
    }

    extractGames() {
        console.log('🔍 Extracting games...');

        // Extract all games from segments
        if (this.gamesData.segments && Array.isArray(this.gamesData.segments)) {
            this.gamesData.segments.forEach(segment => {
                if (segment.hits && Array.isArray(segment.hits)) {
                    segment.hits.forEach(game => {
                        this.games.push(game);

                        // Track categories
                        if (game.genres && Array.isArray(game.genres)) {
                            game.genres.forEach(genre => {
                                if (!this.categories.has(genre)) {
                                    this.categories.set(genre, []);
                                }
                                this.categories.get(genre).push(game);
                            });
                        }
                    });
                }
            });
        }

        this.stats.total = this.games.length;
        console.log(`✅ Extracted ${this.games.length} games`);
        console.log(`✅ Found ${this.categories.size} categories\n`);
    }

    async generateAllPages() {
        console.log('🚀 Generating game pages...\n');

        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];

            try {
                await this.generateGamePage(game, i + 1);
                this.stats.generated++;

                // Progress indicator
                if ((i + 1) % 50 === 0) {
                    console.log(`   Progress: ${i + 1}/${this.games.length} games generated`);
                }
            } catch (error) {
                console.error(`❌ Error generating ${game.slug}:`, error.message);
                this.stats.errors++;
            }
        }

        console.log('\n✅ All pages generated\n');
    }

    async generateGamePage(game, index) {
        // Prepare game data
        const gameData = this.prepareGameData(game);

        // Replace placeholders
        let html = this.template;

        Object.keys(gameData).forEach(key => {
            const placeholder = `{{${key}}}`;
            const value = gameData[key];
            html = html.split(placeholder).join(value);
        });

        // Create directory
        const gameDir = path.join(this.outputDir, game.slug);
        if (!fs.existsSync(gameDir)) {
            fs.mkdirSync(gameDir, { recursive: true });
        }

        // Write file
        const filePath = path.join(gameDir, 'index.html');
        fs.writeFileSync(filePath, html, 'utf8');
    }

    prepareGameData(game) {
        const title = game.title || 'Untitled Game';
        const slug = game.slug || 'game';
        const description = game.description || '';
        const primaryCategory = this.getPrimaryCategory(game);
        const primaryCategorySlug = this.slugify(primaryCategory);

        // Generate SEO content
        const metaDescription = this.generateMetaDescription(game, primaryCategory);
        const keywords = this.generateKeywords(game);
        const schemaGenres = this.generateSchemaGenres(game);

        // Generate content sections
        const aboutParagraph = this.generateAboutParagraph(game, primaryCategory);
        const howToPlaySteps = this.generateHowToPlaySteps(game, primaryCategory);
        const controlsTableRows = this.generateControlsTable(game, primaryCategory);
        const featuresList = this.generateFeaturesList(game);
        const tagsList = this.generateTagsList(game);

        // FAQ content
        const faqWhatIs = this.generateFaqWhatIs(game, primaryCategory);
        const faqHowToPlay = this.generateFaqHowToPlay(game, primaryCategory);
        const faqMobile = this.generateFaqMobile(game);

        // HowTo Schema Steps
        const howToSteps = this.generateHowToSchemaSteps(game, primaryCategory);

        // Related and popular games
        const relatedGames = this.generateRelatedGames(game, primaryCategory);
        const popularGames = this.generatePopularGames();

        // Images
        const ogImage = this.getGameImage(game, 1200, 630);
        const twitterImage = this.getGameImage(game, 1024, 512);
        const schemaImage = this.getGameImage(game, 800, 600);

        return {
            GAME_ID: game.id || '',
            GAME_SLUG: slug,
            GAME_TITLE: title,
            GAME_URL: game.gameURL || '',
            PRIMARY_CATEGORY: primaryCategory,
            PRIMARY_CATEGORY_SLUG: primaryCategorySlug,

            // SEO Meta
            META_DESCRIPTION: metaDescription,
            OG_DESCRIPTION: this.truncate(description || metaDescription, 200),
            TWITTER_DESCRIPTION: this.truncate(metaDescription, 120),
            KEYWORDS: keywords,

            // Images
            OG_IMAGE: ogImage,
            TWITTER_IMAGE: twitterImage,
            SCHEMA_IMAGE: schemaImage,

            // Schema
            SCHEMA_DESCRIPTION: this.escapeJson(description || aboutParagraph),
            SCHEMA_GENRES: schemaGenres,

            // Content
            ABOUT_PARAGRAPH: aboutParagraph,
            HOW_TO_PLAY_STEPS: howToPlaySteps,
            CONTROLS_TABLE_ROWS: controlsTableRows,
            FEATURES_LIST: featuresList,
            TAGS_LIST: tagsList,

            // FAQ
            FAQ_WHAT_IS: faqWhatIs,
            FAQ_HOW_TO_PLAY: faqHowToPlay,
            FAQ_MOBILE: faqMobile,

            // HowTo Schema
            HOWTO_STEPS: howToSteps,

            // Related content
            RELATED_GAMES: relatedGames,
            POPULAR_GAMES: popularGames
        };
    }

    getPrimaryCategory(game) {
        if (!game.genres || !game.genres.length) return 'Action';

        // Priority order for categories
        const priority = ['action', 'puzzle', 'racing', 'sports', 'adventure', 'arcade', 'strategy'];

        for (const cat of priority) {
            if (game.genres.includes(cat)) {
                return this.capitalize(cat);
            }
        }

        return this.capitalize(game.genres[0]);
    }

    generateMetaDescription(game, category) {
        const title = game.title;
        const templates = {
            Action: `Play ${title} online free. Experience fast-paced action gameplay. Compete, unlock rewards, and master challenges. Free browser game now.`,
            Puzzle: `${title} - Solve challenging puzzles online. Train your brain with unique gameplay mechanics. Play free in your browser today.`,
            Racing: `${title} - Race online free. Experience thrilling high-speed action. Compete against rivals and master every track. Play now.`,
            Sports: `Play ${title} - Free sports game online. Master skills, compete in tournaments, and dominate the leaderboard. Browser-based fun.`,
            Girls: `${title}. Unleash creativity with styling, fashion, and design. Endless combinations and fun gameplay. Play free online now.`,
            Kids: `${title} - Safe, fun gameplay for kids. Educational, entertaining, and addictive. No download needed. Play free today.`,
            Adventure: `${title} - Embark on an epic adventure. Explore worlds, solve mysteries, complete quests. Free browser game. Play now.`,
            Arcade: `${title} - Classic arcade action online. Easy to learn, hard to master. Beat high scores. Play free in your browser.`
        };

        return templates[category] || `Play ${title} online free. Fun ${category.toLowerCase()} game with engaging gameplay. No download. Start playing now.`;
    }

    generateKeywords(game) {
        const keywords = [
            `play ${game.title.toLowerCase()} online`,
            `${game.title.toLowerCase()} free`,
            `${game.title.toLowerCase()} game`,
            `${game.title.toLowerCase()} browser game`
        ];

        if (game.genres && game.genres.length) {
            keywords.push(`${game.genres[0]} games`);
            keywords.push(`free ${game.genres[0]} games`);
        }

        keywords.push('free online games', 'browser games', 'no download games');

        return keywords.slice(0, 10).join(', ');
    }

    generateSchemaGenres(game) {
        if (!game.genres || !game.genres.length) {
            return JSON.stringify(['Action']);
        }

        const genres = game.genres.slice(0, 5).map(g => this.capitalize(g));
        return JSON.stringify(genres);
    }

    generateAboutParagraph(game, category) {
        const title = game.title;
        const desc = game.description || '';

        if (desc.length > 50) {
            return desc;
        }

        const templates = {
            Action: `is an exciting action game that challenges your reflexes and skills. Navigate through intense scenarios, defeat enemies, and unlock new levels. Perfect for players who love fast-paced gameplay and thrilling challenges.`,
            Puzzle: `is a brain-teasing puzzle game that tests your logic and problem-solving abilities. Each level presents unique challenges that require creative thinking. Great for puzzle enthusiasts of all ages.`,
            Racing: `is a high-octane racing game featuring fast cars and challenging tracks. Compete against rivals, master difficult turns, and race to the finish line. Perfect for speed enthusiasts.`,
            Sports: `is an engaging sports game that brings athletic competition to your browser. Master skills, compete in tournaments, and climb the leaderboards in this addictive sports title.`,
            Girls: `is a creative game featuring fashion, styling, and design. Express your creativity through endless customization options and create stunning results.`,
            Kids: `is a fun and safe game designed for young players. Educational and entertaining, it provides hours of age-appropriate fun without downloads.`,
            Adventure: `is an immersive adventure game filled with exploration and discovery. Journey through exciting worlds, solve mysteries, and complete epic quests.`,
            Arcade: `is a classic arcade-style game that's easy to learn but challenging to master. Beat high scores and enjoy endless replayability.`
        };

        return `${templates[category] || 'is an entertaining browser game with engaging gameplay mechanics. Play for free without downloads.'}`;
    }

    generateHowToPlaySteps(game, category) {
        const steps = {
            Action: [
                'Use arrow keys or WASD to move your character',
                'Press spacebar or click to attack enemies',
                'Collect power-ups to enhance your abilities',
                'Avoid obstacles and enemy attacks',
                'Complete objectives to progress through levels'
            ],
            Puzzle: [
                'Study the puzzle layout carefully',
                'Use mouse or touch to interact with elements',
                'Match or connect similar items to clear them',
                'Plan moves strategically to maximize points',
                'Complete the level objective to advance'
            ],
            Racing: [
                'Use arrow keys to control your vehicle',
                'Press up arrow to accelerate, down to brake',
                'Use left/right arrows to steer',
                'Avoid obstacles and other racers',
                'Cross the finish line first to win'
            ],
            Sports: [
                'Use controls to move your player',
                'Follow on-screen prompts for actions',
                'Time your moves for maximum effectiveness',
                'Score points by completing objectives',
                'Win matches to unlock new content'
            ],
            default: [
                'Click or tap to start the game',
                'Follow the on-screen tutorial',
                'Use mouse/keyboard/touch controls',
                'Complete objectives to progress',
                'Have fun and enjoy the game!'
            ]
        };

        const stepsList = steps[category] || steps.default;
        return stepsList.map(step => `<li>${step}</li>`).join('\n                            ');
    }

    generateControlsTable(game, category) {
        const controls = {
            Action: [
                ['Arrow Keys / WASD', 'Movement', 'Move character in four directions'],
                ['Spacebar / Mouse', 'Action', 'Attack, jump, or interact'],
                ['Shift', 'Special', 'Use special ability or sprint'],
                ['P / Esc', 'Pause', 'Pause the game']
            ],
            Puzzle: [
                ['Mouse', 'Select', 'Click to select puzzle pieces'],
                ['Drag & Drop', 'Move', 'Drag items to new positions'],
                ['Spacebar', 'Hint', 'Get a helpful hint'],
                ['R', 'Reset', 'Reset the current puzzle']
            ],
            Racing: [
                ['Up Arrow', 'Accelerate', 'Increase speed'],
                ['Down Arrow', 'Brake', 'Slow down or reverse'],
                ['Left/Right Arrow', 'Steer', 'Turn left or right'],
                ['Spacebar', 'Nitro', 'Activate speed boost']
            ],
            default: [
                ['Mouse', 'Interact', 'Click to interact with game'],
                ['Arrow Keys', 'Navigate', 'Navigate menus and controls'],
                ['Spacebar', 'Action', 'Perform primary action'],
                ['Esc', 'Pause', 'Pause game or open menu']
            ]
        };

        const controlRows = controls[category] || controls.default;
        return controlRows.map(([control, action, desc]) =>
            `<tr><td><strong>${control}</strong></td><td>${action}</td><td>${desc}</td></tr>`
        ).join('\n                                ');
    }

    generateFeaturesList(game) {
        const features = [
            'Free to play online in your browser',
            'No downloads or installation required',
            'Works on desktop and mobile devices',
            'Instant play - no registration needed',
            'Regular updates and new content',
            'Smooth, optimized gameplay',
            'Family-friendly content',
            'Save progress automatically'
        ];

        return features.slice(0, 6).map(f => `<li>${f}</li>`).join('\n                            ');
    }

    generateTagsList(game) {
        const tags = [];

        if (game.genres) {
            tags.push(...game.genres.slice(0, 5));
        }

        if (game.tags) {
            tags.push(...game.tags.slice(0, 3));
        }

        if (tags.length === 0) {
            tags.push('online-game', 'browser-game', 'free-game');
        }

        return tags
            .slice(0, 8)
            .map(tag => `<a href="/tag/${this.slugify(tag)}/">${this.formatTag(tag)}</a>`)
            .join('\n                            ');
    }

    generateFaqWhatIs(game, category) {
        return `${game.title} is a free online ${category.toLowerCase()} game that you can play directly in your web browser. ${this.generateAboutParagraph(game, category)}`;
    }

    generateFaqHowToPlay(game, category) {
        return `To play ${game.title}, simply click the game above to start. Use your mouse, keyboard, or touch controls to interact with the game. ${category === 'Action' ? 'Use arrow keys or WASD to move and spacebar to perform actions.' : 'Follow the on-screen instructions for game-specific controls.'}`;
    }

    generateFaqMobile(game) {
        const isMobile = game.mobileReady && game.mobileReady.length > 0;
        if (isMobile) {
            return `Yes! ${game.title} is fully optimized for mobile devices. Play on your smartphone or tablet using touch controls. The game adjusts automatically to your screen size.`;
        }
        return `${game.title} is optimized for desktop browsers. For the best experience, play on a computer with keyboard and mouse controls.`;
    }

    generateHowToSchemaSteps(game, category) {
        const steps = [
            { name: 'Open the Game', text: `Navigate to ${game.title} on Kloopik and click the game to load it.` },
            { name: 'Learn Controls', text: 'Familiarize yourself with the game controls shown on the page.' },
            { name: 'Start Playing', text: 'Click play or start to begin your gaming session.' },
            { name: 'Follow Objectives', text: 'Complete the game objectives to progress and win.' },
            { name: 'Enjoy!', text: 'Have fun and try to beat your high score!' }
        ];

        return JSON.stringify(steps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.name,
            text: step.text
        })));
    }

    generateRelatedGames(game, category) {
        const related = this.categories.get(category.toLowerCase()) || [];
        const filtered = related.filter(g => g.slug !== game.slug).slice(0, 5);

        if (filtered.length === 0) {
            return '<p>No related games found.</p>';
        }

        return filtered.map(g => `
                            <a href="/catalog/${g.slug}/" class="game-card-mini">
                                <img src="${this.getGameImage(g, 80, 60)}" alt="${g.title}" width="80" height="60" loading="lazy">
                                <div class="game-card-mini-info">
                                    <div class="game-card-mini-title">${g.title}</div>
                                    <div class="game-card-mini-category">${category}</div>
                                </div>
                            </a>`).join('\n                            ');
    }

    generatePopularGames() {
        const popular = this.games.slice(0, 5);

        return popular.map(g => {
            const cat = this.getPrimaryCategory(g);
            return `
                            <a href="/catalog/${g.slug}/" class="game-card-mini">
                                <img src="${this.getGameImage(g, 80, 60)}" alt="${g.title}" width="80" height="60" loading="lazy">
                                <div class="game-card-mini-info">
                                    <div class="game-card-mini-title">${g.title}</div>
                                    <div class="game-card-mini-category">${cat}</div>
                                </div>
                            </a>`;
        }).join('\n                            ');
    }

    getGameImage(game, width, height) {
        if (game.images && game.images.length > 0) {
            return game.images[0];
        }
        return `https://via.placeholder.com/${width}x${height}/667eea/ffffff?text=${encodeURIComponent(game.title)}`;
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

    formatTag(tag) {
        return tag
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => this.capitalize(word))
            .join(' ');
    }

    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    escapeJson(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }

    printSummary() {
        console.log('═'.repeat(50));
        console.log('📊 GENERATION SUMMARY');
        console.log('═'.repeat(50));
        console.log(`Total games:      ${this.stats.total}`);
        console.log(`Generated:        ${this.stats.generated} ✅`);
        console.log(`Errors:           ${this.stats.errors} ${this.stats.errors > 0 ? '⚠️' : ''}`);
        console.log(`Categories:       ${this.categories.size}`);
        console.log(`Output directory: ${this.outputDir}`);
        console.log('═'.repeat(50));
        console.log('\n✨ Done! Game pages are ready for SEO!\n');
    }
}

// Run generator
const generator = new GamePageGenerator();
generator.generate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
