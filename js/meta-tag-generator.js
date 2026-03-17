/**
 * Meta Tag Generator for Game Pages
 * Generates optimized meta tags for 706 games
 * Usage: npm run generate:meta-tags
 *
 * This script reads games.json and generates:
 * - Optimized title tags (55-60 chars)
 * - Meta descriptions (150-160 chars)
 * - Open Graph tags
 * - Twitter Card tags
 * - Schema.org structured data
 */

class MetaTagGenerator {
  constructor(games) {
    this.games = games;
    this.genreDescriptions = {
      'action': 'fast-paced action',
      'puzzle': 'challenging puzzles',
      'racing': 'high-speed racing',
      'sports': 'competitive sports',
      'girls': 'creative styling',
      'dress-up': 'fashion customization',
      'make-up': 'beauty and makeup',
      'kids': 'fun gameplay for kids',
      'skill': 'skill-based challenges',
      'ragdoll': 'physics-based ragdoll',
      'physics': 'physics simulation',
      'decoration': 'creative decoration',
      'cozy': 'relaxing gameplay',
      'mini': 'quick mini games'
    };

    this.actionVerbs = {
      'action': 'Experience',
      'puzzle': 'Solve',
      'racing': 'Race',
      'sports': 'Compete',
      'girls': 'Unleash',
      'kids': 'Discover',
      'skill': 'Master',
      'physics': 'Explore'
    };
  }

