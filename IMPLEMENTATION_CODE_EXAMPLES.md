# KLOOPIK: IMPLEMENTATION CODE EXAMPLES

This document provides specific, copy-paste ready code examples for implementing the recommended changes.

---

## 1. HOMEPAGE H1 IMPLEMENTATION

### Current Code (/index.html - lines 116-158)
```html
<header class="header" id="header">
    <div class="container">
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="#/" class="logo">
                    <h1>KLOOPIK</h1>
                </a>
            </div>
            <!-- Rest of navbar -->
        </nav>
    </div>
</header>

<main class="main-content">
    <div class="content-wrapper">
        <section class="games-section" id="gamesSection">
            <div class="section-header" style="display: none;">
                <h2 class="section-title" id="sectionTitle">All Games</h2>
            </div>
            <!-- Games grid -->
        </section>
    </div>
</main>
```

### Recommended Fix
```html
<header class="header" id="header">
    <div class="container">
        <nav class="navbar">
            <div class="navbar-brand">
                <a href="#/" class="logo">
                    <!-- Use sr-only (screen reader only) for brand H1 -->
                    <h1 class="sr-only">KLOOPIK - Free Online Games</h1>
                    <!-- Keep visual logo without H1 -->
                    <span class="logo-text" aria-hidden="true">KLOOPIK</span>
                </a>
            </div>
            <!-- Rest of navbar -->
        </nav>
    </div>
</header>

<main class="main-content">
    <div class="content-wrapper">
        <!-- Main page H1 for content -->
        <section class="hero-section">
            <h1>Play 700+ Free Online Games Instantly</h1>
            <p class="hero-subtitle">Discover HTML5 games across action, puzzle, racing, sports and more categories</p>
        </section>

        <section class="games-section" id="gamesSection">
            <div class="section-header">
                <h2 class="section-title" id="sectionTitle">Browse Games by Category</h2>
            </div>
            <!-- Games grid organized by category -->
        </section>

        <section class="featured-section">
            <h2>Featured Games This Week</h2>
            <!-- Featured games -->
        </section>

        <section class="popular-section">
            <h2>Most Popular Games</h2>
            <!-- Popular games -->
        </section>

        <section class="guides-section">
            <h2>Gaming Tips & Guides</h2>
            <!-- Guide snippets -->
        </section>
    </div>
</main>
```

### CSS Addition (for sr-only class)
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

---

## 2. GAME PAGE HEADER HIERARCHY FIX

### Current Code Issue (/catalog/moto-x3m/index.html - lines 299-340)
```html
<section class="game-section">
    <h2>Frequently Asked Questions</h2>
    <!-- FAQ content -->
</section>

<section class="game-section">
    <h3>Tags</h3>  <!-- PROBLEM: H3 without H2 parent -->
    <div class="tags-container">
        <a href="/tag/action/">Action</a>
        <!-- more tags -->
    </div>
</section>

<aside class="game-sidebar">
    <section class="related-games">
        <h3>Similar Action Games</h3>  <!-- PROBLEM: Should be H2 -->
        <!-- games list -->
    </section>

    <section class="popular-games">
        <h3>Popular Games</h3>  <!-- PROBLEM: Should be H2 -->
        <!-- games list -->
    </section>
</aside>
```

