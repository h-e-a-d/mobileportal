#!/usr/bin/env python3

import os
import re
from pathlib import Path
import html

# Configuration
FEEDS_DIR = Path(__file__).parent / "../feeds"
GAMES_DIR = Path(__file__).parent / "../games"
LOCALES = ['en', 'de']

# Game page HTML template (same as before)
GAME_PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="{locale}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play {title} - Free Online Game</title>
    <meta name="description" content="Play {title} for free online. {description}">
    <meta name="keywords" content="game, online, free, {title}, {category}, {tags}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="games/{locale}/{filename}">
    <meta property="og:title" content="Play {title} - Free Online Game">
    <meta property="og:description" content="Play {title} for free online. {description}">
    <meta property="og:image" content="{thumb}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="games/{locale}/{filename}">
    <meta property="twitter:title" content="Play {title} - Free Online Game">
    <meta property="twitter:description" content="Play {title} for free online. {description}">
    <meta property="twitter:image" content="{thumb}">
    
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
    new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    }})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
    <!-- End Google Tag Manager -->
    
    <link rel="stylesheet" href="../../src/css/base.css">
    <link rel="stylesheet" href="../../src/css/components.css">
    <link rel="stylesheet" href="../../src/css/game-page.css">
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "{title}",
        "description": "{description}",
        "image": "{thumb}",
        "genre": "{category}",
        "operatingSystem": "Web Browser",
        "applicationCategory": "Game",
        "offers": {{
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }}
    }}
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
                    <h1 class="game-title">{title}</h1>
                    <div class="game-meta">
                        <span class="game-category">Category: {category}</span>
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
                    src="{game_url}" 
                    width="{width}" 
                    height="{height}"
                    frameborder="0" 
                    allowfullscreen
                    title="{title}"
                    onload="hideLoading()">
                </iframe>
            </div>
        </div>
        
        <div class="game-sidebar">
            <div class="game-description">
                <h2>Instructions</h2>
                <p>{description}</p>
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
        document.addEventListener('DOMContentLoaded', function() {{
            const gameController = new GamePageController({{
                gameTitle: '{title}',
                gameCategory: '{category}',
                gameSlug: '{slug}',
                locale: '{locale}'
            }});
            
            // Google Analytics event tracking
            if (typeof gtag !== 'undefined') {{
                gtag('event', 'game_view', {{
                    'game_title': '{title}',
                    'game_category': '{category}',
                    'page_location': window.location.href
                }});
            }}
        }});
        
        function hideLoading() {{
            document.getElementById('gameLoading').style.display = 'none';
        }}
    </script>
</body>
</html>"""

def slugify(text):
    """Convert text to URL-friendly slug"""
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')

def ensure_directory_exists(directory):
    """Create directory if it doesn't exist"""
    directory.mkdir(parents=True, exist_ok=True)

def extract_tag_content(text, tag):
    """Extract content from XML/HTML tag using regex"""
    pattern = f'<{tag}>(.*?)</{tag}>'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    if match:
        content = match.group(1)
        # Clean up HTML entities
        content = html.unescape(content)
        # Remove HTML tags
        content = re.sub(r'<[^>]+>', '', content)
        return content.strip()
    return ''

