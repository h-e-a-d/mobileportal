# Complete JSON-LD Schema Examples for Game Pages

This document contains ready-to-use schema markup examples for different game types. Copy and customize for your 706 game pages.

---

## Example 1: Action Game (Complete Package)

**Game**: "Rocket Racer"

### Schema 1.1: VideoGame Schema

```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": "https://kloopik.com/game/rocket-racer",
    "name": "Rocket Racer",
    "description": "Rocket Racer is a fast-paced racing game where players navigate high-speed tracks while collecting power-ups and avoiding obstacles. Experience 12 unique tracks with realistic physics, stunning 3D graphics, and competitive multiplayer modes for arcade racing fun.",
    "url": "https://kloopik.com/game/rocket-racer",
    "image": [
        "https://kloopik.com/images/rocket-racer-600x400.jpg",
        "https://kloopik.com/images/rocket-racer-1200x630.jpg",
        "https://kloopik.com/images/rocket-racer-gameplay.jpg"
    ],
    "gameServer": "https://playgama.com/export/game/rocket-racer?clid=YOUR_CLID",
    "author": {
        "@type": "Organization",
        "name": "GameDev Studios"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
    },
    "genre": [
        "Racing",
        "Action",
        "Arcade"
    ],
    "playMode": [
        "SinglePlayer",
        "MultiPlayer"
    ],
    "platformPlatform": [
        "Web browser",
        "iOS",
        "Android"
    ],
    "applicationCategory": "Game",
    "interactivityType": "mixed",
    "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "0"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "2847",
        "bestRating": "5",
        "worstRating": "1"
    },
    "potentialAction": {
        "@type": "PlayAction",
        "target": "https://kloopik.com/game/rocket-racer"
    },
    "video": {
        "@type": "VideoObject",
        "name": "Rocket Racer Gameplay",
        "description": "Watch Rocket Racer gameplay featuring high-speed racing and power-up collection",
        "thumbnailUrl": "https://kloopik.com/images/rocket-racer-video-thumb.jpg",
        "uploadDate": "2024-10-17"
    }
}
```

### Schema 1.2: FAQPage Schema

```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is Rocket Racer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Rocket Racer is a fast-paced racing game where players navigate high-speed tracks while collecting power-ups and avoiding obstacles. The game features 12 unique tracks, realistic physics, and competitive multiplayer modes. With stunning 3D graphics and intense gameplay, it offers thrilling competition for speed enthusiasts seeking arcade racing fun."
            }
        },
        {
            "@type": "Question",
            "name": "How do I play Rocket Racer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "1. Master Controls: Use arrow keys or mouse to steer left and right through the track without hitting walls. 2. Collect Power-ups: Drive over shields for protection, stars for speed boosts, and turbo zones for temporary acceleration. 3. Avoid Obstacles: Navigate around enemy rockets, mines, and environmental hazards that damage your vehicle. 4. Navigate Tracks: Complete each circuit by following the race path while managing fuel and health. 5. Defeat Rivals: Outrace AI opponents or real players to reach the finish line first. 6. Unlock Content: Complete races to unlock new vehicles and track variants."
            }
        },
        {
            "@type": "Question",
            "name": "What are the controls for Rocket Racer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Desktop: Arrow Keys to steer left/right, Spacebar to accelerate, Shift for power drift, Mouse look for camera control. Mobile: Tap left side of screen to move left, tap right side to move right, hold bottom area for acceleration."
            }
        },
        {
            "@type": "Question",
            "name": "Is Rocket Racer free to play?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Rocket Racer is completely free to play online. No download, registration, or in-app purchases required. Play directly in your web browser on any device."
            }
        },
        {
            "@type": "Question",
            "name": "What devices can I play Rocket Racer on?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Rocket Racer works on desktop computers, laptops, tablets (iPad, Android tablets), and smartphones (iPhone, Android phones). Play on any device with a modern web browser including Chrome, Firefox, Safari, and Edge."
            }
        },
        {
            "@type": "Question",
            "name": "Can I play Rocket Racer offline?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Rocket Racer requires an internet connection to play. However, you can play single-player races and avoid online multiplayer matches if your connection is slow."
            }
        },
        {
            "@type": "Question",
            "name": "Does Rocket Racer have multiplayer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Rocket Racer features online multiplayer modes where you can race against other players in real-time. Compete on global leaderboards and earn rankings based on your performance."
            }
        },
        {
            "@type": "Question",
            "name": "What's the best strategy for Rocket Racer?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Master track layouts by practicing each course. Learn optimal racing lines and power-up locations. Use drifting to maintain speed through turns. Collect turbo boosts and shield power-ups strategically. Practice on easier difficulties before attempting hard mode. Watch replays to identify where you lost time. Focus on consistency rather than risky shortcuts."
            }
        }
    ]
}
```

