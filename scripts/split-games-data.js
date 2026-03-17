#!/usr/bin/env node

/**
 * Split games.json into category-specific chunks
 * This dramatically improves load performance by allowing on-demand category loading
 *
 * Usage: node scripts/split-games-data.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting games data splitting process...\n');

// File paths
const GAMES_JSON_PATH = path.join(__dirname, '../games.json');
const OUTPUT_DIR = path.join(__dirname, '../data');
const OUTPUT_ALL_PATH = path.join(OUTPUT_DIR, 'all-games.json');
const OUTPUT_FEATURED_PATH = path.join(OUTPUT_DIR, 'featured-games.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✅ Created /data directory');
}

// Load games.json
console.log('📖 Reading games.json...');
let gamesData;
try {
    const rawData = fs.readFileSync(GAMES_JSON_PATH, 'utf8');
    gamesData = JSON.parse(rawData);
    console.log(`✅ Loaded games.json (${(rawData.length / 1024 / 1024).toFixed(2)} MB)`);
} catch (error) {
    console.error('❌ Error reading games.json:', error.message);
    process.exit(1);
}

// Extract all games from segments
const allGames = [];
if (gamesData.segments && Array.isArray(gamesData.segments)) {
    gamesData.segments.forEach(segment => {
        if (segment.hits && Array.isArray(segment.hits)) {
            allGames.push(...segment.hits);
        }
    });
}

console.log(`✅ Found ${allGames.length} total games\n`);

// Group games by genre/category
const categoryMap = {};
const genreCounts = {};

allGames.forEach(game => {
    if (game.genres && Array.isArray(game.genres)) {
        game.genres.forEach(genre => {
            const normalizedGenre = genre.toLowerCase().trim();

            // Initialize category if it doesn't exist
            if (!categoryMap[normalizedGenre]) {
                categoryMap[normalizedGenre] = [];
                genreCounts[normalizedGenre] = 0;
            }

            // Add game to category (avoid duplicates within same category)
            const gameExists = categoryMap[normalizedGenre].some(g => g.id === game.id);
            if (!gameExists) {
                categoryMap[normalizedGenre].push(game);
                genreCounts[normalizedGenre]++;
            }
        });
    }
});

// Sort categories by game count (descending)
const sortedCategories = Object.keys(categoryMap).sort((a, b) =>
    genreCounts[b] - genreCounts[a]
);

console.log('📊 Category Distribution:');
console.log('━'.repeat(60));
sortedCategories.forEach(category => {
    const count = genreCounts[category];
    const percentage = ((count / allGames.length) * 100).toFixed(1);
    console.log(`  ${category.padEnd(20)} ${count.toString().padStart(4)} games (${percentage}%)`);
});
console.log('━'.repeat(60));
console.log(`  Total unique categories: ${sortedCategories.length}\n`);

// Write category-specific files
console.log('💾 Writing category files...');
let totalSize = 0;
const categoryFiles = [];

sortedCategories.forEach(category => {
    const games = categoryMap[category];
    const filename = `${category}-games.json`;
    const filepath = path.join(OUTPUT_DIR, filename);

    const categoryData = {
        category: category,
        count: games.length,
        games: games
    };

    const jsonContent = JSON.stringify(categoryData, null, 2);
    fs.writeFileSync(filepath, jsonContent, 'utf8');

    const fileSize = jsonContent.length;
    totalSize += fileSize;

    categoryFiles.push({
        filename,
        category,
        count: games.length,
        size: fileSize
    });

    console.log(`  ✅ ${filename.padEnd(30)} ${games.length.toString().padStart(4)} games (${(fileSize / 1024).toFixed(1)} KB)`);
});

// Write "all games" file (simplified version without full data, just for reference)
const allGamesSimplified = allGames.map(game => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    genres: game.genres,
    images: game.images ? [game.images[0]] : []
}));

const allGamesData = {
    count: allGames.length,
    games: allGamesSimplified
};

fs.writeFileSync(OUTPUT_ALL_PATH, JSON.stringify(allGamesData, null, 2), 'utf8');
const allGamesSize = JSON.stringify(allGamesData).length;
console.log(`  ✅ ${'all-games.json'.padEnd(30)} ${allGames.length.toString().padStart(4)} games (${(allGamesSize / 1024).toFixed(1)} KB)`);
totalSize += allGamesSize;

// Create featured games file (first 50 games from main list)
const featuredGames = allGames.slice(0, 50);
const featuredData = {
    category: 'featured',
    count: featuredGames.length,
    games: featuredGames
};

fs.writeFileSync(OUTPUT_FEATURED_PATH, JSON.stringify(featuredData, null, 2), 'utf8');
const featuredSize = JSON.stringify(featuredData).length;
console.log(`  ✅ ${'featured-games.json'.padEnd(30)} ${featuredGames.length.toString().padStart(4)} games (${(featuredSize / 1024).toFixed(1)} KB)`);
totalSize += featuredSize;

// Generate category index file
const categoryIndex = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalGames: allGames.length,
    totalCategories: sortedCategories.length,
    categories: categoryFiles.map(file => ({
        slug: file.category,
        name: file.category.charAt(0).toUpperCase() + file.category.slice(1),
        filename: file.filename,
        count: file.count,
        size: file.size
    }))
};

const indexPath = path.join(OUTPUT_DIR, 'categories-index.json');
fs.writeFileSync(indexPath, JSON.stringify(categoryIndex, null, 2), 'utf8');
console.log(`  ✅ ${'categories-index.json'.padEnd(30)} index file (${(JSON.stringify(categoryIndex).length / 1024).toFixed(1)} KB)`);

// Summary
console.log('\n📈 Summary:');
console.log('━'.repeat(60));
console.log(`  Total games:           ${allGames.length}`);
console.log(`  Categories created:    ${sortedCategories.length + 2} (categories + featured + all)`);
console.log(`  Original file size:    ${(fs.statSync(GAMES_JSON_PATH).size / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Total chunked size:    ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Average category size: ${(totalSize / (sortedCategories.length + 2) / 1024).toFixed(1)} KB`);
console.log(`  Largest category:      ${categoryFiles[0].category} (${(categoryFiles[0].size / 1024).toFixed(1)} KB)`);
console.log(`  Smallest category:     ${categoryFiles[categoryFiles.length - 1].category} (${(categoryFiles[categoryFiles.length - 1].size / 1024).toFixed(1)} KB)`);
console.log('━'.repeat(60));

// Performance estimate
const originalSize = fs.statSync(GAMES_JSON_PATH).size;
const avgChunkSize = totalSize / (sortedCategories.length + 2);
const loadReduction = ((1 - (avgChunkSize / originalSize)) * 100).toFixed(1);

console.log('\n🚀 Performance Impact:');
console.log('━'.repeat(60));
console.log(`  Original load:         ${(originalSize / 1024 / 1024).toFixed(2)} MB per page`);
console.log(`  New avg load:          ${(avgChunkSize / 1024).toFixed(1)} KB per category`);
console.log(`  Load reduction:        ${loadReduction}% faster 🎉`);
console.log('━'.repeat(60));

console.log('\n✅ Data splitting complete!');
console.log(`📁 Category files saved to: ${OUTPUT_DIR}`);
console.log('\n💡 Next steps:');
console.log('  1. Update games.js to load category chunks on-demand');
console.log('  2. Update service worker to cache category files');
console.log('  3. Test category loading in development');
console.log('  4. Deploy to GitHub Pages\n');