def parse_rss_feed_simple(feed_path):
    """Parse RSS feed using regex to extract game data"""
    try:
        with open(feed_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip the first line if it's not valid XML
        lines = content.split('\n')
        if lines[0].startswith('This XML file does not appear'):
            content = '\n'.join(lines[1:])
        
        games = []
        
        # Extract all <item> blocks
        item_pattern = r'<item>(.*?)</item>'
        items = re.findall(item_pattern, content, re.DOTALL | re.IGNORECASE)
        
        for item_content in items:
            game = {}
            
            # Extract game information using regex
            game['id'] = extract_tag_content(item_content, 'id')
            game['title'] = extract_tag_content(item_content, 'title')
            game['description'] = extract_tag_content(item_content, 'description')
            game['category'] = extract_tag_content(item_content, 'category')
            game['url'] = extract_tag_content(item_content, 'url')
            game['thumb'] = extract_tag_content(item_content, 'thumb')
            game['width'] = extract_tag_content(item_content, 'width') or '800'
            game['height'] = extract_tag_content(item_content, 'height') or '600'
            game['tags'] = extract_tag_content(item_content, 'tags')
            game['instructions'] = extract_tag_content(item_content, 'instructions')
            
            # Set defaults if missing
            if not game['title']:
                continue  # Skip items without titles
            
            game.setdefault('description', 'A fun online game.')
            game.setdefault('category', 'Arcade')
            game.setdefault('width', '800')
            game.setdefault('height', '600')
            
            games.append(game)
        
        return games
    except Exception as e:
        print(f"Error parsing RSS feed {feed_path}: {e}")
        return []

def generate_game_page(game, locale):
    """Generate HTML page for a single game"""
    slug = slugify(game.get('title', ''))
    filename = f"{slug}-{locale}.html"
    
    # Prepare template variables - escape quotes and clean text
    template_vars = {}
    for key, value in game.items():
        if isinstance(value, str):
            # Clean the value for HTML
            clean_value = value.replace('"', '&quot;').replace("'", "&#39;")
            template_vars[key] = clean_value
        else:
            template_vars[key] = value
    
    template_vars.update({
        'slug': slug,
        'locale': locale,
        'filename': filename,
        'game_url': game.get('url', ''),
    })
    
    # Generate HTML content
    html_content = GAME_PAGE_TEMPLATE.format(**template_vars)
    
    # Write to file
    locale_dir = GAMES_DIR / locale
    ensure_directory_exists(locale_dir)
    
    file_path = locale_dir / filename
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return filename

def generate_games_list_json(games, locale):
    """Generate JSON file with games list for the locale"""
    import json
    
    games_data = []
    for game in games:
        slug = slugify(game.get('title', ''))
        games_data.append({
            'id': game.get('id', ''),
            'title': game.get('title', ''),
            'description': game.get('description', ''),
            'category': game.get('category', ''),
            'thumb': game.get('thumb', ''),
            'url': f"games/{locale}/{slug}-{locale}.html",
            'width': game.get('width', '800'),
            'height': game.get('height', '600'),
            'tags': game.get('tags', ''),
            'slug': slug
        })
    
    # Write JSON file
    locale_dir = GAMES_DIR / locale
    ensure_directory_exists(locale_dir)
    
    json_path = locale_dir / 'games-list.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(games_data, f, indent=2, ensure_ascii=False)
    
    print(f"Generated: {locale}/games-list.json")

def main():
    """Main function to generate all game pages"""
    print("Starting game page generation...")
    
    # Ensure games directory exists
    ensure_directory_exists(GAMES_DIR)
    
    # Find all XML feed files
    xml_files = list(FEEDS_DIR.glob('*.xml'))
    
    if not xml_files:
        print(f"No XML files found in {FEEDS_DIR}")
        return
    
    total_games = 0
    all_games = []
    
    for xml_file in xml_files:
        print(f"Processing feed: {xml_file.name}")
        
        games = parse_rss_feed_simple(xml_file)
        if not games:
            print(f"No games found in {xml_file.name}")
            continue
        
        print(f"Found {len(games)} games in {xml_file.name}")
        all_games.extend(games)
        
        # Generate pages for each locale
        for locale in LOCALES:
            for game in games:
                filename = generate_game_page(game, locale)
                print(f"Generated: {locale}/{filename}")
                total_games += 1
    
    # Generate games list JSON files for each locale
    for locale in LOCALES:
        generate_games_list_json(all_games, locale)
    
    print(f"\nGeneration complete! Created {total_games} game pages across {len(LOCALES)} locales.")

if __name__ == "__main__":
    main()