### Schema 1.3: HowTo Schema

```json
{
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Play Rocket Racer",
    "description": "Step-by-step guide to mastering Rocket Racer racing game",
    "image": "https://kloopik.com/images/rocket-racer-600x400.jpg",
    "totalTime": "PT5M",
    "estimatedCost": {
        "@type": "PriceSpecification",
        "priceCurrency": "USD",
        "price": "0"
    },
    "step": [
        {
            "@type": "HowToStep",
            "position": 1,
            "name": "Master Controls",
            "text": "Learn the control scheme: Use arrow keys or WASD to steer left and right. Press spacebar to accelerate. Use shift for power drifting to maintain speed through turns. Practice in the tutorial level.",
            "image": "https://kloopik.com/images/rocket-racer-step1.jpg"
        },
        {
            "@type": "HowToStep",
            "position": 2,
            "name": "Learn Track Layouts",
            "text": "Study each track's layout before racing. Identify optimal racing lines that minimize distance. Memorize power-up locations. Learn where hazards appear. Use practice mode to familiarize yourself with 12 unique tracks.",
            "image": "https://kloopik.com/images/rocket-racer-step2.jpg"
        },
        {
            "@type": "HowToStep",
            "position": 3,
            "name": "Collect Power-ups",
            "text": "Drive over colored items to gain advantages: Shield for protection, Star for speed boost, Turbo zone for acceleration. Prioritize collecting power-ups that help you catch lead racers. Plan routes to intercept power-ups efficiently.",
            "image": "https://kloopik.com/images/rocket-racer-step3.jpg"
        },
        {
            "@type": "HowToStep",
            "position": 4,
            "name": "Avoid Obstacles",
            "text": "Watch for enemy rockets, mines, and wall hazards. Develop reflexes to dodge incoming threats. Use shield power-ups before dangerous sections. Position your vehicle in safe lanes away from hazards. Practice dodging patterns.",
            "image": "https://kloopik.com/images/rocket-racer-step4.jpg"
        },
        {
            "@type": "HowToStep",
            "position": 5,
            "name": "Execute Perfect Drifts",
            "text": "Master power drifting to maintain speed through corners. Hold shift while turning to enter drift. Release at right moment to accelerate. Practice timing drift exits perfectly. Chain drifts for turbo multiplier bonus.",
            "image": "https://kloopik.com/images/rocket-racer-step5.jpg"
        },
        {
            "@type": "HowToStep",
            "position": 6,
            "name": "Reach the Finish Line",
            "text": "Outpace AI opponents or real players to finish first. Maintain steady pace while collecting power-ups. Use boosts strategically before final straightaway. Cross finish line to advance to next race and unlock new content.",
            "image": "https://kloopik.com/images/rocket-racer-step6.jpg"
        }
    ]
}
```

### Schema 1.4: BreadcrumbList Schema

```json
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Games",
            "item": "https://kloopik.com/",
            "image": "https://kloopik.com/images/icon-home.png"
        },
        {
            "@type": "ListItem",
            "position": 2,
            "name": "Racing Games",
            "item": "https://kloopik.com/category/racing",
            "image": "https://kloopik.com/images/icon-racing.png"
        },
        {
            "@type": "ListItem",
            "position": 3,
            "name": "Arcade Games",
            "item": "https://kloopik.com/category/arcade",
            "image": "https://kloopik.com/images/icon-arcade.png"
        },
        {
            "@type": "ListItem",
            "position": 4,
            "name": "Rocket Racer",
            "item": "https://kloopik.com/game/rocket-racer",
            "image": "https://kloopik.com/images/rocket-racer-thumb.png"
        }
    ]
}
```

