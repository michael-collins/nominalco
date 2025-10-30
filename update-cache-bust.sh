#!/bin/bash

# Simple cache busting script using timestamp
# Updates version parameters in index.html

echo "🔄 Updating cache busting parameters..."

TIMESTAMP=$(date +%s)000  # Unix timestamp in milliseconds
INDEX_FILE="index.html"

# Check if index.html exists
if [ ! -f "$INDEX_FILE" ]; then
    echo "❌ Error: index.html not found!"
    exit 1
fi

# Create backup
cp "$INDEX_FILE" "${INDEX_FILE}.backup"

# Update cache busting parameters using sed
sed -i.tmp "s/styles\.css?v=[0-9]*/styles.css?v=${TIMESTAMP}/g" "$INDEX_FILE"
sed -i.tmp "s/script\.js?v=[0-9]*/script.js?v=${TIMESTAMP}/g" "$INDEX_FILE"  
sed -i.tmp "s/terminal\.js?v=[0-9]*/terminal.js?v=${TIMESTAMP}/g" "$INDEX_FILE"

# Clean up temporary file
rm "${INDEX_FILE}.tmp"

echo "✅ Cache busting updated successfully!"
echo "📝 New version: ${TIMESTAMP}"
echo "🌐 Files updated:"
echo "   - styles.css"
echo "   - script.js" 
echo "   - terminal.js"
echo ""
echo "💡 To use: ./update-cache-bust.sh"
echo "🔄 Or run: node update-cache-bust.js"