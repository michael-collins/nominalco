# Footer Google Sheet Setup Guide

## Overview
This guide explains how to set up a "Footer" tab in your Google Sheet to manage all footer content dynamically.

## Sheet Structure

Create a new tab called "Footer" in your Google Sheet with the following columns:

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| type     | key      | value    | url      | section  |

## Column Definitions

### type
- `content`: Text content (logo, tagline, titles, etc.)
- `link`: Clickable links with URLs

### key
- Unique identifier for each piece of content
- Use descriptive names like `logo.heavy`, `tagline`, `email`

### value
- The actual text that will be displayed
- For content: the text to show
- For links: the link text (what users see)

### url
- Only used for `link` type entries
- The destination URL for the link
- Can be internal (#work, #about) or external (https://...)

### section
- Only used for `link` type entries
- Determines which section the link appears in
- Options: `work` or `connect`

## Example Footer Content

### Logo and Basic Content
```csv
content,logo.heavy,nominal,,
content,logo.light,co,,
content,tagline,Crafting digital experiences that matter,,
content,work.title,Work,,
content,connect.title,Connect,,
content,cta.title,Ready to start a project?,,
content,cta.button,Let's talk,,
content,copyright,© 2025 nominalco. All rights reserved.,,
content,signature,Designed & developed with care,,
```

### Work Section Links
```csv
link,portfolio,Portfolio,#work,work
link,process,Process,#about,work
link,case-studies,Case Studies,#contact,work
link,services,Services,#services,work
```

### Connect Section Links
```csv
link,email,hello@nominalco.com,mailto:hello@nominalco.com,connect
link,linkedin,LinkedIn,https://linkedin.com/company/nominalco,connect
link,twitter,Twitter,https://twitter.com/nominalco,connect
link,instagram,Instagram,https://instagram.com/nominalco,connect
link,phone,+1 (555) 123-4567,tel:+15551234567,connect
```

## Setup Steps

1. **Open your Google Sheet**
   - Go to your existing nominalco Google Sheet

2. **Create Footer Tab**
   - Right-click on the sheet tabs at the bottom
   - Select "Insert sheet"
   - Name it "Footer"

3. **Add Headers**
   - In row 1, add: `type`, `key`, `value`, `url`, `section`

4. **Add Content**
   - Copy the example data above
   - Customize the values to match your brand and content

5. **Make Sheet Public**
   - Click "Share" button
   - Change "Restricted" to "Anyone with the link"
   - Set permission to "Viewer"

## Advanced Features

### Email Links
- Use `mailto:` prefix for email addresses
- Example: `mailto:hello@nominalco.com`

### Phone Links
- Use `tel:` prefix for phone numbers
- Example: `tel:+15551234567`

### External Links
- Include full URL with `https://`
- Will automatically open in new tab

### Internal Links
- Use anchor links like `#work`, `#about`, `#contact`
- Will smooth scroll to sections

## Tips

1. **Keep it Simple**: Start with basic content and add more links as needed
2. **Test Links**: Make sure all URLs are correct and working
3. **Consistent Naming**: Use clear, descriptive keys
4. **Regular Updates**: Update social links and contact information as needed
5. **Backup**: Keep a copy of your footer template

## Troubleshooting

- **Links not working**: Check that URLs are properly formatted
- **Content not loading**: Verify sheet is public and named "Footer"
- **Missing links**: Ensure `section` column has either "work" or "connect"
- **Styling issues**: Check that CSS classes match the expected structure

The footer will automatically update when you change the Google Sheet content and refresh your website.