---

## Example 2: Puzzle Game (Complete Package)

**Game**: "Bubble Blast"

### Schema 2.1: VideoGame Schema

```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": "https://kloopik.com/game/bubble-blast",
    "name": "Bubble Blast",
    "description": "Bubble Blast is a bubble-shooting puzzle game where players match colored bubbles to clear the board across 200+ levels. Master strategic bubble combinations to achieve high scores. Perfect for puzzle enthusiasts seeking relaxing yet challenging gameplay.",
    "url": "https://kloopik.com/game/bubble-blast",
    "image": [
        "https://kloopik.com/images/bubble-blast-600x400.jpg",
        "https://kloopik.com/images/bubble-blast-1200x630.jpg"
    ],
    "gameServer": "https://playgama.com/export/game/bubble-blast?clid=YOUR_CLID",
    "author": {
        "@type": "Organization",
        "name": "PuzzleWorks Game Studio"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
    },
    "genre": [
        "Puzzle",
        "Casual",
        "Match-3"
    ],
    "playMode": "SinglePlayer",
    "platformPlatform": [
        "Web browser",
        "iOS",
        "Android"
    ],
    "applicationCategory": "Game",
    "interactivityType": "mixed",
    "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "0"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "ratingCount": "5234",
        "bestRating": "5",
        "worstRating": "1"
    },
    "potentialAction": {
        "@type": "PlayAction",
        "target": "https://kloopik.com/game/bubble-blast"
    }
}
```

### Schema 2.2: FAQPage Schema

```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is Bubble Blast?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Bubble Blast is a bubble-shooting puzzle game where players match colored bubbles to clear the board. The game challenges players to achieve high scores through strategic bubble combinations, featuring over 200 levels of increasing difficulty. With relaxing gameplay and satisfying physics, it's perfect for puzzle enthusiasts seeking casual brain-teasing fun."
            }
        },
        {
            "@type": "Question",
            "name": "How do I play Bubble Blast?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "1. Understand Objective: Clear all bubbles from the board within move limits. 2. Aim Your Shot: Click or tap where you want to shoot the bubble. 3. Match Colors: Connect 3 or more bubbles of the same color to pop them. 4. Plan Ahead: Think about how popping bubbles will affect the board layout. 5. Earn Combos: Create chain reactions to earn bonus points and special power bubbles. 6. Complete Levels: Clear all bubbles before running out of moves to advance."
            }
        },
        {
            "@type": "Question",
            "name": "What's the strategy for Bubble Blast?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Plan multiple moves ahead rather than making random shots. Focus on creating chain reactions to maximize combo points. Pop bubbles from the top down to create cascades. Save power bubbles for when you're stuck. Use boosters strategically on difficult levels. Practice early levels to learn physics and bubble behavior."
            }
        },
        {
            "@type": "Question",
            "name": "Is Bubble Blast free to play?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Bubble Blast is completely free to play online with no downloads or registration required. Play directly in your web browser without paying."
            }
        },
        {
            "@type": "Question",
            "name": "Can I play Bubble Blast offline?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Bubble Blast requires an internet connection to play online. However, you can download a mobile app version that supports offline gameplay."
            }
        }
    ]
}
```

---

## Example 3: Sports Game (Complete Package)

**Game**: "Football Master"

### Schema 3.1: VideoGame Schema

```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": "https://kloopik.com/game/football-master",
    "name": "Football Master",
    "description": "Football Master is a sports simulation game where players build teams, manage players, and compete in realistic football matches. Experience dynamic weather, player customization, and global leaderboards for competitive team management gameplay.",
    "url": "https://kloopik.com/game/football-master",
    "image": [
        "https://kloopik.com/images/football-master-600x400.jpg",
        "https://kloopik.com/images/football-master-1200x630.jpg"
    ],
    "gameServer": "https://playgama.com/export/game/football-master?clid=YOUR_CLID",
    "author": {
        "@type": "Organization",
        "name": "Sports Games International"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Kloopik",
        "url": "https://kloopik.com"
    },
    "genre": [
        "Sports",
        "Simulation",
        "Strategy"
    ],
    "playMode": [
        "SinglePlayer",
        "MultiPlayer"
    ],
    "platformPlatform": [
        "Web browser",
        "iOS",
        "Android"
    ],
    "applicationCategory": "Game",
    "interactivityType": "mixed",
    "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "0"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.6",
        "ratingCount": "3821",
        "bestRating": "5",
        "worstRating": "1"
    },
    "potentialAction": {
        "@type": "PlayAction",
        "target": "https://kloopik.com/game/football-master"
    }
}
```

