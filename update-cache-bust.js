#!/usr/bin/env node

/**
 * Cache Busting Utility
 * Updates version parameters in index.html to force cache refresh
 * Run this script whenever you update CSS or JS files
 */

const fs = require('fs');
const path = require('path');

const indexHtmlPath = path.join(__dirname, 'index.html');
const timestamp = Date.now();

console.log('🔄 Updating cache busting parameters...');

try {
    // Read the current index.html
    let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Update CSS cache buster
    htmlContent = htmlContent.replace(
        /styles\.css\?v=\d+/g,
        `styles.css?v=${timestamp}`
    );
    
    // Update JS cache busters
    htmlContent = htmlContent.replace(
        /script\.js\?v=\d+/g,
        `script.js?v=${timestamp}`
    );
    
    htmlContent = htmlContent.replace(
        /terminal\.js\?v=\d+/g,
        `terminal.js?v=${timestamp}`
    );
    
    // Write the updated content back
    fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
    
    console.log('✅ Cache busting updated successfully!');
    console.log(`📝 New version: ${timestamp}`);
    console.log('🌐 Files updated:');
    console.log('   - styles.css');
    console.log('   - script.js');
    console.log('   - terminal.js');
    
} catch (error) {
    console.error('❌ Error updating cache busting:', error.message);
    process.exit(1);
}