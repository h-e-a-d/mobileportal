#!/usr/bin/env node

/**
 * Meta Tags Generator Script
 * Generates optimized meta tags for all 706 games
 *
 * Usage:
 *   node scripts/generate-meta-tags.js
 *   node scripts/generate-meta-tags.js --output ./meta-output.json
 *   node scripts/generate-meta-tags.js --format html
 *
 * Output:
 *   - meta-tags.json: JSON file with all meta packages
 *   - meta-tags-stats.json: Statistics about generation
 */

const fs = require('fs');
const path = require('path');

// ===================================================
// CONFIGURATION
// ===================================================

const CONFIG = {
  INPUT_FILE: path.join(__dirname, '../games.json'),
  OUTPUT_DIR: path.join(__dirname, '../build/meta-tags'),
  OUTPUT_JSON: path.join(__dirname, '../build/meta-tags.json'),
  OUTPUT_STATS: path.join(__dirname, '../build/meta-tags-stats.json'),
  FORMAT: 'json', // 'json', 'html', 'csv'
  VERBOSE: true
};

// ===================================================
// META TAG GENERATOR CLASS
// ===================================================

class MetaTagGenerator {
  constructor(games) {
    this.games = games;
    this.stats = {
      totalGames: games.length,
      successCount: 0,
      truncatedTitles: 0,
      truncatedDescriptions: 0,
      errors: [],
      startTime: Date.now()
    };

    this.genreDescriptions = {
      action: 'fast-paced action',
      puzzle: 'challenging puzzles',
      racing: 'high-speed racing',
      sports: 'competitive sports',
      girls: 'creative styling',
      'dress-up': 'fashion customization',
      'make-up': 'beauty and makeup',
      kids: 'fun gameplay for kids',
      skill: 'skill-based challenges',
      ragdoll: 'physics-based ragdoll',
      physics: 'physics simulation',
      decoration: 'creative decoration',
      cozy: 'relaxing gameplay',
      mini: 'quick mini games'
    };

    this.actionVerbs = {
      action: 'Experience',
      puzzle: 'Solve',
      racing: 'Race',
      sports: 'Compete',
      girls: 'Unleash',
      kids: 'Discover',
      skill: 'Master',
      physics: 'Explore'
    };
  }

  /**
   * Generate optimized title tag (55-60 characters)
   */
  generateTitle(game) {
    const titleBase = `${game.title} - Play Online Free | Kloopik`;

    if (titleBase.length <= 60) {
      return {
        title: titleBase,
        length: titleBase.length,
        truncated: false
      };
    }

    const titleAlt = `${game.title} - Play Free | Kloopik`;
    if (titleAlt.length <= 60) {
      return {
        title: titleAlt,
        length: titleAlt.length,
        truncated: false
      };
    }

    const maxChars = 55;
    const truncated = game.title.substring(0, maxChars - 10) + '... | Kloopik';
    return {
      title: truncated.substring(0, 60),
      length: Math.min(truncated.length, 60),
      truncated: true,
      originalLength: titleBase.length
    };
  }

  /**
   * Generate meta description (150-160 characters)
   */
  generateDescription(game) {
    const primaryGenre = (game.genres?.[0] || 'casual').toLowerCase();
    const actionVerb = this.actionVerbs[primaryGenre] || 'Play';
    const genreDescription = this.genreDescriptions[primaryGenre] || 'free online game';

    let description = '';

    if (['action', 'skill'].includes(primaryGenre)) {
      description = `${actionVerb} ${game.title}. Experience ${genreDescription}. Compete online, unlock rewards. Free browser game now.`;
    } else if (primaryGenre === 'puzzle') {
      description = `${game.title} - ${genreDescription}. Train your brain with unique gameplay and increasing difficulty. Play free today.`;
    } else if (['racing', 'sports'].includes(primaryGenre)) {
      description = `${actionVerb} in ${game.title}. ${genreDescription} with opponents online. Unlock vehicles and tracks. Play free now.`;
    } else if (['girls', 'dress-up', 'make-up'].includes(primaryGenre)) {
      description = `${game.title}. ${actionVerb} your creativity with ${genreDescription}. Endless combinations, unique stories. Play free now.`;
    } else if (primaryGenre === 'kids') {
      description = `${game.title}. Safe, fun ${genreDescription} for all ages. Educational, entertaining, and addictive. Play free today.`;
    } else {
      description = `Play ${game.title} online. ${actionVerb} ${genreDescription}. Addictive gameplay. Free browser game now.`;
    }

    // Clean whitespace
    description = description.replace(/\s+/g, ' ').trim();

    // Trim to 160 chars
    let finalDescription = description;
    const truncated = description.length > 160;
    if (truncated) {
      finalDescription = description.substring(0, 157) + '...';
    }

    return {
      description: finalDescription,
      length: finalDescription.length,
      truncated
    };
  }

