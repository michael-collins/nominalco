# Cache Busting Guide

This project includes cache busting to ensure users get the latest version of CSS and JavaScript files when updates are made.

## How It Works

Cache busting adds version parameters (timestamps) to file URLs:
- `styles.css?v=1730914800000`
- `script.js?v=1730914800000`
- `terminal.js?v=1730914800000`

When the version number changes, browsers treat it as a new file and download the latest version instead of using cached versions.

## When to Update Cache Busting

Update the cache busting parameters whenever you modify:
- **CSS files** (`styles.css`, `styles2.css`)
- **JavaScript files** (`script.js`, `terminal.js`)
- **HTML files** (if they contain cached resources)

## How to Update

### Option 1: Automatic Script (Recommended)
```bash
# Using Node.js script
node update-cache-bust.js

# Or using shell script
./update-cache-bust.sh
```

### Option 2: Manual Update
1. Generate a new timestamp: `date +%s`000
2. Replace the version numbers in `index.html`
3. Update all three file references

## Scripts Included

- **`update-cache-bust.js`** - Node.js script for cross-platform compatibility
- **`update-cache-bust.sh`** - Shell script for Unix/Linux/macOS

Both scripts:
- Generate a new timestamp
- Update all cache busting parameters in `index.html`
- Create a backup of the original file
- Provide confirmation of changes

## Development Workflow

1. Make changes to CSS/JS files
2. Run cache busting script: `node update-cache-bust.js`
3. Test your changes
4. Deploy to production

## Notes

- The scripts automatically backup `index.html` before making changes
- Version numbers are Unix timestamps in milliseconds for uniqueness
- Both scripts produce the same result - choose based on your preference
- Cache busting only affects production deployments, not local development