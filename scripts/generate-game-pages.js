#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Configuration
const FEEDS_DIR = path.join(__dirname, '../feeds');
const GAMES_DIR = path.join(__dirname, '../games');
const LOCALES = ['en', 'de']; // Add more locales as needed

// Game page HTML template
const GAME_PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="{{LOCALE}}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play {{TITLE}} - Free Online Game</title>
    <meta name="description" content="Play {{TITLE}} for free online. {{DESCRIPTION}}">
    <meta name="keywords" content="game, online, free, {{TITLE}}, {{CATEGORY}}, {{TAGS}}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{URL}}">
    <meta property="og:title" content="Play {{TITLE}} - Free Online Game">
    <meta property="og:description" content="Play {{TITLE}} for free online. {{DESCRIPTION}}">
    <meta property="og:image" content="{{THUMB}}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{URL}}">
    <meta property="twitter:title" content="Play {{TITLE}} - Free Online Game">
    <meta property="twitter:description" content="Play {{TITLE}} for free online. {{DESCRIPTION}}">
    <meta property="twitter:image" content="{{THUMB}}">
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
    <!-- End Google Tag Manager -->
    
    <link rel="stylesheet" href="../../src/css/base.css">
    <link rel="stylesheet" href="../../src/css/components.css">
    <link rel="stylesheet" href="../../src/css/game-page.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "{{TITLE}}",
        "description": "{{DESCRIPTION}}",
        "image": "{{THUMB}}",
        "genre": "{{CATEGORY}}",
        "operatingSystem": "Web Browser",
        "applicationCategory": "Game",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    }
    </script>
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <a href="../../index.html">
                    <h1>CrazyGames</h1>
                </a>
            </div>
            <div class="nav-actions">
                <a href="../../index.html" class="btn btn-secondary">Back to Home</a>
            </div>
        </div>
    </nav>

    <main class="game-page">
        <div class="game-container">
            <div class="game-header">
                <div class="game-info">
                    <h1 class="game-title">{{TITLE}}</h1>
                    <div class="game-meta">
                        <span class="game-category">Category: {{CATEGORY}}</span>
                    </div>
                </div>
                <div class="game-actions">
                    <button class="btn btn-primary" id="fullscreenBtn">Fullscreen</button>
                    <button class="btn btn-secondary" id="shareBtn">Share Game</button>
                </div>
            </div>
            
            <div class="game-frame-container">
                <div class="loading-spinner" id="gameLoading">
                    <div class="spinner"></div>
                    <p>Loading Game...</p>
                </div>
                <iframe 
                    id="gameFrame" 
                    src="{{GAME_URL}}" 
                    width="{{WIDTH}}" 
                    height="{{HEIGHT}}"
                    frameborder="0" 
                    allowfullscreen
                    title="{{TITLE}}"
                    onload="hideLoading()">
                </iframe>
            </div>
        </div>
        
        <div class="game-sidebar">
            <div class="game-description">
                <h2>Instructions</h2>
                <p>{{DESCRIPTION}}</p>
            </div>
            
            <div class="related-games">
                <h3>More Games</h3>
                <div class="related-games-grid" id="relatedGames">
                    <!-- Related games will be loaded here -->
                </div>
            </div>
        </div>
    </main>

    <script src="../../src/js/components/gamePageController.js"></script>
    <script>
        // Initialize game page
        document.addEventListener('DOMContentLoaded', function() {
            const gameController = new GamePageController({
                gameTitle: '{{TITLE}}',
                gameCategory: '{{CATEGORY}}',
                gameSlug: '{{SLUG}}',
                locale: '{{LOCALE}}'
            });
            
            // Google Analytics event tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_view', {
                    'game_title': '{{TITLE}}',
                    'game_category': '{{CATEGORY}}',
                    'page_location': window.location.href
                });
            }
        });
        
        function hideLoading() {
            document.getElementById('gameLoading').style.display = 'none';
        }
    </script>
</body>
</html>`;

// Utility functions
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function generateGamePage(game, locale) {
    const slug = slugify(game.title);
    const filename = `${slug}-${locale}.html`;
    
    let html = GAME_PAGE_TEMPLATE;
    
    // Replace placeholders
    html = html.replace(/{{TITLE}}/g, game.title);
    html = html.replace(/{{DESCRIPTION}}/g, game.description);
    html = html.replace(/{{CATEGORY}}/g, game.category);
    html = html.replace(/{{THUMB}}/g, game.thumb || '');
    html = html.replace(/{{GAME_URL}}/g, game.url || '');
    html = html.replace(/{{WIDTH}}/g, game.width || '800');
    html = html.replace(/{{HEIGHT}}/g, game.height || '600');
    html = html.replace(/{{TAGS}}/g, game.tags || '');
    html = html.replace(/{{SLUG}}/g, slug);
    html = html.replace(/{{LOCALE}}/g, locale);
    html = html.replace(/{{URL}}/g, `games/${locale}/${filename}`);
    
    return { filename, html };
}

async function parseXMLFeed(feedPath) {
    try {
        const xmlContent = fs.readFileSync(feedPath, 'utf8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlContent);
        
        if (result.games && result.games.game) {
            return result.games.game.map(game => ({
                id: game.id?.[0] || '',
                title: game.title?.[0] || '',
                description: game.description?.[0] || '',
                category: game.category?.[0] || '',
                thumb: game.thumb?.[0] || '',
                url: game.url?.[0] || '',
                width: game.width?.[0] || '800',
                height: game.height?.[0] || '600',
                tags: game.tags?.[0] || ''
            }));
        }
        return [];
    } catch (error) {
        console.error('Error parsing XML feed:', error);
        return [];
    }
}

async function generateAllGamePages() {
    console.log('Starting game page generation...');
    
    // Find all XML feed files
    const feedFiles = fs.readdirSync(FEEDS_DIR).filter(file => file.endsWith('.xml'));
    
    if (feedFiles.length === 0) {
        console.log('No XML feed files found in feeds directory');
        return;
    }
    
    let totalGames = 0;
    
    for (const feedFile of feedFiles) {
        const feedPath = path.join(FEEDS_DIR, feedFile);
        console.log(`Processing feed: ${feedFile}`);
        
        const games = await parseXMLFeed(feedPath);
        
        if (games.length === 0) {
            console.log(`No games found in ${feedFile}`);
            continue;
        }
        
        console.log(`Found ${games.length} games in ${feedFile}`);
        
        // Generate pages for each locale
        for (const locale of LOCALES) {
            const localeDir = path.join(GAMES_DIR, locale);
            ensureDirectoryExists(localeDir);
            
            for (const game of games) {
                const { filename, html } = generateGamePage(game, locale);
                const filePath = path.join(localeDir, filename);
                
                fs.writeFileSync(filePath, html, 'utf8');
                console.log(`Generated: ${locale}/${filename}`);
                totalGames++;
            }
        }
    }
    
    console.log(`\nGeneration complete! Created ${totalGames} game pages across ${LOCALES.length} locales.`);
}

// Run the generator
if (require.main === module) {
    generateAllGamePages().catch(console.error);
}

module.exports = { generateAllGamePages, parseXMLFeed, generateGamePage };