  /**
   * Generate Twitter description (120 chars max)
   */
  generateTwitterDescription(game) {
    const primaryGenre = (game.genres?.[0] || 'casual').toLowerCase();
    const base = `Play ${game.title} free. ${this.genreDescriptions[primaryGenre]}. No download.`;

    if (base.length <= 120) {
      return {
        description: base,
        length: base.length,
        truncated: false
      };
    }

    const truncated = base.substring(0, 117) + '...';
    return {
      description: truncated,
      length: truncated.length,
      truncated: true
    };
  }

  /**
   * Generate complete meta package
   */
  generateMetaPackage(game, baseUrl = 'https://kloopik.com') {
    try {
      const title = this.generateTitle(game);
      const description = this.generateDescription(game);
      const twitterDescription = this.generateTwitterDescription(game);
      const primaryGenre = game.genres?.[0] || 'Games';

      if (title.truncated) this.stats.truncatedTitles++;
      if (description.truncated) this.stats.truncatedDescriptions++;

      this.stats.successCount++;

      return {
        slug: game.slug,
        title: game.title,
        meta: {
          title: title.title,
          description: description.description,
          keywords: this.generateKeywords(game),
          canonical: `${baseUrl}/catalog/${game.slug}/`
        },
        openGraph: {
          type: 'website',
          url: `${baseUrl}/catalog/${game.slug}/`,
          title: title.title,
          description: description.description,
          image: game.images?.[0] || `${baseUrl}/images/games/${game.slug}/og-image.jpg`,
          imageWidth: 1200,
          imageHeight: 630,
          imageAlt: `${game.title} Screenshot`,
          siteName: 'Kloopik',
          locale: 'en_US'
        },
        twitterCard: {
          card: 'summary_large_image',
          site: '@kloopik',
          title: title.title,
          description: twitterDescription.description,
          image: game.images?.[0] || `${baseUrl}/images/games/${game.slug}/twitter-card.jpg`,
          imageAlt: `${game.title} Gameplay`,
          creator: '@kloopik'
        },
        schema: {
          videoGame: this.generateVideoGameSchema(game, baseUrl),
          breadcrumb: this.generateBreadcrumbSchema(game, baseUrl)
        },
        stats: {
          titleTruncated: title.truncated,
          titleLength: title.length,
          descriptionTruncated: description.truncated,
          descriptionLength: description.length
        }
      };
    } catch (error) {
      this.stats.errors.push({
        gameSlug: game.slug,
        error: error.message,
        stack: error.stack
      });
      return null;
    }
  }

  /**
   * Generate keywords
   */
  generateKeywords(game) {
    const baseKeywords = [
      game.title,
      `play ${game.title} online`,
      'free browser game',
      ...(game.genres || []).slice(0, 3)
    ];

    const uniqueKeywords = [...new Set(
      baseKeywords
        .map(k => k.toLowerCase())
        .filter(k => k.length > 2)
    )];

    return uniqueKeywords.join(', ');
  }