### Recommended Fix
```html
<!-- Main Content Section -->
<article class="game-info" itemscope itemtype="https://schema.org/VideoGame">

    <section class="game-section about-section">
        <h2>About Moto X3M</h2>
        <div class="game-description">
            <p itemprop="description">Moto X3M is an awesome bike game with challenging levels...</p>
        </div>
    </section>

    <section class="game-section how-to-section">
        <h2>How to Play Moto X3M</h2>
        <ol class="instructions-list">
            <li>Use arrow keys or WASD to move</li>
            <li>Press spacebar to jump</li>
            <!-- more steps -->
        </ol>
    </section>

    <section class="game-section controls-section">
        <h2>Game Controls</h2>
        <table class="controls-table">
            <thead>
                <tr>
                    <th scope="col">Control</th>
                    <th scope="col">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><kbd>Arrow Keys / WASD</kbd></td>
                    <td>Movement</td>
                </tr>
            </tbody>
        </table>
    </section>

    <section class="game-section features-section">
        <h2>Game Features</h2>
        <ul class="features-list">
            <li>Free to play online</li>
            <li>No downloads required</li>
        </ul>
    </section>

    <section class="game-section faq-section">
        <h2>Frequently Asked Questions About Moto X3M</h2>
        <dl class="faq-container" itemscope itemtype="https://schema.org/FAQPage">
            <!-- Expanded FAQ items using DL/DT/DD -->
            <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                <dt itemprop="name">What is Moto X3M?</dt>
                <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                    <p itemprop="text">Moto X3M is a free online action game...</p>
                </dd>
            </div>
            <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                <dt itemprop="name">How do I play Moto X3M?</dt>
                <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                    <p itemprop="text">Simply click the game to start...</p>
                </dd>
            </div>
            <!-- Add 3-5 more Q&A items -->
        </dl>
    </section>

    <!-- FIXED: Changed from H3 to H2 -->
    <section class="game-section tags-section">
        <h2>More Moto X3M Related Games</h2>
        <p>If you enjoy Moto X3M, check out these related games:</p>
        <div class="tags-container">
            <a href="/category/action/racing/" class="tag-link">Racing Games</a>
            <a href="/category/action/stunt/" class="tag-link">Stunt Games</a>
            <a href="/tag/motorcycle/" class="tag-link">Motorcycle Games</a>
            <!-- more tags with context -->
        </div>
    </section>

</article>

<!-- FIXED: Sidebar H3 changed to H2 -->
<aside class="game-sidebar" aria-label="Related games and content">

    <section class="related-games">
        <h2>Similar Action Games</h2>  <!-- Changed from H3 to H2 -->
        <p class="sidebar-description">Keep the adrenaline going with games like Moto X3M</p>
        <div class="related-games-list">
            <a href="/catalog/mr-racer/" class="game-card-mini">
                <img src="..." alt="MR RACER" loading="lazy">
                <div class="game-card-mini-info">
                    <div class="game-card-mini-title">MR RACER</div>
                </div>
            </a>
            <!-- more games -->
        </div>
        <a href="/category/action/" class="view-all-btn">View All Action Games</a>
    </section>

    <section class="popular-games">
        <h2>Popular Games Right Now</h2>  <!-- Changed from H3 to H2 -->
        <p class="sidebar-description">Trending on Kloopik this week</p>
        <div class="popular-games-list">
            <!-- Popular games list -->
        </div>
    </section>

</aside>
```

---

## 3. CATEGORY PAGE HEADER HIERARCHY

### Current Code (/category/action/index.html - lines 125-135)
```html
<main class="category-page">
    <div class="container">
        <div class="category-header">
            <h1>Action Games</h1>
            <p class="category-description">Play 212+ free action games online...</p>
            <p class="game-count">212 games available</p>
        </div>

        <div class="games-grid">
            <!-- Games directly in grid, no H2 sections -->
        </div>
    </div>
</main>
```

