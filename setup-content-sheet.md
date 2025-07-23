# 📝 Content Management Setup Guide

## Overview
Your website now supports dynamic content management through Google Sheets! You can edit all site text (titles, paragraphs, email, etc.) directly in a Google Sheet and see changes reflected immediately on your website.

## Step 1: Add Content Sheet to Your Existing Google Sheet

1. **Open your existing Google Sheet** (the one with your projects)
2. **Add a new tab/sheet**:
   - Click the "+" button at the bottom left
   - Name it exactly: `Content`
3. **Set up the column structure**:

| key | value |
|-----|-------|
| site.title | nominalco |
| site.logoHeavy | nominal |
| site.logoLight | co |
| hero.title | Multi-disciplinary art and design studio. |
| hero.subtitle | We design objects, interfaces, and ideas. |
| work.title | Selected Work |
| about.title | About nominalco |
| about.paragraph1 | nominalco is an art and design practice specializing in the development of functional, bold, and appealing artifacts, stories, and experiences. |
| about.paragraph2 | Our process is elastic. We adapt bespoke workflows to reveal compelling solutions for each of our projects. |
| about.paragraph3 | We believe in the power of thoughtful design to create meaningful connections between people and the objects that surround them. |
| contact.title | Contact |
| contact.email | hello@nominalco.com |

## Step 2: Copy & Paste Template

Copy this template and paste it into your new "Content" sheet:

```
key,value
site.title,nominalco
site.logoHeavy,nominal
site.logoLight,co
hero.title,Multi-disciplinary art and design studio.
hero.subtitle,We design objects, interfaces, and ideas.
work.title,Selected Work
about.title,About nominalco
about.paragraph1,"nominalco is an art and design practice specializing in the development of functional, bold, and appealing artifacts, stories, and experiences."
about.paragraph2,"Our process is elastic. We adapt bespoke workflows to reveal compelling solutions for each of our projects."
about.paragraph3,"We believe in the power of thoughtful design to create meaningful connections between people and the objects that surround them."
contact.title,Contact
contact.email,hello@nominalco.com
```

**How to paste:**
1. Select cell A1 in your "Content" sheet
2. Paste the template above
3. Choose "Split text to columns" if prompted

## Step 3: Content Keys Explained

| Key | What it controls | Example |
|-----|------------------|---------|
| `site.title` | Browser tab title | "nominalco" |
| `site.logoHeavy` | Bold part of logo | "nominal" |
| `site.logoLight` | Light part of logo | "co" |
| `hero.title` | Main headline | "Multi-disciplinary art and design studio." |
| `hero.subtitle` | Subheadline | "We design objects, interfaces, and ideas." |
| `work.title` | Projects section title | "Selected Work" |
| `about.title` | About section title | "About nominalco" |
| `about.paragraph1` | First about paragraph | Your company description |
| `about.paragraph2` | Second about paragraph | Your process description |
| `contact.title` | Contact section title | "Contact" |
| `contact.email` | Contact email address | "hello@nominalco.com" |

## Step 4: Verify Setup

1. **Check Sheet Permissions**: The Content sheet should inherit the same sharing settings as your main sheet
2. **Test the connection**: Make a small change (like updating the hero title) and refresh your website
3. **Check browser console**: Look for "✅ Content loaded from Google Sheets" message

## 🚀 Dynamic Content Feature

### **About Section Paragraphs**
The about section now supports **unlimited paragraphs**! You can add as many paragraphs as you want:

- `about.paragraph1` → First paragraph
- `about.paragraph2` → Second paragraph  
- `about.paragraph3` → Third paragraph
- `about.paragraph4` → Fourth paragraph
- ...and so on!

### **How It Works:**
1. **Add paragraphs** by adding new rows to your Content sheet
2. **Remove paragraphs** by deleting rows
3. **Reorder paragraphs** by changing the numbers
4. **System automatically** creates/removes `<p>` tags as needed

### **Example:**
To add a third paragraph, just add this row to your sheet:
```
about.paragraph3 | Your new third paragraph content here
```

The system will automatically create a new `<p>` tag for it!

## 🎯 How to Make Changes

### **Editing Text:**
1. Open your Google Sheet
2. Go to the "Content" tab
3. Edit any value in the "value" column
4. Save (auto-saves)
5. Refresh your website to see changes

### **Adding New Content:**
If you want to add new editable content:
1. Add a new row with a unique key
2. Update the JavaScript to use that key
3. The system is easily extensible!

## 🚨 Important Notes

### **Sheet Structure:**
- ✅ Column names must be exactly: `key`, `value`
- ✅ Keep the "Content" sheet name exactly as shown
- ✅ Don't delete the header row
- ✅ Key names are case-sensitive

### **Text Formatting:**
- **Long text**: Wrap in quotes if it contains commas
- **Line breaks**: Use `\n` for line breaks if needed
- **Special characters**: Google Sheets handles these automatically

### **Email Updates:**
- Changing `contact.email` updates both:
  - The visible email text
  - The mailto: link

## 🎉 Benefits

### **Easy Content Management:**
- ✅ **No code changes** needed for text updates
- ✅ **Instant updates** - just refresh the website
- ✅ **Client-friendly** - anyone can edit content
- ✅ **Version control** - Google Sheets tracks changes
- ✅ **Team collaboration** - multiple editors

### **Professional Workflow:**
- ✅ **Separate content from code** - best practice
- ✅ **Consistent with project management** - same Google Sheet
- ✅ **No additional services** - uses your existing setup
- ✅ **Mobile editing** - edit content from phone/tablet

## 🔧 Troubleshooting

### **Content Not Loading?**
1. ✅ Check that "Content" sheet name is exact
2. ✅ Verify column headers are `key` and `value`
3. ✅ Ensure sheet is publicly viewable
4. ✅ Check browser console for error messages

### **Some Text Not Updating?**
1. ✅ Verify the key name matches exactly
2. ✅ Check for extra spaces in key names
3. ✅ Make sure you're editing the "value" column

### **Quotes in Text?**
- Use single quotes inside double quotes: `"It's working!"`
- Or escape quotes: `"She said \"Hello\""`

## 📊 Example Content Updates

### **Seasonal Updates:**
```
hero.title,Spring 2025 Collection Now Available
hero.subtitle,Fresh designs for the new season.
```

### **Company Rebrand:**
```
site.logoHeavy,NewBrand
site.logoLight,Studio
about.title,About NewBrand Studio
```

### **Contact Changes:**
```
contact.email,contact@yournewdomain.com
```

## 🎯 Advanced Tips

### **Content Strategy:**
- Keep hero titles concise and impactful
- Use action words in subtitles
- Update content seasonally for freshness
- A/B test different hero messages

### **SEO Benefits:**
- Page title updates improve search results
- Fresh content signals to search engines
- Easy to optimize for different keywords

### **Team Workflow:**
1. **Content team** edits the Google Sheet
2. **Changes appear instantly** on website
3. **Developers** focus on features, not copy changes
4. **Stakeholders** can review content in context

## 🚀 Ready to Go!

Your content management system is now set up! You can:
- ✅ Edit all website text from Google Sheets
- ✅ See changes instantly on refresh
- ✅ Manage both projects and content from the same sheet
- ✅ Collaborate with team members easily

Just edit your "Content" sheet and watch your website update in real-time! 🎉