  /**
   * Generate VideoGame Schema
   */
  generateVideoGameSchema(game, baseUrl) {
    return {
      '@context': 'https://schema.org/',
      '@type': 'VideoGame',
      name: game.title,
      url: `${baseUrl}/catalog/${game.slug}/`,
      description: game.description?.substring(0, 500) || game.title,
      image: game.images?.[0] || `${baseUrl}/images/games/${game.slug}/og-image.jpg`,
      operatingSystem: ['Windows', 'macOS', 'iOS', 'Android', 'Web'],
      applicationCategory: 'Game',
      genre: game.genres || ['Game'],
      publisher: {
        '@type': 'Organization',
        name: 'Kloopik',
        url: baseUrl
      },
      inLanguage: 'en-US',
      isAccessibleForFree: true
    };
  }

  /**
   * Generate Breadcrumb Schema
   */
  generateBreadcrumbSchema(game, baseUrl) {
    const primaryGenre = game.genres?.[0] || 'Games';
    const primaryGenreSlug = primaryGenre.toLowerCase().replace(/\s+/g, '-');

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: primaryGenre,
          item: `${baseUrl}/catalog/${primaryGenreSlug}/`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: game.title,
          item: `${baseUrl}/catalog/${game.slug}/`
        }
      ]
    };
  }

  /**
   * Generate all meta tags
   */
  generateAll(baseUrl = 'https://kloopik.com') {
    const metaPackages = [];

    for (const game of this.games) {
      const metaPackage = this.generateMetaPackage(game, baseUrl);
      if (metaPackage) {
        metaPackages.push(metaPackage);
      }
    }

    this.stats.endTime = Date.now();
    this.stats.duration = (this.stats.endTime - this.stats.startTime) / 1000;
    this.stats.successRate = ((this.stats.successCount / this.stats.totalGames) * 100).toFixed(2);

    return {
      metaPackages,
      stats: this.stats
    };
  }
}

// ===================================================
// MAIN EXECUTION
// ===================================================

async function main() {
  try {
    log('Meta Tag Generator', '='.repeat(50));
    log(`Input: ${CONFIG.INPUT_FILE}`);
    log(`Output: ${CONFIG.OUTPUT_JSON}`);
    log('');

    // Load games data
    log('Loading games data...');
    if (!fs.existsSync(CONFIG.INPUT_FILE)) {
      throw new Error(`Games file not found: ${CONFIG.INPUT_FILE}`);
    }

    const gamesData = JSON.parse(fs.readFileSync(CONFIG.INPUT_FILE, 'utf-8'));
    const games = gamesData.segments?.[0]?.hits || [];

    log(`Loaded ${games.length} games`);
    log('');

    // Generate meta tags
    log('Generating meta tags...');
    const generator = new MetaTagGenerator(games);
    const result = generator.generateAll();

    // Create output directory
    if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
      fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
    }

    // Save meta tags JSON
    log('Saving meta tags...');
    fs.writeFileSync(
      CONFIG.OUTPUT_JSON,
      JSON.stringify(result.metaPackages, null, 2)
    );

    // Save statistics
    log('Saving statistics...');
    fs.writeFileSync(
      CONFIG.OUTPUT_STATS,
      JSON.stringify(result.stats, null, 2)
    );

    // Print statistics
    log('');
    log('STATISTICS', '='.repeat(50));
    log(`Total Games: ${result.stats.totalGames}`);
    log(`Success: ${result.stats.successCount}/${result.stats.totalGames} (${result.stats.successRate}%)`);
    log(`Truncated Titles: ${result.stats.truncatedTitles}`);
    log(`Truncated Descriptions: ${result.stats.truncatedDescriptions}`);
    log(`Duration: ${result.stats.duration.toFixed(2)}s`);

    if (result.stats.errors.length > 0) {
      log('');
      log('ERRORS:', '='.repeat(50));
      result.stats.errors.forEach(err => {
        log(`${err.gameSlug}: ${err.error}`);
      });
    }

    log('');
    log('SUCCESS: Meta tags generated!');
    log(`Output: ${CONFIG.OUTPUT_JSON}`);

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

// ===================================================
// UTILITIES
// ===================================================

function log(...messages) {
  if (CONFIG.VERBOSE) {
    console.log(...messages);
  }
}

// Run
main();