### Recommended Fix
```html
<main class="category-page">
    <div class="container">

        <header class="category-header">
            <h1>Action Games - Play 212+ Free Online</h1>
            <p class="category-description">Discover exciting action games with fast-paced gameplay and intense challenges. Play in your browser instantly.</p>
        </header>

        <!-- Table of Contents for improved navigation and SEO -->
        <nav class="table-of-contents" aria-label="Page contents">
            <h2>Quick Navigation</h2>
            <ul>
                <li><a href="#trending">Trending Now</a></li>
                <li><a href="#new-releases">New Releases</a></li>
                <li><a href="#most-played">Most Played</a></li>
                <li><a href="#by-subcategory">Browse by Subcategory</a></li>
            </ul>
        </nav>

        <!-- Trending Section -->
        <section class="games-section" id="trending">
            <h2>Trending Action Games</h2>
            <p class="section-description">The hottest action games on Kloopik right now</p>
            <div class="games-grid">
                <!-- 6-12 trending games -->
                <div class="game-card">
                    <a href="/catalog/mr-racer/">
                        <div class="game-card-image">
                            <img src="..." alt="MR RACER" loading="lazy">
                        </div>
                        <div class="game-card-title">MR RACER</div>
                    </a>
                </div>
                <!-- more cards -->
            </div>
        </section>

        <!-- New Releases Section -->
        <section class="games-section" id="new-releases">
            <h2>New Action Games</h2>
            <p class="section-description">Recently added action games</p>
            <div class="games-grid">
                <!-- Recently added games -->
            </div>
        </section>

        <!-- Most Played Section -->
        <section class="games-section" id="most-played">
            <h2>Most Played Action Games</h2>
            <p class="section-description">Most popular action games this month</p>
            <div class="games-grid">
                <!-- Top played games -->
            </div>
        </section>

        <!-- Subcategories Section -->
        <section class="games-section" id="by-subcategory">
            <h2>Action Games by Subcategory</h2>

            <article class="subcategory-group">
                <h3>Racing Games</h3>
                <p>Fast-paced racing and driving games with challenging courses and competition.</p>
                <div class="games-grid">
                    <!-- Racing games -->
                </div>
                <a href="/category/action/racing/" class="view-all">View all racing games (50+)</a>
            </article>

            <article class="subcategory-group">
                <h3>Shooting Games</h3>
                <p>Intense action-packed shooting games with various combat scenarios.</p>
                <div class="games-grid">
                    <!-- Shooting games -->
                </div>
                <a href="/category/action/shooting/" class="view-all">View all shooting games (40+)</a>
            </article>

            <article class="subcategory-group">
                <h3>Adventure Games</h3>
                <p>Epic action adventure games with exploration and challenging quests.</p>
                <div class="games-grid">
                    <!-- Adventure games -->
                </div>
                <a href="/category/action/adventure/" class="view-all">View all adventure games (30+)</a>
            </article>

        </section>

        <!-- Why Play Section -->
        <section class="games-section why-section">
            <h2>Why Play Action Games?</h2>
            <ul class="benefits-list">
                <li>Instant browser gameplay - no downloads needed</li>
                <li>Free to play anytime, anywhere</li>
                <li>Cross-device compatibility (desktop, mobile, tablet)</li>
                <li>Regular updates with new challenges</li>
                <li>Play with friends or solo</li>
            </ul>
        </section>

        <!-- Category FAQ -->
        <section class="games-section faq-section" itemscope itemtype="https://schema.org/FAQPage">
            <h2>Frequently Asked Questions About Action Games</h2>
            <dl class="faq-container">
                <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                    <dt itemprop="name">What are action games?</dt>
                    <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                        <p itemprop="text">Action games emphasize physical challenges, fast-paced gameplay, and real-time interaction. They often include elements like combat, platforming, or racing, requiring quick reflexes and strategic thinking.</p>
                    </dd>
                </div>
                <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                    <dt itemprop="name">What types of action games are available on Kloopik?</dt>
                    <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                        <p itemprop="text">Kloopik features various action game types including <a href="/category/action/racing/">racing games</a>, <a href="/category/action/shooting/">shooting games</a>, <a href="/category/action/adventure/">adventure games</a>, and more. Browse our <a href="#by-subcategory">subcategories section</a> to find your favorite style.</p>
                    </dd>
                </div>
                <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                    <dt itemprop="name">Are action games free to play?</dt>
                    <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                        <p itemprop="text">Yes! All action games on Kloopik are completely free. No purchases, downloads, subscriptions, or registration required. Simply load your browser and start playing.</p>
                    </dd>
                </div>
                <div class="faq-item" itemprop="mainEntity" itemscope itemtype="https://schema.org/Question">
                    <dt itemprop="name">Can I play action games on my mobile device?</dt>
                    <dd itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer">
                        <p itemprop="text">Absolutely! All action games on Kloopik are fully responsive and work perfectly on smartphones, tablets, and desktop computers. Controls automatically adjust to your device type.</p>
                    </dd>
                </div>
            </dl>
        </section>

        <!-- Pagination -->
        <nav class="pagination" aria-label="Game pagination">
            <h2>Browse More Games</h2>
            <ul>
                <li><a href="/category/action/?page=1" aria-current="page">1</a></li>
                <li><a href="/category/action/?page=2">2</a></li>
                <li><a href="/category/action/?page=3">3</a></li>
                <!-- more pages -->
            </ul>
        </nav>

    </div>
</main>
```

