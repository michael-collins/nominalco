# Nominalco Portfolio Website

A minimalist product design portfolio website built with vanilla HTML, CSS, and JavaScript.

## Features

- **Minimalist Design**: Clean, modern interface focusing on content
- **Google Font Integration**: Uses Space Grotesk for typography
- **Responsive Layout**: Works seamlessly across all device sizes
- **Easy Project Updates**: Simple JSON-based project management
- **Smooth Interactions**: Subtle animations and transitions
- **Modal Project Views**: Detailed project information in overlay

## Project Management

### Adding/Updating Projects

Projects are managed through the `projects.json` file. To add or update projects:

1. Open `projects.json`
2. Add or modify project objects with the following structure:

```json
{
    "id": 1,
    "title": "Project Title",
    "description": "Brief project description for the grid view",
    "image": "images/project-hero.jpg",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "detailImages": [
        "images/project-detail-1.jpg",
        "images/project-detail-2.jpg",
        "images/project-detail-3.jpg"
    ],
    "longDescription": "Detailed project description for the modal view.\n\nSupports multiple paragraphs using \\n\\n."
}
```

### Image Management

1. **Project Images**: Add project images to the `/images/` folder
2. **Naming Convention**: Use descriptive names like `project-name-hero.jpg`
3. **Recommended Sizes**:
   - Hero images: 600x400px minimum
   - Detail images: 800x600px minimum
4. **Format**: Use JPG for photos, PNG for graphics with transparency

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── projects.json       # Project data (easy to edit)
├── images/            # Project images folder
└── README.md          # This file
```

## Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #000;
    --secondary-color: #666;
    --background-color: #fff;
    --light-gray: #f5f5f5;
    --border-color: #e5e5e5;
}
```

### Typography
The site uses Google Font Space Grotesk. To change fonts, update the Google Fonts link in `index.html` and the CSS font-family declarations.

### Contact Information
Update the contact links in `index.html`:
- Email address
- LinkedIn profile
- Dribbble profile
- Add additional social links as needed

## Browser Support

- Chrome/Safari/Firefox (latest 2 versions)
- Edge (latest version)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized CSS with minimal external dependencies
- Lazy loading for project images
- Efficient JavaScript with minimal DOM manipulation
- Fast loading with modern web standards

## Deployment

This is a static website that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting service

Simply upload all files to your web server or connect your repository to a hosting platform.