const markdownText = `Trail Mounts are products for the diy RV and van-life communities.

This design project tasked us to design a thoughtful interface between logistic track (L-track) fittings and 80/20 T-slot profiles. Existing L-track products are designed for utility, but aesthetics remain largely unconsidered.

## Process

- Analysis of existing product landscape
- Design explorations & prototyping
- Testing, iteration, and first article production

### Technical Requirements

The design needed to address several key constraints:

- Must be compatible with standard L-track systems
- Should integrate seamlessly with 80/20 profiles
- Requires tool-free installation`;

function convertMarkdownToHtml(markdownText) {
    if (!markdownText || markdownText.trim() === '') {
        return '';
    }

    // Clean and normalize the input
    let text = markdownText
        .replace(/\\n/g, '\n')  // Handle escaped newlines
        .replace(/\r\n/g, '\n') // Handle Windows line endings
        .replace(/\r/g, '\n')   // Handle Mac line endings
        .trim();

    // Split into blocks by double line breaks
    const blocks = text.split(/\n\s*\n/);
    const htmlBlocks = [];

    for (let block of blocks) {
        block = block.trim();
        if (!block) continue;

        const lines = block.split('\n').map(line => line.trim()).filter(line => line);
        
        // Process each line individually for markdown syntax
        const processedLines = [];
        
        for (let line of lines) {
            // Check for markdown headings (# ## ###)
            if (line.match(/^#{1,6}\s+/)) {
                const level = line.match(/^#+/)[0].length;
                const headingText = line.replace(/^#+\s*/, '').trim();
                processedLines.push(`<h${Math.min(level, 6)}>${headingText}</h${Math.min(level, 6)}>`);
            }
            // Check for list items (- or *)
            else if (line.match(/^[-*]\s+/)) {
                const listItem = line.replace(/^[-*]\s+/, '').trim();
                processedLines.push(`LIST_ITEM:${listItem}`);
            }
            // Regular text
            else {
                processedLines.push(`TEXT:${line}`);
            }
        }

        // Group consecutive list items and text lines
        let i = 0;
        while (i < processedLines.length) {
            const currentLine = processedLines[i];
            
            if (currentLine.startsWith('LIST_ITEM:')) {
                // Collect consecutive list items
                const listItems = [];
                while (i < processedLines.length && processedLines[i].startsWith('LIST_ITEM:')) {
                    listItems.push(processedLines[i].replace('LIST_ITEM:', ''));
                    i++;
                }
                htmlBlocks.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`);
            }
            else if (currentLine.startsWith('TEXT:')) {
                // Collect consecutive text lines into paragraphs
                const textLines = [];
                while (i < processedLines.length && processedLines[i].startsWith('TEXT:')) {
                    textLines.push(processedLines[i].replace('TEXT:', ''));
                    i++;
                }
                if (textLines.length > 0) {
                    htmlBlocks.push(`<p>${textLines.join(' ')}</p>`);
                }
            }
            else {
                // Already formatted heading
                htmlBlocks.push(currentLine);
                i++;
            }
        }
    }

    return htmlBlocks.join('');
}

console.log('Input:');
console.log(markdownText);
console.log('\nOutput HTML:');
console.log(convertMarkdownToHtml(markdownText));