---

## 4. SCHEMA MARKUP ENHANCEMENTS

### VideoGame Schema Enhancement (Game Pages)

#### Current VideoGame Schema
```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Moto X3M",
    "description": "Moto X3M is an awesome bike game...",
    "url": "https://kloopik.com/catalog/moto-x3m/",
    "image": "https://playgama.com/cdn-cgi/imagedelivery/.../enlarged",
    "genre": ["Action","Racing","Adventure","Sports","Skill"],
    "gamePlatform": ["Web Browser", "Desktop", "Mobile"],
    "operatingSystem": "Any",
    "applicationCategory": "Game",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
    }
}
```

#### Enhanced VideoGame Schema
```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": "https://kloopik.com/catalog/moto-x3m/#videogame",
    "name": "Moto X3M",
    "description": "Moto X3M is an awesome bike game with challenging levels. Choose a bike, put your helmet on, pass obstacles, and get ready to beat the time on tons of off-road circuits.",
    "alternativeHeadline": "Play Moto X3M Online Free | Racing Game",
    "url": "https://kloopik.com/catalog/moto-x3m/",
    "image": [
        "https://playgama.com/cdn-cgi/imagedelivery/.../enlarged",
        "https://kloopik.com/images/moto-x3m-gameplay-1.jpg",
        "https://kloopik.com/images/moto-x3m-gameplay-2.jpg"
    ],
    "screenshot": [
        "https://kloopik.com/images/moto-x3m-screenshot-1.jpg",
        "https://kloopik.com/images/moto-x3m-screenshot-2.jpg"
    ],
    "genre": [
        "Action",
        "Racing",
        "Sports",
        "Skill"
    ],
    "gamePlatform": [
        "Web browser",
        "Desktop",
        "Mobile"
    ],
    "playMode": "SinglePlayer",
    "interactivityType": "mixed",
    "inLanguage": "en-US",
    "datePublished": "2015-10-15",
    "dateModified": "2025-10-25",
    "gameDuration": "PT15M",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://kloopik.com/catalog/moto-x3m/"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "1247",
        "reviewCount": "89",
        "bestRating": "5",
        "worstRating": "1"
    },
    "review": [
        {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5",
                "worstRating": "1"
            },
            "reviewBody": "One of the best racing games! Highly addictive and fun.",
            "author": {
                "@type": "Person",
                "name": "Game Player"
            },
            "datePublished": "2025-10-15"
        }
    ],
    "author": [
        {
            "@type": "Organization",
            "name": "Kloopik",
            "url": "https://kloopik.com"
        }
    ],
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com",
        "logo": {
            "@type": "ImageObject",
            "url": "https://kloopik.com/assets/logo.png",
            "width": "600",
            "height": "60"
        }
    },
    "potentialAction": [
        {
            "@type": "PlayAction",
            "target": "https://kloopik.com/catalog/moto-x3m/"
        },
        {
            "@type": "RateAction",
            "ratingValue": "[1-5]"
        }
    ]
}
```

### CollectionPage Schema Enhancement (Category Pages)

