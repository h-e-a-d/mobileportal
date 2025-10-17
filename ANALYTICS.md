# Analytics & Tracking System Documentation

## Overview

This document describes the comprehensive analytics and tracking system implemented for Kloopik Gaming Portal. The system uses **Google Tag Manager (GTM)** with container ID `GTM-PK768FJP` to track user behavior, business metrics, and performance data.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tracked Events](#tracked-events)
3. [GTM Setup Guide](#gtm-setup-guide)
4. [Google Analytics 4 Configuration](#google-analytics-4-configuration)
5. [Data Layer Reference](#data-layer-reference)
6. [Key Metrics & Reports](#key-metrics--reports)
7. [Business Intelligence](#business-intelligence)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

The analytics system is already integrated and will automatically track events once GTM is properly configured.

### Verification

1. Open browser DevTools Console
2. Check for `[Analytics] Module initialized` message
3. Navigate through the site and watch for `[Analytics] Event tracked: <event_name>` messages
4. Use GTM Preview Mode to verify events are being sent

---

## Tracked Events

### Session Events

#### `session_start`
Triggered when a user starts a new session.

**Data Layer:**
```javascript
{
  event: 'session_start',
  session_data: {
    visit_count: 3,              // Number of total visits
    is_returning: true,          // Whether user has visited before
    time_since_last_visit: 86400000  // Milliseconds since last visit (null for first visit)
  }
}
```

#### `session_end`
Triggered when user leaves the site (beforeunload event).

**Data Layer:**
```javascript
{
  event: 'session_end',
  session_data: {
    duration_ms: 245000,         // Session duration in milliseconds
    duration_seconds: 245,       // Session duration in seconds
    duration_minutes: 4,         // Session duration in minutes (rounded)
    pages_viewed: 5,             // Number of pages viewed
    games_played: 2,             // Number of games played
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

### Page Tracking

#### `page_view`
Triggered on every route change.

**Data Layer:**
```javascript
{
  event: 'page_view',
  page_data: {
    path: '/favorites',          // Current path
    title: 'My Favorites - Kloopik',  // Page title
    referrer: 'https://google.com',   // Referrer URL
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

### Game Events

#### `game_play`
Triggered when a game is opened in the modal.

**Data Layer:**
```javascript
{
  event: 'game_play',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    game_slug: 'subway-surfers',
    category: 'arcade',
    categories: ['arcade', 'running', 'casual'],
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Identify most popular games, peak playing times, and user preferences.

#### `game_close`
Triggered when a game is closed.

**Data Layer:**
```javascript
{
  event: 'game_close',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    game_slug: 'subway-surfers',
    category: 'arcade',
    play_duration_ms: 125000,    // Play duration in milliseconds
    play_duration_seconds: 125,  // Play duration in seconds
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Track engagement time, identify games with high/low retention.

#### `game_click`
Triggered when a game card is clicked (before modal opens).

**Data Layer:**
```javascript
{
  event: 'game_click',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    game_slug: 'subway-surfers',
    category: 'arcade',
    position: 'row-1-position-3',  // Position in grid (if tracked)
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Measure click-through rates, optimize game placement.

#### `game_favorite_add`
Triggered when a game is added to favorites.

**Data Layer:**
```javascript
{
  event: 'game_favorite_add',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    game_slug: 'subway-surfers',
    category: 'arcade',
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Identify most loved games, measure user engagement.

#### `game_favorite_remove`
Triggered when a game is removed from favorites.

**Data Layer:**
```javascript
{
  event: 'game_favorite_remove',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    game_slug: 'subway-surfers',
    category: 'arcade',
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

#### `game_fullscreen`
Triggered when fullscreen mode is toggled.

**Data Layer:**
```javascript
{
  event: 'game_fullscreen',
  game_data: {
    game_id: '12345',
    game_name: 'Subway Surfers',
    action: 'enter',  // 'enter' or 'exit'
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Measure user preference for immersive experience.

### Search & Filter Events

#### `search`
Triggered when user searches for games.

**Data Layer:**
```javascript
{
  event: 'search',
  search_data: {
    query: 'racing',             // Search query
    results_count: 24,           // Number of results
    has_results: true,           // Whether results were found
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Understand what users are looking for, identify content gaps.

#### `category_filter`
Triggered when user filters by category.

**Data Layer:**
```javascript
{
  event: 'category_filter',
  filter_data: {
    category: 'racing',          // Selected category
    games_count: 45,             // Number of games in category
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Identify popular categories, optimize category organization.

### Engagement Events

#### `favorites_view`
Triggered when user views favorites page.

**Data Layer:**
```javascript
{
  event: 'favorites_view',
  engagement_data: {
    favorites_count: 8,          // Number of favorite games
    has_favorites: true,         // Whether user has any favorites
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Measure user investment, identify power users.

#### `recent_view`
Triggered when user views recently played page.

**Data Layer:**
```javascript
{
  event: 'recent_view',
  engagement_data: {
    recent_count: 12,            // Number of recent games
    has_recent: true,            // Whether user has played any games
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

### UI Interaction Events

#### `mobile_menu_toggle`
Triggered when mobile menu is opened/closed.

**Data Layer:**
```javascript
{
  event: 'mobile_menu_toggle',
  ui_data: {
    action: 'open',  // 'open' or 'close'
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Track mobile user behavior.

#### `carousel_navigation`
Triggered when user navigates game carousels.

**Data Layer:**
```javascript
{
  event: 'carousel_navigation',
  ui_data: {
    category: 'racing',          // Category being browsed
    direction: 'next',           // 'next' or 'prev'
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Measure content discovery, optimize carousel UX.

### Error Events

#### `error`
Triggered when errors occur (e.g., game loading failure).

**Data Layer:**
```javascript
{
  event: 'error',
  error_data: {
    type: 'games_load_error',    // Error type
    message: 'Failed to load games',  // Error message
    context: {                   // Additional context
      source: 'games.json'
    },
    page: '/favorites',          // Current page
    timestamp: '2025-10-17T14:30:00.000Z'
  }
}
```

**Business Use:** Monitor site health, identify technical issues.

---

## GTM Setup Guide

### 1. Access Google Tag Manager

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Sign in with your Google account
3. Access container `GTM-PK768FJP`

### 2. Verify Installation

1. Click "Preview" in GTM
2. Enter your website URL
3. Navigate through the site
4. Verify events appear in the GTM debugger

### 3. Set Up Triggers

For each event type, create a Custom Event trigger:

**Example: Game Play Trigger**
- Trigger Type: Custom Event
- Event Name: `game_play`
- This trigger fires on: All Custom Events

Repeat for all event types listed above.

---

## Google Analytics 4 Configuration

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 Property
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Add GA4 Tag in GTM

1. In GTM, create a new Tag
2. Tag Type: Google Analytics: GA4 Configuration
3. Measurement ID: Your `G-XXXXXXXXXX`
4. Trigger: All Pages

### 3. Create Event Tags

For each tracked event, create a GA4 Event tag:

**Example: Game Play Event**
- Tag Type: Google Analytics: GA4 Event
- Configuration Tag: (Select your GA4 Config tag)
- Event Name: `game_play`
- Event Parameters:
  - `game_id`: `{{DLV - game_data.game_id}}`
  - `game_name`: `{{DLV - game_data.game_name}}`
  - `game_category`: `{{DLV - game_data.category}}`
- Trigger: Custom Event - game_play

### 4. Set Up Data Layer Variables

Create Data Layer Variables for each parameter:

1. Variable Type: Data Layer Variable
2. Data Layer Variable Name: `game_data.game_id`
3. Repeat for all parameters

---

## Data Layer Reference

### Accessing the Data Layer

```javascript
// View all events
console.log(window.dataLayer);

// Push custom event
window.Analytics.trackCustomEvent('custom_event_name', {
  custom_param: 'value'
});
```

### Data Layer Structure

All events follow this structure:

```javascript
{
  event: 'event_name',     // Event identifier
  [category]_data: {       // Data object (named by category)
    // Event-specific parameters
    timestamp: 'ISO 8601'  // Always included
  }
}
```

### Available Analytics Methods

```javascript
// Session tracking
window.Analytics.trackSessionEnd()

// Page tracking
window.Analytics.trackPageView(path, title)

// Game tracking
window.Analytics.trackGamePlay(game)
window.Analytics.trackGameClose(game)
window.Analytics.trackGameClick(game, position)
window.Analytics.trackGameFavorite(game, isFavorited)
window.Analytics.trackGameFullscreen(game, isFullscreen)

// Search & filter
window.Analytics.trackSearch(query, resultsCount)
window.Analytics.trackCategoryFilter(category, gamesCount)

// Engagement
window.Analytics.trackFavoritesView(favoritesCount)
window.Analytics.trackRecentView(recentCount)

// UI interactions
window.Analytics.trackMobileMenu(isOpen)
window.Analytics.trackCarouselNavigation(category, direction)

// Error tracking
window.Analytics.trackError(errorType, errorMessage, context)

// Custom events
window.Analytics.trackCustomEvent(eventName, eventData)

// User properties
window.Analytics.setUserProperties(properties)
```

---

## Key Metrics & Reports

### Recommended GA4 Reports

#### 1. Game Performance Dashboard
- **Metric:** Game plays, play duration, favorite rate
- **Dimension:** Game name, category
- **Use:** Identify top-performing games, optimize game catalog

#### 2. User Engagement Report
- **Metric:** Session duration, pages per session, games per session
- **Dimension:** Device type, traffic source
- **Use:** Understand user behavior patterns

#### 3. Category Analysis
- **Metric:** Category views, games played per category
- **Dimension:** Category name
- **Use:** Optimize category organization and content strategy

#### 4. Search Insights
- **Metric:** Search queries, search results count
- **Dimension:** Search query, has_results
- **Use:** Identify content gaps, improve search

#### 5. Mobile Experience
- **Metric:** Mobile menu usage, mobile games played
- **Dimension:** Device category
- **Use:** Optimize mobile experience

### Custom Metrics

Create these custom metrics in GA4:

1. **Average Play Duration** = Total play duration / Game plays
2. **Favorite Rate** = Favorites added / Game plays
3. **Games Per Session** = Total games played / Sessions
4. **Search Success Rate** = Searches with results / Total searches

---

## Business Intelligence

### Key Business Questions Answered

1. **What are our most popular games?**
   - Track: `game_play` events
   - Group by: `game_name`, `game_category`

2. **How long do users engage with games?**
   - Track: `game_close` events
   - Measure: `play_duration_seconds`

3. **What are users searching for?**
   - Track: `search` events
   - Analyze: `query`, `results_count`

4. **Which categories drive the most engagement?**
   - Track: `category_filter`, `game_play`
   - Measure: Games played per category

5. **Are users returning?**
   - Track: `session_start`
   - Measure: `visit_count`, `is_returning`

6. **How do users discover games?**
   - Track: `carousel_navigation`, `search`, `category_filter`
   - Measure: Path to game play

7. **What's our user retention?**
   - Track: `session_start`, `favorites_view`, `recent_view`
   - Measure: Returning users, favorite adoption

### Revenue Opportunities

With this analytics data, you can:

1. **Optimize game placement** based on click-through rates
2. **Negotiate with game providers** using engagement data
3. **Identify premium game opportunities** from favorite rates
4. **Improve ad targeting** with category preferences
5. **Reduce churn** by understanding drop-off points

---

## Troubleshooting

### Events Not Firing

1. Check browser console for `[Analytics]` messages
2. Verify `window.dataLayer` exists
3. Check GTM is loaded (look for GTM container in Network tab)
4. Use GTM Preview Mode to debug

### Events Firing But Not in GA4

1. Verify GA4 tags are configured in GTM
2. Check triggers are set correctly
3. Use GA4 DebugView (enable with `?debug_mode=true`)
4. Ensure Measurement ID is correct

### Data Layer Variables Not Populating

1. Check variable naming in GTM matches data layer structure
2. Verify events are pushing data correctly (console.log)
3. Test with GTM Preview Mode
4. Check for typos in variable names

### Session Tracking Issues

1. Check localStorage is enabled
2. Verify `beforeunload` event fires (test with console.log)
3. Check browser doesn't block localStorage

---

## Support

For technical questions about the analytics implementation:
- Check browser console for error messages
- Review GTM Preview Mode for event firing
- Test with GA4 DebugView for real-time validation

For business questions about metrics:
- Review the Key Metrics & Reports section
- Explore GA4's built-in reporting features
- Create custom reports based on your specific needs

---

## Version History

- **v1.0** (2025-10-17) - Initial implementation
  - GTM integration (GTM-PK768FJP)
  - Comprehensive event tracking
  - Session management
  - Business metrics tracking
