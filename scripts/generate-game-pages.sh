#!/bin/bash

# Game Page Generator Script
# Generates HTML pages for all games in XML feeds

# Configuration
FEEDS_DIR="../feeds"
GAMES_DIR="../games"
LOCALES=("en" "de")

# Create directories if they don't exist
mkdir -p "$GAMES_DIR"
for locale in "${LOCALES[@]}"; do
    mkdir -p "$GAMES_DIR/$locale"
done

# Function to slugify text
slugify() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g'
}

# Function to extract text from XML tags
extract_xml_tag() {
    local xml_content="$1"
    local tag="$2"
    echo "$xml_content" | grep -o "<$tag>.*</$tag>" | sed "s/<$tag>//g" | sed "s/<\/$tag>//g"
}

# Function to generate game page HTML
generate_game_page() {
    local title="$1"
    local description="$2"
    local category="$3"
    local thumb="$4"
    local game_url="$5"
    local width="$6"
    local height="$7"
    local tags="$8"
    local locale="$9"
    
    local slug=$(slugify "$title")
    local filename="${slug}-${locale}.html"
    
    # Generate HTML content
    cat > "$GAMES_DIR/$locale/$filename" << EOF
<!DOCTYPE html>
<html lang="$locale">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Play $title - Free Online Game</title>
    <meta name="description" content="Play $title for free online. $description">
    <meta name="keywords" content="game, online, free, $title, $category, $tags">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="games/$locale/$filename">
    <meta property="og:title" content="Play $title - Free Online Game">
    <meta property="og:description" content="Play $title for free online. $description">
    <meta property="og:image" content="$thumb">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="games/$locale/$filename">
    <meta property="twitter:title" content="Play $title - Free Online Game">
    <meta property="twitter:description" content="Play $title for free online. $description">
    <meta property="twitter:image" content="$thumb">
    
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
        "name": "$title",
        "description": "$description",
        "image": "$thumb",
        "genre": "$category",
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
                    <h1 class="game-title">$title</h1>
                    <div class="game-meta">
                        <span class="game-category">Category: $category</span>
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
                    src="$game_url" 
                    width="$width" 
                    height="$height"
                    frameborder="0" 
                    allowfullscreen
                    title="$title"
                    onload="hideLoading()">
                </iframe>
            </div>
        </div>
        
        <div class="game-sidebar">
            <div class="game-description">
                <h2>Instructions</h2>
                <p>$description</p>
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
                gameTitle: '$title',
                gameCategory: '$category',
                gameSlug: '$slug',
                locale: '$locale'
            });
            
            // Google Analytics event tracking
            if (typeof gtag !== 'undefined') {
                gtag('event', 'game_view', {
                    'game_title': '$title',
                    'game_category': '$category',
                    'page_location': window.location.href
                });
            }
        });
        
        function hideLoading() {
            document.getElementById('gameLoading').style.display = 'none';
        }
    </script>
</body>
</html>
EOF

    echo "Generated: $locale/$filename"
}

# Main function to process XML feeds
process_xml_feeds() {
    local total_games=0
    
    echo "Starting game page generation..."
    
    # Find all XML files in feeds directory
    for xml_file in "$FEEDS_DIR"/*.xml; do
        if [ ! -f "$xml_file" ]; then
            echo "No XML files found in $FEEDS_DIR"
            continue
        fi
        
        echo "Processing feed: $(basename "$xml_file")"
        
        # Read XML file and extract game data
        local xml_content=$(cat "$xml_file")
        
        # Extract each game block
        echo "$xml_content" | grep -o '<game>.*</game>' | while read game_block; do
            # Extract game information
            local title=$(extract_xml_tag "$game_block" "title")
            local description=$(extract_xml_tag "$game_block" "description")
            local category=$(extract_xml_tag "$game_block" "category")
            local thumb=$(extract_xml_tag "$game_block" "thumb")
            local game_url=$(extract_xml_tag "$game_block" "url")
            local width=$(extract_xml_tag "$game_block" "width")
            local height=$(extract_xml_tag "$game_block" "height")
            local tags=$(extract_xml_tag "$game_block" "tags")
            
            # Set defaults if empty
            width=${width:-800}
            height=${height:-600}
            
            # Generate pages for each locale
            for locale in "${LOCALES[@]}"; do
                generate_game_page "$title" "$description" "$category" "$thumb" "$game_url" "$width" "$height" "$tags" "$locale"
                ((total_games++))
            done
        done
    done
    
    echo ""
    echo "Generation complete! Created $total_games game pages across ${#LOCALES[@]} locales."
}

# Run the generator
cd "$(dirname "$0")"
process_xml_feeds