#### Enhanced CollectionPage Schema
```json
{
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://kloopik.com/category/action/#collection",
    "name": "Action Games",
    "description": "Play 212+ free action games online. Fast-paced gameplay, intense challenges, and thrilling adventures await. No download required.",
    "url": "https://kloopik.com/category/action/",
    "inLanguage": "en-US",
    "datePublished": "2024-01-15",
    "dateModified": "2025-10-27",
    "image": "https://kloopik.com/images/og-action.jpg",
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
    },
    "numberOfItems": 212,
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "@id": "https://kloopik.com/catalog/mr-racer-car-racing/",
                "name": "MR RACER - Car Racing",
                "image": "https://playgama.com/cdn-cgi/imagedelivery/.../enlarged",
                "url": "https://kloopik.com/catalog/mr-racer-car-racing/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "@id": "https://kloopik.com/catalog/moto-x3m/",
                "name": "Moto X3M",
                "image": "https://playgama.com/cdn-cgi/imagedelivery/.../enlarged",
                "url": "https://kloopik.com/catalog/moto-x3m/"
            }
        ]
    }
}
```

---

## 5. FAQ SCHEMA ENHANCEMENT (EXPANDED)

### Current FAQ Schema (5 Q&As)
```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "..."
            }
        },
        // 4 more Q&As
    ]
}
```

### Enhanced FAQ Schema (8-10 Q&As)
```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-what-is",
            "name": "What is Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Moto X3M is a free online action and racing game that you can play directly in your web browser. It's an awesome bike game with challenging levels where you choose a motorcycle, navigate obstacles, and try to beat the time on tough off-road circuits."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-how-play",
            "name": "How do I play Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Simply click the game above to start. Use arrow keys or WASD to control your bike's acceleration and tilt. Press spacebar to jump over obstacles. Complete each course by navigating around obstacles and landing your jumps perfectly."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-free",
            "name": "Is Moto X3M free to play?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Moto X3M is completely free to play. There are no hidden costs, no subscriptions, and no registration required. Just open your browser and start playing instantly."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-mobile",
            "name": "Can I play Moto X3M on mobile?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Moto X3M is fully responsive and optimized for mobile devices. Play on your smartphone or tablet using touch controls. The game automatically adjusts its interface to match your screen size and device type."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-download",
            "name": "Do I need to download Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "No download needed! Moto X3M runs directly in your web browser. It's compatible with Chrome, Firefox, Safari, Edge, and other modern browsers. No installation or setup required."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-requirements",
            "name": "What are the system requirements for Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Moto X3M requires a modern web browser and an internet connection. No additional software or powerful hardware is needed. It works on most devices from computers to tablets to smartphones."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-levels",
            "name": "How many levels does Moto X3M have?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Moto X3M features 25 progressively challenging levels. Each level introduces new obstacles and challenges, with the difficulty increasing as you progress through the game."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-save",
            "name": "Can I save my progress in Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Moto X3M automatically saves your progress using your browser's local storage. You can continue from where you left off the next time you play."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-offline",
            "name": "Is Moto X3M available offline?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Currently, Moto X3M requires an active internet connection to play. However, you can access it from any device with a web browser and internet connectivity."
            }
        },
        {
            "@type": "Question",
            "@id": "https://kloopik.com/catalog/moto-x3m/#faq-similar",
            "name": "What other games are similar to Moto X3M?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "If you enjoy Moto X3M, check out our collection of racing games and action games. Similar games include MR RACER, Crazy Motorcycle, and Drifting Car Master. Browse all racing games in our collection."
            }
        }
    ]
}
```

---

## 6. BREADCRUMB ENHANCEMENT

### Current Breadcrumb (Game Page)
```html
<nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
        <li><a href="/">Home</a></li>
        <li><a href="/category/action/">Action</a></li>
        <li><span>Moto X3M</span></li>
    </ol>
</nav>
```

### Enhanced Breadcrumb with Schema
```html
<nav class="breadcrumb" aria-label="Breadcrumb">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="https://kloopik.com/">
                <span itemprop="name">Kloopik Home</span>
            </a>
            <meta itemprop="position" content="1" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="https://kloopik.com/category/action/">
                <span itemprop="name">Action Games</span>
            </a>
            <meta itemprop="position" content="2" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <a itemprop="item" href="https://kloopik.com/category/action/racing/">
                <span itemprop="name">Racing Games</span>
            </a>
            <meta itemprop="position" content="3" />
        </li>
        <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <span itemprop="name">Moto X3M</span>
            <meta itemprop="position" content="4" />
        </li>
    </ol>
</nav>
```

---

