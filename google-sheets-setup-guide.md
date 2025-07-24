# Complete Google Sheets Setup Guide for nominalco

## Overview
Your nominalco portfolio site uses two Google Sheets tabs to manage all content dynamically. This eliminates hardcoded content and makes the site fully manageable through Google Sheets.

## Sheet Structure

### **Sheet 1: "Sheet1" (Projects)**
This sheet contains all your portfolio projects with enhanced case study information.

#### Required Columns (A-S):

| Column | Field Name | Description | Example |
|--------|------------|-------------|---------|
| A | **id** | Unique project identifier | 1, 2, 3... |
| B | **title** | Project name | "Modular Audio Interface" |
| C | **description** | Short project description (supports markdown) | "Hardware-software system for professional audio production with modular connectivity." |
| D | **image** | Main project image URL | Google Drive, Imgur, or direct image URL |
| E | **tags** | Comma-separated tags | "Hardware, Audio, Interface" |
| F | **detailImages** | Comma-separated additional image URLs | Multiple URLs for project gallery |
| G | **longDescription** | Detailed description (supports markdown) | Full project description with formatting |
| H | **year** | Project year | "2024" |
| I | **client** | Client name | "Audio Professionals Ltd." |
| J | **duration** | Project duration | "8 months" |
| K | **teamSize** | Team size | "5 engineers" |
| L | **role** | Your role in the project | "Lead Hardware Designer" |
| M | **challenge** | Project challenge description | "Designing a modular system that maintains signal integrity..." |
| N | **solution** | How you solved the challenge | "Created a proprietary connector system..." |
| O | **results** | Project outcomes and impact | "Successfully launched product with 40% faster setup times..." |
| P | **metrics** | Success metrics (format: "value label, value label") | "40% Faster Setup, 99.99% Signal Reliability, 15 Module Types" |
| Q | **category** | Primary project category | "Hardware Design", "Software Design", "Product Design" |
| R | **featured** | Whether to feature this project | "true" or "false" |
| S | **status** | Project status | "completed", "in-progress", "concept" |

#### Example Project Row:
```
1 | Modular Audio Interface | Hardware-software system for professional audio production... | https://drive.google.com/... | Hardware, Audio, Interface | https://imgur.com/..., https://imgur.com/... | Development of a modular audio interface system... | 2024 | Audio Professionals Ltd. | 8 months | 5 engineers | Lead Hardware Designer | Designing a modular system that maintains signal integrity... | Created a proprietary connector system... | Successfully launched product with 40% faster setup times... | 40% Faster Setup, 99.99% Signal Reliability, 15 Module Types | Hardware Design | true | completed
```

### **Sheet 2: "Content" (Site Content)**
This sheet contains all static site content including text, titles, and contact information.

#### Required Columns (A-B):

| Column | Field Name | Description |
|--------|------------|-------------|
| A | **key** | Content identifier |
| B | **value** | Content value |

#### Required Content Keys:

| Key | Description | Example Value |
|-----|-------------|---------------|
| `site.title` | Browser tab title | "nominalco" |
| `hero.title` | Main homepage title | "Multi-disciplinary art and design studio." |
| `hero.subtitle` | Homepage subtitle | "We design objects, interfaces, and ideas." |
| `work.title` | Work section title | "Selected Work" |
| `about.title` | About section title | "About nominalco" |
| `about.paragraph1` | First about paragraph | "nominalco is an art and design practice..." |
| `about.paragraph2` | Second about paragraph | "Our process is elastic..." |
| `about.paragraph3` | Third about paragraph (optional) | Additional content... |
| `contact.title` | Contact section title | "Contact" |
| `contact.email` | Contact email address | "hello@nominalco.com" |

#### Example Content Rows:
```
site.title | nominalco
hero.title | Multi-disciplinary art and design studio.
hero.subtitle | We design objects, interfaces, and ideas.
work.title | Selected Work
about.title | About nominalco
about.paragraph1 | nominalco is an art and design practice specializing in the development of functional, bold, and appealing artifacts, stories, and experiences.
about.paragraph2 | Our process is elastic. We adapt bespoke workflows to reveal compelling solutions for each of our projects.
contact.title | Contact
contact.email | hello@nominalco.com
```

## How to Set Up Your Google Sheets

### Step 1: Create a New Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "nominalco Portfolio Content"

### Step 2: Set Up Sheet 1 (Projects)
1. In the first tab (rename it to "Sheet1" if needed)
2. Add headers in row 1 exactly as shown above (A1=id, B1=title, etc.)
3. Add your project data starting from row 2
4. Make sure to follow the exact column order

### Step 3: Set Up Sheet 2 (Content)
1. Create a second tab and name it "Content"
2. Add headers: A1="key", B1="value"
3. Add all the content keys and values starting from row 2

### Step 4: Make the Sheet Public
1. Click "Share" in the top right
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Copy the sheet ID from the URL (the long string between `/d/` and `/edit`)

### Step 5: Update Your Site
Replace the `SHEET_ID` in your script.js file with your new sheet ID:
```javascript
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
```

## Image Guidelines

### Supported Image Services:
- **Google Drive** (recommended): Upload to Drive, make public, copy link
- **Imgur**: Free image hosting
- **Cloudinary**: Professional image hosting
- **Direct URLs**: Any publicly accessible image URL

### Google Drive Image Setup:
1. Upload image to Google Drive
2. Right-click → "Get link"
3. Change to "Anyone with the link can view"
4. Copy the URL (the script automatically converts it to direct link)

### Image Size Recommendations:
- **Main project images**: 1200x800px or similar aspect ratio
- **Detail images**: 1600x1200px for best quality
- **File format**: JPG or PNG
- **File size**: Under 2MB for fast loading

## Markdown Support

The following fields support basic markdown formatting:
- `description`
- `longDescription`
- `challenge`
- `solution`
- `results`

### Supported Markdown:
```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- List item 1
- List item 2
- List item 3

Paragraph 1

Paragraph 2
```

## Tips for Best Results

### Content Writing:
- Keep descriptions concise but informative
- Use active voice
- Focus on outcomes and impact
- Include specific metrics when possible

### Project Organization:
- Use consistent tag naming
- Order projects by importance/recency
- Use the `featured` flag for your best work
- Keep image sizes consistent

### Metrics Format:
The metrics field should follow this exact format:
```
"value label, value label, value label"
```
Examples:
- "150% User Engagement, 40% Time Saved, 95% Client Satisfaction"
- "50K Users, 99.9% Uptime, 4.8/5 Rating"

### Common Issues and Solutions:

**Images not loading:**
- Ensure images are publicly accessible
- Check that Google Drive links are set to "Anyone with the link"
- Verify URLs are complete and correct

**Content not updating:**
- Wait 2-3 minutes for Google Sheets cache to refresh
- Check that sheet is public and readable
- Verify column headers match exactly

**Formatting issues:**
- Use proper markdown syntax
- Avoid special characters in key names
- Keep field values reasonable in length

## Testing Your Setup

1. Add a test project with all fields filled
2. Add test content in the Content sheet
3. Refresh your website
4. Check browser console for any error messages
5. Verify all content displays correctly

This setup gives you complete control over your portfolio content without touching any code!