### Schema 3.2: FAQPage Schema

```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "What is Football Master?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Football Master is a sports simulation game featuring realistic football gameplay where players build teams, manage players, and compete in matches. Features include dynamic weather, player customization, and global leaderboards for ranking. With authentic sports mechanics and strategic team management, it offers competitive gameplay for sports fans."
            }
        },
        {
            "@type": "Question",
            "name": "How do I play Football Master?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "1. Build Your Team: Recruit players and assign formations. 2. Manage Players: Train players to improve stats and skills. 3. Set Strategy: Choose tactics and player positions for matches. 4. Play Matches: Compete against AI or other players in real-time. 5. Win Tournaments: Complete seasons to climb league tables. 6. Earn Rewards: Collect currency and unlock new players."
            }
        },
        {
            "@type": "Question",
            "name": "What are the main football positions in Football Master?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Football Master includes all standard positions: Goalkeeper (GK), Defenders (CB, LB, RB), Midfielders (CM, CAM, CDM), and Forwards (ST, CF). Each position requires different player attributes. Build balanced teams by selecting players with appropriate stats for each position."
            }
        },
        {
            "@type": "Question",
            "name": "Is Football Master free to play?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Football Master is free to play online. No download or registration required. Start playing immediately in your web browser."
            }
        },
        {
            "@type": "Question",
            "name": "Can I play Football Master with friends?",
            "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, Football Master supports multiplayer matches where you can compete against friends or random players online. Join tournaments and climb global leaderboards."
            }
        }
    ]
}
```

---

## Example 4: Minimal Schema (Quick Implementation)

For faster deployment across all 706 games, use this minimal but effective schema:

```json
{
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "{{GAME_TITLE}}",
    "description": "{{SHORT_DESCRIPTION}}",
    "url": "https://kloopik.com/game/{{GAME_SLUG}}",
    "image": "https://kloopik.com/images/{{GAME_SLUG}}-600x400.jpg",
    "author": {"@type": "Organization", "name": "{{DEVELOPER}}"},
    "publisher": {"@type": "Organization", "name": "Kloopik"},
    "genre": {{GENRES_JSON}},
    "applicationCategory": "Game",
    "offers": {"@type": "Offer", "priceCurrency": "USD", "price": "0"}
}
```

---

## Validation Tools

Use these tools to validate your schema markup:

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://schema.org/validator
3. **Structured Data Testing Tool**: https://developers.google.com/structured-data/testing-tool
4. **JSON-LD Playground**: https://json-ld.org/playground/

---

## Common Errors & Fixes

### Error 1: "ratingCount missing"
**Fix**: Add `"ratingCount": "0"` even if no ratings yet

### Error 2: "Invalid genre"
**Fix**: Use schema.org valid genres only (see list below)

### Error 3: "platformPlatform should be Text"
**Fix**: Use `"Web browser"` instead of platform objects

### Error 4: "Missing required playMode"
**Fix**: Add `"playMode": "SinglePlayer"` at minimum

### Error 5: "Invalid URL format"
**Fix**: Ensure all URLs start with `https://`

---

## Valid GameGenre Values

```
Action
Casual
Educational
Puzzle
Racing
RolePlaying
Simulation
Sports
Strategy
Trivia
WordGame
Card
BoardGame
Adventure
Strategy
Musical
3DGraphics
2DGraphics
Multiplayer
SinglePlayer
Cooperative
```

---

## Next Steps

1. Choose your schema approach (Complete vs. Minimal)
2. Customize templates for your game types
3. Validate all schema at schema.org/validator
4. Implement across all 706 games
5. Submit XML sitemap to Google Search Console
6. Monitor rich results in Google Search Console