## 7. GAME CONTROLS TABLE (Featured Snippet Optimization)

### Semantic HTML Table
```html
<section class="game-section controls-section">
    <h2>Moto X3M Game Controls</h2>
    <p>Master these controls to excel in the game:</p>

    <table class="controls-table" role="presentation">
        <thead>
            <tr>
                <th scope="col">Control</th>
                <th scope="col">Key(s)</th>
                <th scope="col">Action</th>
                <th scope="col">Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Movement</strong></td>
                <td><kbd>Arrow Keys</kbd> or <kbd>WASD</kbd></td>
                <td>Accelerate / Decelerate / Tilt</td>
                <td>Control your bike's speed and angle to navigate the course</td>
            </tr>
            <tr>
                <td><strong>Jump</strong></td>
                <td><kbd>Spacebar</kbd> or <kbd>Click</kbd></td>
                <td>Jump over obstacles</td>
                <td>Perform a jump to clear obstacles and gaps</td>
            </tr>
            <tr>
                <td><strong>Boost</strong></td>
                <td><kbd>Shift</kbd></td>
                <td>Special ability / Sprint</td>
                <td>Gain temporary speed boost or special ability</td>
            </tr>
            <tr>
                <td><strong>Pause</strong></td>
                <td><kbd>P</kbd> or <kbd>Esc</kbd></td>
                <td>Pause the game</td>
                <td>Pause gameplay to take a break</td>
            </tr>
            <tr>
                <td><strong>Fullscreen</strong></td>
                <td><kbd>F</kbd></td>
                <td>Toggle fullscreen mode</td>
                <td>Expand game to fill the entire screen</td>
            </tr>
        </tbody>
    </table>
</section>
```

---

## 8. INTERNAL LINKING ANCHOR TEXT OPTIMIZATION

### Current (Bad)
```html
<!-- Bad: Generic anchor -->
<a href="/category/action/">View All</a>

<!-- Bad: Title only -->
<a href="/catalog/moto-x3m/">Moto X3M</a>

<!-- Bad: Same text for different links -->
<a href="/category/racing/">Racing</a>
<a href="/category/action/">Action</a>
```

### Recommended (Good/Better/Best)
```html
<!-- GOOD: Descriptive with count -->
<a href="/category/action/">View all 212 action games</a>

<!-- BETTER: Keyword-rich -->
<a href="/category/action/">Discover 212 free action games online</a>

<!-- BEST: Contextual and keyword-rich -->
<a href="/category/action/">Explore 212 free action games - racing, shooting, adventure and more</a>

<!-- GOOD: Category context in game links -->
<a href="/catalog/moto-x3m/" class="game-link">
    <span class="game-title">Moto X3M</span>
    <span class="game-category">(Racing Game)</span>
</a>

<!-- BETTER: Full context -->
<a href="/catalog/moto-x3m/" title="Play Moto X3M - Free Racing Game">
    Moto X3M - Exciting free racing game with challenging obstacles
</a>

<!-- GOOD: Related categories -->
<a href="/category/action/racing/">All racing action games</a>
<a href="/category/sports/racing/">Sports racing games</a>
<a href="/category/action/">All action games</a>

<!-- GOOD: Cross-category internal links -->
<p>If you like racing games, you might also enjoy our
    <a href="/category/sports/">sports games collection</a>.
</p>
```

---

## 9. TABLE OF CONTENTS MARKUP