  /**
   * Generate optimized title tag (55-60 characters)
   * Formula: [Game Title] - Play Online Free | Kloopik
   * Truncates intelligently if exceeds 60 chars
   */
  generateTitle(game) {
    const titleBase = `${game.title} - Play Online Free | Kloopik`;

    // If within optimal range, return as-is
    if (titleBase.length <= 60) {
      return {
        title: titleBase,
        length: titleBase.length,
        truncated: false
      };
    }

    // If too long, try alternative format
    const titleAlt = `${game.title} - Play Free | Kloopik`;
    if (titleAlt.length <= 60) {
      return {
        title: titleAlt,
        length: titleAlt.length,
        truncated: false
      };
    }

    // If still too long, truncate intelligently
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
   * Generate compelling meta description (150-160 characters)
   * Dynamic based on primary genre
   */
  generateDescription(game) {
    const primaryGenre = game.genres[0] || 'casual';
    const actionVerb = this.actionVerbs[primaryGenre] || 'Play';
    const genreDescription = this.genreDescriptions[primaryGenre] || 'free online game';

    // Extract first 2 genres for variety
    const genres = game.genres.slice(0, 2).join(', ').toLowerCase();

    // Build description with various templates
    let description = '';

    if (primaryGenre === 'action' || primaryGenre === 'skill') {
      description = `${actionVerb} ${game.title}. Experience ${genreDescription}.
      Compete online, unlock rewards. Free browser game now.`;
    } else if (primaryGenre === 'puzzle') {
      description = `${game.title} - ${genreDescription}. Train your brain with unique
      gameplay and increasing difficulty. Play free online today.`;
    } else if (primaryGenre === 'racing' || primaryGenre === 'sports') {
      description = `${actionVerb} in ${game.title}. ${genreDescription} with opponents
      online. Unlock vehicles and tracks. Play free now.`;
    } else if (primaryGenre === 'girls' || primaryGenre === 'dress-up') {
      description = `${game.title}. ${actionVerb} your creativity with ${genreDescription}.
      Endless combinations, unique stories. Play free online now.`;
    } else if (primaryGenre === 'kids') {
      description = `${game.title}. Safe, fun ${genreDescription} for all ages.
      Educational and entertaining. Play free online today.`;
    } else {
      description = `Play ${game.title} online. ${actionVerb} ${genreDescription}.
      Addictive gameplay with ${genres}. Free browser game now.`;
    }

    // Clean up whitespace
    description = description.replace(/\s+/g, ' ').trim();

    // Trim to 160 chars if needed
    let finalDescription = description;
    if (description.length > 160) {
      finalDescription = description.substring(0, 157) + '...';
    }

    return {
      description: finalDescription,
      length: finalDescription.length,
      truncated: description.length > 160
    };
  }

  /**
   * Generate Twitter-optimized description (120 characters max)
   * More concise than meta description
   */
  generateTwitterDescription(game) {
    const primaryGenre = game.genres[0] || 'casual';
    const base = `Play ${game.title} free. ${this.genreDescriptions[primaryGenre]}. No download needed.`;

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
   * Generate keywords meta tag
   * Primary game title + genres + game-type keywords
   */
  generateKeywords(game) {
    const baseKeywords = [
      game.title,
      `play ${game.title} online`,
      'free browser game',
      ...game.genres.slice(0, 3),
      ...game.tags.slice(0, 5)
    ];

    // Remove duplicates and filter
    const uniqueKeywords = [...new Set(
      baseKeywords
        .map(k => k.toLowerCase())
        .filter(k => k.length > 2)
    )];

    return {
      keywords: uniqueKeywords.join(', '),
      count: uniqueKeywords.length
    };
  }

  /**
   * Generate Open Graph tags object
   */
  generateOpenGraphTags(game, baseUrl = 'https://kloopik.com') {
    const title = this.generateTitle(game);
    const description = this.generateDescription(game);

    return {
      type: 'website',
      url: `${baseUrl}/catalog/${game.slug}/`,
      title: title.title,
      description: description.description,
      image: game.images[0] || `${baseUrl}/images/games/${game.slug}/og-image.jpg`,
      imageWidth: 1200,
      imageHeight: 630,
      imageAlt: `${game.title} Screenshot`,
      siteName: 'Kloopik',
      locale: 'en_US'
    };
  }

  /**
   * Generate Twitter Card tags object
   */
  generateTwitterCardTags(game, baseUrl = 'https://kloopik.com') {
    const title = this.generateTitle(game);
    const twitterDescription = this.generateTwitterDescription(game);

    return {
      card: 'summary_large_image',
      site: '@kloopik',
      title: title.title,
      description: twitterDescription.description,
      image: game.images[0] || `${baseUrl}/images/games/${game.slug}/twitter-card.jpg`,
      imageAlt: `${game.title} Gameplay`,
      creator: '@kloopik'
    };
  }

  /**
   * Generate Schema.org VideoGame JSON-LD
   */
  generateVideoGameSchema(game, baseUrl = 'https://kloopik.com') {
    const description = this.generateDescription(game);

    return {
      '@context': 'https://schema.org/',
      '@type': 'VideoGame',
      name: game.title,
      url: `${baseUrl}/catalog/${game.slug}/`,
      description: game.description,
      image: {
        '@type': 'ImageObject',
        url: game.images[0] || `${baseUrl}/images/games/${game.slug}/og-image.jpg`,
        width: 1200,
        height: 630
      },
      operatingSystem: ['Windows', 'macOS', 'iOS', 'Android', 'Web'],
      applicationCategory: 'Game',
      gamePlayMode: game.mobileReady?.includes('multiplayer') ?
        ['MultiPlayer', 'SinglePlayer'] : ['SinglePlayer'],
      genre: game.genres,
      author: {
        '@type': 'Organization',
        name: 'Kloopik'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Kloopik',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 250,
          height: 60
        },
        url: baseUrl
      },
      inLanguage: 'en-US',
      isAccessibleForFree: true,
      potentialAction: {
        '@type': 'PlayAction',
        target: `${baseUrl}/catalog/${game.slug}/`
      }
    };
  }

  /**
   * Generate BreadcrumbList Schema JSON-LD
   */
  generateBreadcrumbSchema(game, baseUrl = 'https://kloopik.com') {
    const primaryGenre = game.genres[0] || 'games';
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
   * Generate complete meta tag package for a game
   */
  generateCompleteMetaPackage(game, baseUrl = 'https://kloopik.com') {
    return {
      // Basic meta tags
      title: this.generateTitle(game),
      description: this.generateDescription(game),
      keywords: this.generateKeywords(game),
      canonical: `${baseUrl}/catalog/${game.slug}/`,

      // Social media tags
      openGraph: this.generateOpenGraphTags(game, baseUrl),
      twitterCard: this.generateTwitterCardTags(game, baseUrl),

      // Structured data
      videoGameSchema: this.generateVideoGameSchema(game, baseUrl),
      breadcrumbSchema: this.generateBreadcrumbSchema(game, baseUrl),

      // Additional data
      game: {
        slug: game.slug,
        title: game.title,
        genres: game.genres,
        tags: game.tags
      }
    };
  }

  /**
   * Generate meta tags for all games and return summary
   */
  generateAllMetaTags(baseUrl = 'https://kloopik.com') {
    const results = [];
    const stats = {
      totalGames: 0,
      successCount: 0,
      truncatedTitles: 0,
      truncatedDescriptions: 0,
      errors: []
    };

    for (const game of this.games) {
      try {
        stats.totalGames++;
        const metaPackage = this.generateCompleteMetaPackage(game, baseUrl);

        if (metaPackage.title.truncated) stats.truncatedTitles++;
        if (metaPackage.description.truncated) stats.truncatedDescriptions++;

        results.push(metaPackage);
        stats.successCount++;
      } catch (error) {
        stats.errors.push({
          gameSlug: game.slug,
          error: error.message
        });
      }
    }

    return {
      metaPackages: results,
      stats: {
        ...stats,
        successRate: ((stats.successCount / stats.totalGames) * 100).toFixed(2) + '%'
      }
    };
  }

  /**
   * Export as JSON for use in build process
   */
  exportAsJSON(games, outputPath) {
    const allMetaTags = this.generateAllMetaTags();
    const jsonOutput = JSON.stringify(allMetaTags, null, 2);

    // Would write to file in Node.js environment
    return {
      outputPath,
      size: jsonOutput.length,
      gamesProcessed: allMetaTags.stats.successCount,
      preview: JSON.parse(jsonOutput).metaPackages.slice(0, 1)
    };
  }

  /**
   * Generate HTML meta tag strings for insertion
   */
  generateHTMLMetaTags(game, baseUrl = 'https://kloopik.com') {
    const metaPackage = this.generateCompleteMetaPackage(game, baseUrl);
    const og = metaPackage.openGraph;
    const tw = metaPackage.twitterCard;
    const title = metaPackage.title;
    const desc = metaPackage.description;

    return `
<!-- Title Tag -->
<title>${this.escapeHTML(title.title)}</title>

<!-- Meta Tags -->
<meta name="description" content="${this.escapeHTML(desc.description)}">
<meta name="keywords" content="${this.escapeHTML(metaPackage.keywords.keywords)}">
<link rel="canonical" href="${og.url}">

<!-- Open Graph Tags -->
<meta property="og:type" content="${og.type}">
<meta property="og:url" content="${og.url}">
<meta property="og:title" content="${this.escapeHTML(og.title)}">
<meta property="og:description" content="${this.escapeHTML(og.description)}">
<meta property="og:image" content="${og.image}">
<meta property="og:image:width" content="${og.imageWidth}">
<meta property="og:image:height" content="${og.imageHeight}">
<meta property="og:image:alt" content="${this.escapeHTML(og.imageAlt)}">
<meta property="og:site_name" content="${og.siteName}">
<meta property="og:locale" content="${og.locale}">

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="${tw.card}">
<meta name="twitter:site" content="${tw.site}">
<meta name="twitter:title" content="${this.escapeHTML(tw.title)}">
<meta name="twitter:description" content="${this.escapeHTML(tw.description)}">
<meta name="twitter:image" content="${tw.image}">
<meta name="twitter:image:alt" content="${this.escapeHTML(tw.imageAlt)}">
<meta name="twitter:creator" content="${tw.creator}">

<!-- Schema.org Structured Data -->
<script type="application/ld+json">
${JSON.stringify(metaPackage.videoGameSchema, null, 2)}
</script>

<script type="application/ld+json">
${JSON.stringify(metaPackage.breadcrumbSchema, null, 2)}
</script>
    `.trim();
  }

  /**
   * Escape HTML special characters
   */
  escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// Export for Node.js/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetaTagGenerator;
}

// ===================================================
// USAGE EXAMPLES
// ===================================================

/*

// Example 1: Single Game Meta Tags
const generator = new MetaTagGenerator(games);
const singleGame = games[0];
const metaPackage = generator.generateCompleteMetaPackage(singleGame);

console.log('Title:', metaPackage.title);
console.log('Description:', metaPackage.description);
console.log('Open Graph:', metaPackage.openGraph);
console.log('Twitter:', metaPackage.twitterCard);

// Example 2: All Games
const allMeta = generator.generateAllMetaTags();
console.log(`Generated meta tags for ${allMeta.stats.successCount}/${allMeta.stats.totalGames} games`);

// Example 3: HTML Output
const htmlMeta = generator.generateHTMLMetaTags(singleGame);
console.log(htmlMeta);

// Example 4: Export JSON
const exported = generator.exportAsJSON(games, './meta-tags-output.json');
console.log(`Exported to ${exported.outputPath}`);

*/