### HTML Structure
```html
<nav class="table-of-contents" aria-label="Page contents">
    <h2>Quick Navigation</h2>
    <p class="toc-intro">Jump to a section:</p>
    <ul class="toc-list">
        <li><a href="#trending" data-section="trending">Trending Now</a></li>
        <li><a href="#new-releases" data-section="new-releases">New Releases</a></li>
        <li><a href="#most-played" data-section="most-played">Most Played</a></li>
        <li><a href="#by-subcategory" data-section="subcategory">Browse by Subcategory</a></li>
        <li><a href="#why-play" data-section="why-play">Why Play Action Games</a></li>
        <li><a href="#faq" data-section="faq">FAQ</a></li>
    </ul>
</nav>

<!-- Corresponding sections -->
<section id="trending">
    <h2>Trending Action Games</h2>
    <!-- Content -->
</section>

<section id="new-releases">
    <h2>New Action Games</h2>
    <!-- Content -->
</section>

<section id="most-played">
    <h2>Most Played Action Games</h2>
    <!-- Content -->
</section>

<section id="by-subcategory">
    <h2>Action Games by Subcategory</h2>
    <!-- Content -->
</section>

<section id="why-play">
    <h2>Why Play Action Games?</h2>
    <!-- Content -->
</section>

<section id="faq">
    <h2>Frequently Asked Questions</h2>
    <!-- Content -->
</section>
```

### CSS Styling
```css
.table-of-contents {
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin: 30px 0;
}

.table-of-contents h2 {
    font-size: 18px;
    margin: 0 0 10px 0;
    color: #333;
}

.toc-intro {
    font-size: 14px;
    color: #666;
    margin: 0 0 15px 0;
}

.toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.toc-list li {
    margin: 8px 0;
}

.toc-list a {
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.toc-list a:hover {
    color: #4f46e5;
    text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
    .table-of-contents {
        padding: 15px;
    }

    .table-of-contents h2 {
        font-size: 16px;
    }

    .toc-list {
        column-count: 2;
    }
}
```

---

## 10. FEATURED CONTENT SECTIONS

### Games by Subcategory Section
```html
<section class="subcategories-section" id="by-subcategory">
    <h2>Action Games by Type</h2>
    <p class="section-intro">Explore action games organized by gameplay style:</p>

    <div class="subcategories-grid">

        <article class="subcategory-card">
            <div class="subcategory-header">
                <h3><a href="/action-games/racing/">Racing Games</a></h3>
                <span class="game-count">50+ games</span>
            </div>
            <p class="subcategory-description">
                Fast-paced racing and driving games featuring bikes, cars, and other vehicles.
                Complete challenging courses and beat the timer.
            </p>
            <div class="subcategory-preview">
                <!-- 3-4 game cards -->
            </div>
            <a href="/action-games/racing/" class="view-all-btn">View all racing games</a>
        </article>

        <article class="subcategory-card">
            <div class="subcategory-header">
                <h3><a href="/action-games/shooting/">Shooting Games</a></h3>
                <span class="game-count">40+ games</span>
            </div>
            <p class="subcategory-description">
                Intense action-packed shooting games with various combat scenarios.
                Test your accuracy and reflexes against enemies.
            </p>
            <div class="subcategory-preview">
                <!-- 3-4 game cards -->
            </div>
            <a href="/action-games/shooting/" class="view-all-btn">View all shooting games</a>
        </article>

        <article class="subcategory-card">
            <div class="subcategory-header">
                <h3><a href="/action-games/adventure/">Adventure Games</a></h3>
                <span class="game-count">30+ games</span>
            </div>
            <p class="subcategory-description">
                Epic action adventure games with exploration and challenging quests.
                Embark on thrilling journeys filled with discovery.
            </p>
            <div class="subcategory-preview">
                <!-- 3-4 game cards -->
            </div>
            <a href="/action-games/adventure/" class="view-all-btn">View all adventure games</a>
        </article>

    </div>
</section>
```

---

## Quick Implementation Checklist

- [ ] Add H1 to homepage
- [ ] Fix H3 to H2 on all game pages (tags, sidebar sections)
- [ ] Add H2/H3 structure to category pages
- [ ] Enhance VideoGame schema with ratings and dates
- [ ] Expand FAQ sections (5 → 8-10 Q&As)
- [ ] Add CollectionPage schema to categories
- [ ] Implement table of contents on category pages
- [ ] Add FAQ sections to category pages
- [ ] Optimize internal link anchor text
- [ ] Add breadcrumb enhancements
- [ ] Implement semantic HTML tables for controls
- [ ] Add subcategory structure to categories
- [ ] Create cross-category internal linking

All code examples above are ready to implement. Update file paths and content as needed for your specific setup.
