// Application Manager - coordinates loading and initialization
class AppManager {
    constructor() {
        this.contentManager = null;
        this.portfolioManager = null;
        this.footerManager = null;
        this.isContentLoaded = false;
        this.isProjectsLoaded = false;
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize content, portfolio, and footer managers in parallel
            const [contentManager, portfolioManager, footerManager] = await Promise.all([
                this.initContentManager(),
                this.initPortfolioManager(),
                this.initFooterManager()
            ]);

            this.contentManager = contentManager;
            this.portfolioManager = portfolioManager;
            this.footerManager = footerManager;

            // Hide loading screen and show main content
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showMainContent();
            }, 500); // Small delay for smooth transition

        } catch (error) {
            console.error('Error initializing application:', error);
            // Still hide loading screen even if there's an error
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showMainContent();
            }, 1000);
        }
    }

    async initContentManager() {
        const contentManager = new ContentManager();
        await contentManager.init();
        return contentManager;
    }

    async initPortfolioManager() {
        // Use the enhanced portfolio manager
        const portfolioManager = new EnhancedPortfolioManager();
        await portfolioManager.init();
        return portfolioManager;
    }

    async initFooterManager() {
        const footerManager = new FooterManager();
        await footerManager.init();
        return footerManager;
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const mainContent = document.getElementById('main-content');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (mainContent) mainContent.classList.add('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showMainContent() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
    }
}

// Content management from Google Sheets
class ContentManager {
    constructor() {
        this.content = {};
    }

    async init() {
        await this.loadContent();
        this.applyContent();
    }

    async loadContent() {
        try {
            // Pull content from second Google Sheets tab
            const SHEET_ID = '10Ze__9S_rwj_HWnJEMH-pArREc_XheP5NCJNohJVtkc';
            const CONTENT_SHEET_NAME = 'Content'; // Second sheet for site content
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${CONTENT_SHEET_NAME}`;
            
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch content from Google Sheets');
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText);
            this.content = this.transformContentData(data);
            
            console.log('✅ Content loaded from Google Sheets');
        } catch (error) {
            console.warn('⚠️ Could not load content from Google Sheets, using default content');
            console.warn('Error:', error.message);
            this.content = this.getDefaultContent();
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // Escaped quote within quoted field
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // Field separator - end current field
                    currentRow.push(currentField.trim());
                    currentField = '';
                } else {
                    // Regular character
                    currentField += char;
                }
            }
            
            // End of line
            if (inQuotes) {
                // We're inside a quoted field that spans multiple lines
                currentField += '\n'; // Preserve the line break
            } else {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
                    result.push([...currentRow]);
                }
                currentRow = [];
                currentField = '';
            }
        }
        
        // Handle final row if exists
        if (currentRow.length > 0 || currentField !== '') {
            if (currentField !== '') currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                result.push(currentRow);
            }
        }

        // Convert to object format
        if (result.length === 0) return [];
        
        const headers = result[0];
        const data = [];

        for (let i = 1; i < result.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = result[i][index] || '';
            });
            data.push(row);
        }

        return data;
    }

    transformContentData(sheetData) {
        const content = {};
        
        sheetData.forEach(row => {
            if (row.key && row.key.trim() !== '') {
                content[row.key.trim()] = row.value?.trim() || '';
            }
        });

        return content;
    }

    getDefaultContent() {
        return {
            'site.title': 'nominalco',
            'site.logoHeavy': 'nominal',
            'site.logoLight': 'co',
            'nav.work': 'Work',
            'nav.about': 'About',
            'nav.contact': 'Contact',
            'hero.title': 'Multi-disciplinary art and design studio.',
            'hero.subtitle': 'We design objects, interfaces, and ideas.',
            'work.title': 'Selected Work',
            'about.title': 'About nominalco',
            'about.paragraph1': 'nominalco is an art and design practice specializing in the development of functional, bold, and appealing artifacts, stories, and experiences.',
            'about.paragraph2': 'Our process is elastic. We adapt bespoke workflows to reveal compelling solutions for each of our projects.',
            'contact.title': 'Contact',
            'contact.email': 'hello@nominalco.com'
        };
    }

    applyContent() {
        // Apply basic content mappings
        const mappings = {
            'site.title': () => document.title = this.content['site.title'] || 'nominalco',
            'hero.title': () => {
                const elem = document.querySelector('.hero-title');
                if (elem) elem.textContent = this.content['hero.title'] || 'Multi-disciplinary art and design studio.';
            },
            'hero.subtitle': () => {
                const elem = document.querySelector('.hero-subtitle');
                if (elem) elem.textContent = this.content['hero.subtitle'] || 'We design objects, interfaces, and ideas.';
            },
            'work.title': () => {
                const elem = document.querySelector('#work .section-title');
                if (elem) elem.textContent = this.content['work.title'] || 'Selected Work';
            },
            'about.title': () => {
                const elem = document.querySelector('#about .section-title');
                if (elem) elem.textContent = this.content['about.title'] || 'About nominalco';
            },
            'contact.title': () => {
                const elem = document.querySelector('#contact .section-title');
                if (elem) elem.textContent = this.content['contact.title'] || 'Contact';
            },
            'contact.email': () => {
                const elem = document.querySelector('.contact-link');
                const email = this.content['contact.email'] || 'hello@nominalco.com';
                if (elem) {
                    elem.textContent = email;
                    elem.href = `mailto:${email}`;
                }
            }
        };

        // Apply basic mappings
        Object.keys(mappings).forEach(key => {
            if (this.content[key] !== undefined) {
                mappings[key]();
            }
        });

        // Apply content using data attributes (for navigation and logo)
        this.applyDataAttributeContent();

        // Handle dynamic content areas
        this.applyDynamicContent();
    }

    applyDataAttributeContent() {
        // Find all elements with data-content attributes and populate them
        const elementsWithDataContent = document.querySelectorAll('[data-content]');
        
        elementsWithDataContent.forEach(element => {
            const contentKey = element.getAttribute('data-content');
            const contentValue = this.content[contentKey] || this.getDefaultContent()[contentKey];
            
            if (contentValue) {
                element.textContent = contentValue;
            }
        });
    }

    applyDynamicContent() {
        // Handle about section paragraphs dynamically
        this.updateDynamicSection('about', '.about-content', ['about.title']);
        
        // You can add more dynamic sections here as needed
        // this.updateDynamicSection('services', '.services-content', ['services.title']);
    }

    updateDynamicSection(sectionName, containerSelector, excludeKeys = []) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // Find all content keys for this section
        const sectionKeys = Object.keys(this.content)
            .filter(key => key.startsWith(`${sectionName}.`) && !excludeKeys.includes(key))
            .sort();

        if (sectionKeys.length === 0) {
            // If no dynamic content, ensure we have default paragraphs
            const defaultKeys = Object.keys(this.getDefaultContent())
                .filter(key => key.startsWith(`${sectionName}.`) && !excludeKeys.includes(key))
                .sort();
            
            // Remove existing paragraphs
            const existingParagraphs = container.querySelectorAll('p');
            existingParagraphs.forEach(p => p.remove());

            // Create default paragraphs
            defaultKeys.forEach(key => {
                const paragraph = document.createElement('p');
                paragraph.textContent = this.getDefaultContent()[key];
                container.appendChild(paragraph);
            });
            return;
        }

        // Remove existing paragraphs (but keep title and other elements)
        const existingParagraphs = container.querySelectorAll('p');
        existingParagraphs.forEach(p => p.remove());

        // Create new paragraphs for each content key
        sectionKeys.forEach(key => {
            const paragraph = document.createElement('p');
            paragraph.textContent = this.content[key];
            container.appendChild(paragraph);
        });
    }
}

// Footer management from Google Sheets
class FooterManager {
    constructor() {
        this.footerData = {
            content: {},
            links: {}
        };
    }

    async init() {
        await this.loadFooterData();
        this.applyFooterContent();
    }

    async loadFooterData() {
        try {
            // Pull footer data from Footer tab in Google Sheets
            const SHEET_ID = '10Ze__9S_rwj_HWnJEMH-pArREc_XheP5NCJNohJVtkc';
            const FOOTER_SHEET_NAME = 'Footer'; // Footer sheet tab
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${FOOTER_SHEET_NAME}`;
            
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch footer data from Google Sheets');
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText);
            this.footerData = this.transformFooterData(data);
            
            console.log('✅ Footer data loaded from Google Sheets');
        } catch (error) {
            console.warn('⚠️ Could not load footer data from Google Sheets, using default content');
            console.warn('Error:', error.message);
            this.footerData = this.getDefaultFooterData();
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // Escaped quote within quoted field
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // Field separator - end current field
                    currentRow.push(currentField.trim());
                    currentField = '';
                } else {
                    // Regular character
                    currentField += char;
                }
            }
            
            // End of line
            if (inQuotes) {
                // We're inside a quoted field that spans multiple lines
                currentField += '\n'; // Preserve the line break
            } else {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
                    result.push([...currentRow]);
                }
                currentRow = [];
                currentField = '';
            }
        }
        
        // Handle final row if exists
        if (currentRow.length > 0 || currentField !== '') {
            if (currentField !== '') currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                result.push(currentRow);
            }
        }

        // Convert to object format
        if (result.length === 0) return [];
        
        const headers = result[0];
        const data = [];

        for (let i = 1; i < result.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = result[i][index] || '';
            });
            data.push(row);
        }

        return data;
    }

    transformFooterData(sheetData) {
        const footerData = {
            content: {},
            links: {
                work: [],
                connect: []
            }
        };
        
        sheetData.forEach(row => {
            if (!row.type || !row.key) return;
            
            const type = row.type.trim().toLowerCase();
            const key = row.key.trim();
            const value = row.value?.trim() || '';
            const url = row.url?.trim() || '';
            const section = row.section?.trim().toLowerCase() || '';
            
            if (type === 'content') {
                footerData.content[key] = value;
            } else if (type === 'link') {
                const linkData = { 
                    text: value, 
                    url: url,
                    key: key
                };
                
                if (section === 'work') {
                    footerData.links.work.push(linkData);
                } else if (section === 'connect') {
                    footerData.links.connect.push(linkData);
                }
            }
        });

        return footerData;
    }

    getDefaultFooterData() {
        return {
            content: {
                'logo.heavy': 'nominal',
                'logo.light': 'co',
                'tagline': 'Crafting digital experiences that matter',
                'work.title': 'Work',
                'connect.title': 'Connect',
                'cta.title': 'Ready to start a project?',
                'cta.button': 'Let\'s talk',
                'cta.disabled': 'false',
                'copyright': '© 2025 nominalco. All rights reserved.',
                'signature': 'Designed & developed with care'
            },
            links: {
                work: [
                    { text: 'Portfolio', url: '#work', key: 'portfolio' },
                    { text: 'Process', url: '#about', key: 'process' },
                    { text: 'Case Studies', url: '#contact', key: 'case-studies' }
                ],
                connect: [
                    { text: 'hello@nominalco.com', url: 'mailto:hello@nominalco.com', key: 'email' },
                    { text: 'LinkedIn', url: 'https://linkedin.com/company/nominalco', key: 'linkedin' },
                    { text: 'Twitter', url: 'https://twitter.com/nominalco', key: 'twitter' }
                ]
            }
        };
    }

    applyFooterContent() {
        // Apply logo content
        const logoHeavy = document.querySelector('.footer-logo .logo-heavy');
        const logoLight = document.querySelector('.footer-logo .logo-light');
        
        if (logoHeavy) logoHeavy.textContent = this.footerData.content['logo.heavy'] || 'nominal';
        if (logoLight) logoLight.textContent = this.footerData.content['logo.light'] || 'co';
        
        // Apply tagline
        const tagline = document.querySelector('.footer-tagline');
        if (tagline) tagline.textContent = this.footerData.content['tagline'] || 'Crafting digital experiences that matter';
        
        // Apply section titles
        const workTitle = document.querySelector('.footer-links .footer-section:first-child h4');
        const connectTitle = document.querySelector('.footer-links .footer-section:last-child h4');
        
        if (workTitle) workTitle.textContent = this.footerData.content['work.title'] || 'Work';
        if (connectTitle) connectTitle.textContent = this.footerData.content['connect.title'] || 'Connect';
        
        // Handle CTA section (show/hide based on disabled setting)
        const ctaContainer = document.querySelector('.footer-right');
        const ctaDisabled = this.footerData.content['cta.disabled'];
        const isCtaDisabled = ctaDisabled === 'true' || ctaDisabled === true;
        
        if (ctaContainer) {
            if (isCtaDisabled) {
                ctaContainer.style.display = 'none';
                // Adjust grid layout to 2 columns when CTA is hidden
                const footerContent = document.querySelector('.footer-content');
                if (footerContent) {
                    footerContent.style.gridTemplateColumns = '1fr 2fr';
                }
            } else {
                ctaContainer.style.display = 'block';
                // Reset to 3 columns when CTA is shown
                const footerContent = document.querySelector('.footer-content');
                if (footerContent) {
                    footerContent.style.gridTemplateColumns = '1fr 2fr 1fr';
                }
                
                // Apply CTA content
                const ctaTitle = document.querySelector('.footer-cta h4');
                const ctaButton = document.querySelector('.footer-cta-button');
                
                if (ctaTitle) ctaTitle.textContent = this.footerData.content['cta.title'] || 'Ready to start a project?';
                if (ctaButton) ctaButton.textContent = this.footerData.content['cta.button'] || 'Let\'s talk';
            }
        }
        
        // Apply bottom content
        const copyright = document.querySelector('.footer-bottom-left p');
        const signature = document.querySelector('.footer-bottom-right p');
        
        if (copyright) copyright.textContent = this.footerData.content['copyright'] || '© 2025 nominalco. All rights reserved.';
        if (signature) signature.textContent = this.footerData.content['signature'] || 'Designed & developed with care';
        
        // Apply dynamic links
        this.applyFooterLinks();
    }

    applyFooterLinks() {
        // Apply work section links
        const workList = document.querySelector('.footer-links .footer-section:first-child ul');
        if (workList && this.footerData.links.work.length > 0) {
            workList.innerHTML = '';
            this.footerData.links.work.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.text;
                
                // Add target="_blank" for external links
                if (link.url.startsWith('http')) {
                    a.target = '_blank';
                    a.rel = 'noopener';
                }
                
                li.appendChild(a);
                workList.appendChild(li);
            });
        }
        
        // Apply connect section links
        const connectList = document.querySelector('.footer-links .footer-section:last-child ul');
        if (connectList && this.footerData.links.connect.length > 0) {
            connectList.innerHTML = '';
            this.footerData.links.connect.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.text;
                
                // Add special class for email
                if (link.key === 'email' || link.url.startsWith('mailto:')) {
                    a.className = 'footer-email';
                }
                
                // Add target="_blank" for external links (not email)
                if (link.url.startsWith('http')) {
                    a.target = '_blank';
                    a.rel = 'noopener';
                }
                
                li.appendChild(a);
                connectList.appendChild(li);
            });
        }
    }
}

// Enhanced Case Study Modal System
class CaseStudyModal {
    constructor(portfolioManager) {
        this.portfolioManager = portfolioManager;
        this.modal = null;
        this.currentProjectIndex = 0;
        this.projects = [];
        this.isScrolling = false;
        this.scrollProgress = 0;
        
        this.init();
    }
    
    init() {
        this.modal = document.getElementById('project-modal');
        this.setupEventListeners();
        this.setupScrollProgress();
        this.setupKeyboardNavigation();
    }
    
    openCaseStudy(project, projects) {
        this.projects = projects;
        console.log('Opening project:', project.title, 'ID:', project.id);
        console.log('All project IDs:', projects.map(p => ({ title: p.title, id: p.id })));
        
        // Find by ID first, then by title, then by index as fallback
        this.currentProjectIndex = projects.findIndex(p => p.id === project.id);
        
        // If ID match fails, try title match
        if (this.currentProjectIndex === -1) {
            this.currentProjectIndex = projects.findIndex(p => p.title === project.title);
        }
        
        // If still not found, find by looking for the same project object reference
        if (this.currentProjectIndex === -1) {
            this.currentProjectIndex = projects.findIndex(p => p === project);
        }
        
        // Ultimate fallback - use index 0
        if (this.currentProjectIndex === -1) {
            this.currentProjectIndex = 0;
        }
        
        console.log('Final project index:', this.currentProjectIndex, 'for project:', project.title);
        
        this.populateContent(project);
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Trigger entrance animation
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 50);
        
        // Reset scroll position
        this.modal.scrollTop = 0;
        this.updateScrollProgress();
    }
    
    populateContent(project) {
        // Populate hero section
        const heroImage = this.modal.querySelector('.hero-image');
        const heroTitle = this.modal.querySelector('.case-study-hero .hero-title');
        const heroSubtitle = this.modal.querySelector('.case-study-hero .hero-subtitle');
        const heroTags = this.modal.querySelector('.hero-tags');
        const projectCategory = this.modal.querySelector('.project-category');
        const projectYear = this.modal.querySelector('.project-year');
        
        if (heroImage) {
            heroImage.src = project.image;
            heroImage.alt = project.title;
        }
        if (heroTitle) heroTitle.textContent = project.title;
        if (heroSubtitle) {
            // Use first paragraph of description for subtitle
            const description = project.description || '';
            const firstSentence = description.split('.')[0];
            heroSubtitle.textContent = firstSentence + (description.includes('.') ? '.' : '');
        }
        if (projectCategory) {
            projectCategory.textContent = project.category || (project.tags && project.tags.length > 0 ? project.tags[0] : 'Design');
        }
        if (projectYear) {
            projectYear.textContent = project.year || new Date().getFullYear();
        }
        
        // Populate tags
        if (heroTags && project.tags) {
            heroTags.innerHTML = project.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
        
        // Populate overview section
        const projectDescription = this.modal.querySelector('.case-study-overview .project-description');
        if (projectDescription) {
            // Use the converted HTML description or plain description
            if (project.descriptionHtml && project.descriptionHtml.trim() !== '') {
                projectDescription.innerHTML = project.descriptionHtml;
            } else if (project.longDescription && project.longDescription.trim() !== '') {
                projectDescription.innerHTML = project.longDescription;
            } else {
                projectDescription.innerHTML = `<p>${project.description}</p>`;
            }
        }

        // Populate client section - only show if client exists
        this.populateClient(project);
        
        // Populate Shopify button section - only show if button exists
        this.populateShopifyButton(project);
        
        // Populate challenge section - only show if challenge exists
        this.populateChallenge(project);

        // Populate results section with dynamic metrics
        this.populateResults(project);
        
        // Populate gallery
        this.populateGallery(project.detailImages || [project.image]);
        
        // Populate next project
        this.populateNextProject();
        
        // Update navigation
        this.updateNavigation();
    }

    populateClient(project) {
        const clientContainer = this.modal.querySelector('.overview-client');
        const clientText = this.modal.querySelector('.client-text');
        
        if (project.client && clientText) {
            clientText.textContent = project.client;
            if (clientContainer) clientContainer.style.display = 'block';
        } else {
            // Hide entire client container if no client data
            if (clientContainer) clientContainer.style.display = 'none';
        }
    }

    populateShopifyButton(project) {
        const shopifyContainer = this.modal.querySelector('.overview-shopify');
        
        if (project.shopifyButton && project.shopifyButton.trim() !== '') {
            if (shopifyContainer) {
                // Create a unique container ID for this Shopify button
                const containerId = `shopify-container-${Date.now()}`;
                
                shopifyContainer.innerHTML = `
                    <h3>Purchase</h3>
                    <div class="shopify-button-container" id="${containerId}">
                        Loading...
                    </div>
                `;
                shopifyContainer.style.display = 'block';
                
                // Inject and execute the Shopify button code
                this.injectShopifyButton(project.shopifyButton, containerId);
            }
        } else {
            // Hide entire Shopify container if no button data
            if (shopifyContainer) shopifyContainer.style.display = 'none';
        }
    }

    injectShopifyButton(buttonHTML, containerId) {
        console.log('🛒 Injecting Shopify button...', containerId);
        
        // Parse the HTML to extract the script and div elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buttonHTML;
        
        const scriptElement = tempDiv.querySelector('script');
        const divElement = tempDiv.querySelector('div[id*="product-component"]');
        
        if (!scriptElement || !divElement) {
            console.warn('Invalid Shopify button HTML - missing script or div element');
            document.getElementById(containerId).innerHTML = '<p>Invalid button configuration</p>';
            return;
        }
        
        console.log('✅ Found Shopify elements:', {
            script: !!scriptElement,
            div: divElement.id,
            containerId: containerId
        });
        
        // Insert the Shopify div into our container
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        // Clone the div and update its ID to avoid conflicts
        const clonedDiv = divElement.cloneNode(true);
        const originalId = clonedDiv.id;
        const newId = `${originalId}-${Date.now()}`;
        clonedDiv.id = newId;
        
        container.appendChild(clonedDiv);
        console.log(`📦 Shopify div added with ID: ${newId}`);
        
        // Execute the Shopify script with updated ID
        try {
            // Get the script content and update the element ID reference
            let scriptContent = scriptElement.textContent || scriptElement.innerText;
            scriptContent = scriptContent.replace(
                new RegExp(originalId, 'g'), 
                newId
            );
            
            // Create a new script element and execute it
            const newScript = document.createElement('script');
            newScript.type = 'text/javascript';
            newScript.textContent = scriptContent;
            
            // Add error handling to the script
            newScript.onerror = function(error) {
                console.error('❌ Shopify script error:', error);
                container.innerHTML = '<p>Error loading purchase button</p>';
            };
            
            // Append to document head to execute
            document.head.appendChild(newScript);
            
            console.log('✅ Shopify button script injected successfully');
            
            // Add a timeout to check if the button loaded
            setTimeout(() => {
                const buttonElement = container.querySelector('button, .shopify-buy__btn');
                if (buttonElement) {
                    console.log('✅ Shopify button rendered successfully');
                } else {
                    console.warn('⚠️ Shopify button may not have rendered - check network connectivity');
                    // Don't replace content, let Shopify handle loading states
                }
            }, 3000);
            
        } catch (error) {
            console.error('❌ Error injecting Shopify button:', error);
            container.innerHTML = '<p>Error loading purchase button</p>';
        }
    }

    sanitizeShopifyButton(buttonHTML) {
        // This method is now used by injectShopifyButton for validation
        // Basic validation to ensure we have the required Shopify elements
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = buttonHTML;
        
        const hasScript = tempDiv.querySelector('script') !== null;
        const hasDiv = tempDiv.querySelector('div[id*="product-component"]') !== null;
        
        if (!hasScript || !hasDiv) {
            console.warn('⚠️ Shopify button HTML is missing required elements');
            return false;
        }
        
        return true;
    }

    populateChallenge(project) {
        const challengeContainer = this.modal.querySelector('.overview-challenge');
        const challengeText = this.modal.querySelector('.challenge-text');
        
        if (project.challenge && challengeText) {
            challengeText.textContent = project.challenge;
            if (challengeContainer) challengeContainer.style.display = 'block';
        } else {
            // Hide entire challenge container if no challenge data
            if (challengeContainer) challengeContainer.style.display = 'none';
        }
    }

    populateResults(project) {
        const resultsSection = this.modal.querySelector('.case-study-results');
        const resultsGrid = this.modal.querySelector('.results-grid');
        const resultsSummary = this.modal.querySelector('.results-summary p');
        
        // Check if we have results data
        const hasResults = project.results || (project.metrics && project.metrics.length > 0);
        
        if (!hasResults) {
            // Hide entire results section if no data
            if (resultsSection) resultsSection.style.display = 'none';
            return;
        }
        
        // Show results section
        if (resultsSection) resultsSection.style.display = 'block';
        
        // Handle metrics if available
        if (project.metrics && project.metrics.length > 0 && resultsGrid) {
            resultsGrid.innerHTML = '';
            project.metrics.forEach(metric => {
                const metricDiv = document.createElement('div');
                metricDiv.className = 'result-metric';
                metricDiv.innerHTML = `
                    <span class="metric-number">${metric.value}</span>
                    <span class="metric-label">${metric.label}</span>
                `;
                resultsGrid.appendChild(metricDiv);
            });
            resultsGrid.style.display = 'grid';
        } else if (resultsGrid) {
            // Hide metrics grid if no metrics
            resultsGrid.style.display = 'none';
        }
        
        // Handle results summary
        if (project.results && resultsSummary) {
            resultsSummary.textContent = project.results;
            resultsSummary.parentElement.style.display = 'block';
        } else if (resultsSummary && resultsSummary.parentElement) {
            resultsSummary.parentElement.style.display = 'none';
        }
    }
    
    populateGallery(images) {
        const gallerySection = this.modal.querySelector('.case-study-gallery');
        const gallery = this.modal.querySelector('#project-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        // Filter out empty or invalid images
        const validImages = images.filter(img => img && img.trim() !== '');
        
        // Only show gallery if we have more than just the main project image
        if (validImages.length <= 1) {
            if (gallerySection) gallerySection.style.display = 'none';
            return;
        }
        
        // Show gallery section
        if (gallerySection) gallerySection.style.display = 'block';
        
        validImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image}" alt="Project detail ${index + 1}" loading="lazy">
            `;
            
            // Add click handler for lightbox
            galleryItem.addEventListener('click', () => {
                this.openLightbox(validImages, index);
            });
            
            gallery.appendChild(galleryItem);
        });
    }
    
    openLightbox(images, startIndex) {
        // Create and manage image lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        let currentIndex = startIndex;
        
        const updateLightboxImage = () => {
            const img = lightbox.querySelector('.lightbox-image');
            const counter = lightbox.querySelector('.lightbox-counter');
            
            img.src = images[currentIndex];
            img.alt = `Project detail ${currentIndex + 1}`;
            counter.textContent = `${currentIndex + 1} / ${images.length}`;
        };
        
        lightbox.innerHTML = `
            <div class="lightbox-container">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev">‹</button>
                <button class="lightbox-next">›</button>
                <img class="lightbox-image" src="${images[startIndex]}" alt="">
                <div class="lightbox-counter">${startIndex + 1} / ${images.length}</div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Event listeners
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            updateLightboxImage();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            updateLightboxImage();
        });
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
            }
        });
        
        // Keyboard navigation
        const handleKeydown = (e) => {
            switch(e.key) {
                case 'Escape':
                    document.body.removeChild(lightbox);
                    document.removeEventListener('keydown', handleKeydown);
                    break;
                case 'ArrowLeft':
                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                    updateLightboxImage();
                    break;
                case 'ArrowRight':
                    currentIndex = (currentIndex + 1) % images.length;
                    updateLightboxImage();
                    break;
            }
        };
        
        document.addEventListener('keydown', handleKeydown);
    }
    
    populateNextProject() {
        const nextProjectCard = this.modal.querySelector('.next-project-card');
        if (!nextProjectCard) return;
        
        const nextIndex = (this.currentProjectIndex + 1) % this.projects.length;
        const nextProject = this.projects[nextIndex];
        
        const nextImage = nextProjectCard.querySelector('.next-project-image');
        const nextTitle = nextProjectCard.querySelector('.next-project-title');
        const nextDescription = nextProjectCard.querySelector('.next-project-description');
        const nextBtn = nextProjectCard.querySelector('.next-project-btn');
        
        if (nextImage) nextImage.src = nextProject.image;
        if (nextTitle) nextTitle.textContent = nextProject.title;
        if (nextDescription) {
            const desc = nextProject.description || '';
            const firstSentence = desc.split('.')[0];
            nextDescription.textContent = firstSentence + (desc.includes('.') ? '.' : '');
        }
        
        if (nextBtn) {
            nextBtn.onclick = () => {
                this.currentProjectIndex = nextIndex;
                this.populateContent(nextProject);
                this.modal.scrollTop = 0;
            };
        }
    }
    
    updateNavigation() {
        const counter = this.modal.querySelector('.project-counter');
        const prevBtn = this.modal.querySelector('.nav-prev');
        const nextBtn = this.modal.querySelector('.nav-next');
        
        if (counter) {
            counter.textContent = `${String(this.currentProjectIndex + 1).padStart(2, '0')} / ${String(this.projects.length).padStart(2, '0')}`;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentProjectIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentProjectIndex === this.projects.length - 1;
        }
    }
    
    setupScrollProgress() {
        this.modal.addEventListener('scroll', () => {
            this.updateScrollProgress();
            this.handleNavVisibility();
        });
    }
    
    updateScrollProgress() {
        const scrollTop = this.modal.scrollTop;
        const scrollHeight = this.modal.scrollHeight - this.modal.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        
        const progressBar = this.modal.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }
    
    handleNavVisibility() {
        const nav = this.modal.querySelector('.case-study-nav');
        if (!nav) return;
        
        const scrollTop = this.modal.scrollTop;
        
        if (scrollTop > 100 && !this.isScrolling) {
            nav.classList.add('hidden');
        } else {
            nav.classList.remove('hidden');
        }
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeCaseStudy();
                    break;
                case 'ArrowLeft':
                    this.previousProject();
                    break;
                case 'ArrowRight':
                    this.nextProject();
                    break;
            }
        });
    }
    
    previousProject() {
        if (this.currentProjectIndex > 0) {
            this.currentProjectIndex--;
            this.populateContent(this.projects[this.currentProjectIndex]);
            this.modal.scrollTop = 0;
        }
    }
    
    nextProject() {
        if (this.currentProjectIndex < this.projects.length - 1) {
            this.currentProjectIndex++;
            this.populateContent(this.projects[this.currentProjectIndex]);
            this.modal.scrollTop = 0;
        }
    }
    
    closeCaseStudy() {
        this.modal.classList.remove('active');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 600);
    }
    
    setupEventListeners() {
        // Close button
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-close')) {
                this.closeCaseStudy();
            }
            if (e.target.classList.contains('nav-prev')) {
                this.previousProject();
            }
            if (e.target.classList.contains('nav-next')) {
                this.nextProject();
            }
        });
        
        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeCaseStudy();
            }
        });
    }
}

// Project data and functionality
class PortfolioManager {
    constructor() {
        this.projects = [];
    }

    async loadProjects() {
        try {
            // Try JSON format first (better formatting preservation)
            const SHEET_ID = '10Ze__9S_rwj_HWnJEMH-pArREc_XheP5NCJNohJVtkc';
            const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name
            const jsonUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
            
            const response = await fetch(jsonUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Google Sheets');
            }
            
            const jsonText = await response.text();
            // Remove Google's JSONP wrapper
            const cleanJson = jsonText.replace(/^.*?({.*}).*$/, '$1');
            const data = JSON.parse(cleanJson);
            this.projects = this.transformGoogleSheetsData(data);
            
            console.log('✅ Projects loaded directly from Google Sheets (JSON format)');
        } catch (error) {
            console.warn('⚠️ Could not load from Google Sheets JSON, trying CSV format');
            console.warn('Error:', error.message);
            
            try {
                // Fallback to CSV format
                const SHEET_ID = '10Ze__9S_rwj_HWnJEMH-pArREc_XheP5NCJNohJVtkc';
                const SHEET_NAME = 'Sheet1';
                const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
                
                const response = await fetch(csvUrl);
                if (!response.ok) throw new Error('CSV fetch failed');
                
                const csvText = await response.text();
                const data = this.parseCSV(csvText);
                this.projects = this.transformSheetData(data);
                
                console.log('✅ Projects loaded from Google Sheets (CSV fallback)');
            } catch (csvError) {
                console.warn('⚠️ Could not load from Google Sheets, using local data');
                console.warn('CSV Error:', csvError.message);
                
                // Final fallback to local JSON file
                try {
                    const response = await fetch('projects.json');
                    this.projects = await response.json();
                } catch (fallbackError) {
                    console.warn('⚠️ Could not load projects.json, using default data');
                    this.projects = this.getDefaultProjects();
                }
            }
        }
    }

    transformGoogleSheetsData(googleData) {
        const rows = googleData.table.rows;
        const projects = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row.c || !row.c[1] || !row.c[1].v) continue; // Skip empty rows

            const rawDescription = row.c[2]?.v?.trim() || '';
            const project = {
                id: (i + 1), // Use row index + 1 for guaranteed unique ID
                originalId: parseInt(row.c[0]?.v) || (i + 1), // Keep original ID for reference
                title: row.c[1]?.v?.trim() || 'Untitled Project',
                description: rawDescription,
                descriptionHtml: this.convertMarkdownToHtml(rawDescription),
                image: this.processImageUrl(row.c[3]?.v),
                tags: this.processTags(row.c[4]?.v),
                detailImages: this.processDetailImages(row.c[5]?.v),
                longDescription: this.processLongDescription(row.c[6]?.v),
                // New dynamic fields for enhanced case studies
                year: row.c[7]?.v?.trim() || new Date().getFullYear().toString(),
                client: row.c[8]?.v?.trim() || '',
                duration: row.c[9]?.v?.trim() || '',
                teamSize: row.c[10]?.v?.trim() || '',
                role: row.c[11]?.v?.trim() || '',
                challenge: row.c[12]?.v?.trim() || '',
                solution: row.c[13]?.v?.trim() || '',
                results: row.c[14]?.v?.trim() || '',
                metrics: this.processMetrics(row.c[15]?.v),
                category: row.c[16]?.v?.trim() || (row.c[4]?.v?.split(',')[0]?.trim() || 'Design'),
                featured: row.c[17]?.v?.toLowerCase() === 'true' || false,
                status: row.c[18]?.v?.trim() || 'completed',
                shopifyButton: row.c[19]?.v?.trim() || ''
            };

            projects.push(project);
        }

        return projects;
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        // Escaped quote within quoted field
                        currentField += '"';
                        i++; // Skip next quote
                    } else {
                        // Toggle quote state
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    // Field separator - end current field
                    currentRow.push(currentField.trim());
                    currentField = '';
                } else {
                    // Regular character
                    currentField += char;
                }
            }
            
            // End of line
            if (inQuotes) {
                // We're inside a quoted field that spans multiple lines
                currentField += '\n'; // Preserve the line break
            } else {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.length > 0 && currentRow.some(field => field !== '')) {
                    result.push([...currentRow]);
                }
                currentRow = [];
                currentField = '';
            }
        }
        
        // Handle final row if exists
        if (currentRow.length > 0 || currentField !== '') {
            if (currentField !== '') currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                result.push(currentRow);
            }
        }

        // Convert to object format
        if (result.length === 0) return [];
        
        const headers = result[0];
        const data = [];

        for (let i = 1; i < result.length; i++) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = result[i][index] || '';
            });
            data.push(row);
        }

        return data;
    }

    transformSheetData(sheetData) {
        return sheetData.map((row, index) => {
            // Handle empty rows
            if (!row.title || row.title.trim() === '') {
                return null;
            }

            const rawDescription = row.description?.trim() || '';
            return {
                id: (index + 1), // Use array index + 1 for guaranteed unique ID
                originalId: parseInt(row.yearid) || parseInt(row.id) || (index + 1), // Keep original ID for reference
                title: row.title?.trim() || 'Untitled Project',
                description: rawDescription,
                descriptionHtml: this.convertMarkdownToHtml(rawDescription),
                image: this.processImageUrl(row.image),
                tags: this.processTags(row.tags),
                detailImages: this.processDetailImages(row.detailImages),
                longDescription: this.processLongDescription(row.longDescription),
                // New dynamic fields
                year: row.year?.trim() || new Date().getFullYear().toString(),
                client: row.client?.trim() || '',
                duration: row.duration?.trim() || '',
                teamSize: row.teamSize?.trim() || '',
                role: row.role?.trim() || '',
                challenge: row.challenge?.trim() || '',
                solution: row.solution?.trim() || '',
                results: row.results?.trim() || '',
                metrics: this.processMetrics(row.metrics),
                category: row.category?.trim() || (row.tags?.split(',')[0]?.trim() || 'Design'),
                featured: row.featured?.toLowerCase() === 'true' || false,
                status: row.status?.trim() || 'completed',
                shopifyButton: row.shopifyButton?.trim() || ''
            };
        }).filter(project => project !== null); // Remove empty rows
    }

    processImageUrl(imageUrl) {
        if (!imageUrl || imageUrl.trim() === '') {
            return 'https://via.placeholder.com/600x400/f8f9fa/495057?text=Add+Image';
        }

        const url = imageUrl.trim();

        // Handle Google Drive URLs - convert to direct link
        if (url.includes('drive.google.com')) {
            return this.convertGoogleDriveUrl(url);
        }

        // Handle Google Photos URLs
        if (url.includes('photos.google.com') || url.includes('photos.app.goo.gl')) {
            console.warn('⚠️ Google Photos URLs may not work. Use Google Drive or Imgur instead.');
            return url;
        }

        // Handle Dropbox URLs - add ?raw=1
        if (url.includes('dropbox.com') && !url.includes('raw=1')) {
            return url.includes('?') ? `${url}&raw=1` : `${url}?raw=1`;
        }

        // Return URL as-is for other services (Imgur, Cloudinary, etc.)
        return url;
    }

    convertGoogleDriveUrl(url) {
        // Extract file ID from various Google Drive URL formats
        let fileId = '';
        
        if (url.includes('/file/d/')) {
            fileId = url.split('/file/d/')[1].split('/')[0];
        } else if (url.includes('id=')) {
            fileId = url.split('id=')[1].split('&')[0];
        }

        if (fileId) {
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }

        console.warn('⚠️ Could not convert Google Drive URL. Make sure it\'s shareable.');
        return url;
    }

    processTags(tagsString) {
        if (!tagsString || tagsString.trim() === '') {
            return [];
        }

        return tagsString.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '');
    }

    processDetailImages(detailImagesString) {
        if (!detailImagesString || detailImagesString.trim() === '') {
            return [];
        }

        return detailImagesString.split(',')
            .map(url => this.processImageUrl(url.trim()))
            .filter(url => url !== '');
    }

    processMetrics(metricsString) {
        if (!metricsString || metricsString.trim() === '') {
            return [];
        }

        // Expected format: "150% User Engagement, 40% Time Saved, 95% Client Satisfaction"
        return metricsString.split(',')
            .map(metric => {
                const parts = metric.trim().split(' ');
                if (parts.length >= 2) {
                    const value = parts[0];
                    const label = parts.slice(1).join(' ');
                    return { value, label };
                }
                return null;
            })
            .filter(metric => metric !== null);
    }

    convertMarkdownToHtml(markdownText) {
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

    processLongDescription(longDesc) {
        if (!longDesc || longDesc.trim() === '') {
            return '';
        }

        return this.convertMarkdownToHtml(longDesc);
    }

    getDefaultProjects() {
        return [
            {
                id: 1,
                title: "Modular Audio Interface",
                description: "Hardware-software system for professional audio production with modular connectivity.",
                image: "https://via.placeholder.com/600x400/2c2c2c/ffffff?text=Modular+Audio+Interface",
                tags: ["Hardware", "Audio", "Interface"],
                detailImages: [
                    "https://via.placeholder.com/800x600/2c2c2c/ffffff?text=Interface+Overview",
                    "https://via.placeholder.com/800x600/3c3c3c/ffffff?text=Module+System",
                    "https://via.placeholder.com/800x600/4c4c4c/ffffff?text=Software+Control"
                ],
                longDescription: "Development of a modular audio interface system that bridges professional studio equipment with modern digital workflows. The project required extensive research into signal processing, electromagnetic compatibility, and user interface design.\n\nTechnical specifications:\n• 24-bit/192kHz conversion\n• Modular I/O expansion\n• Software-controlled routing matrix\n• USB-C and Thunderbolt connectivity\n• Field-replaceable components",
                year: "2024",
                client: "Audio Professionals Ltd.",
                duration: "8 months",
                teamSize: "5 engineers",
                role: "Lead Hardware Designer",
                challenge: "Designing a modular system that maintains signal integrity while allowing flexible configuration for different studio setups.",
                solution: "Created a proprietary connector system with intelligent signal routing and software-controlled matrix switching.",
                results: "Successfully launched product with 40% faster setup times and 99.99% signal reliability across all modules.",
                metrics: [
                    { value: "40%", label: "Faster Setup" },
                    { value: "99.99%", label: "Signal Reliability" },
                    { value: "15", label: "Module Types" }
                ],
                category: "Hardware Design",
                featured: true,
                status: "completed",
                shopifyButton: `<div id='product-component-1754098536272'></div>
<script type="text/javascript">
/*<![CDATA[*/
(function () {
  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy) {
    if (window.ShopifyBuy.UI) {
      ShopifyBuyInit();
    } else {
      loadScript();
    }
  } else {
    loadScript();
  }
  function loadScript() {
    var script = document.createElement('script');
    script.async = true;
    script.src = scriptURL;
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
    script.onload = ShopifyBuyInit;
  }
  function ShopifyBuyInit() {
    var client = ShopifyBuy.buildClient({
      domain: 'vgmt5b-hv.myshopify.com',
      storefrontAccessToken: '50e50d8f740c890c352c5362ed921d10',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: '7649078247475',
        node: document.getElementById('product-component-1754098536272'),
        moneyFormat: '%24%7B%7Bamount%7D%7D',
        options: {
  "product": {
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "calc(25% - 20px)",
          "margin-left": "20px",
          "margin-bottom": "50px"
        }
      }
    },
    "contents": {
      "img": false,
      "title": false,
      "price": false
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "productSet": {
    "styles": {
      "products": {
        "@media (min-width: 601px)": {
          "margin-left": "-20px"
        }
      }
    }
  },
  "modalProduct": {
    "contents": {
      "img": false,
      "imgWithCarousel": true,
      "button": false,
      "buttonWithQuantity": true
    },
    "styles": {
      "product": {
        "@media (min-width: 601px)": {
          "max-width": "100%",
          "margin-left": "0px",
          "margin-bottom": "0px"
        }
      }
    },
    "text": {
      "button": "Add to cart"
    }
  },
  "option": {},
  "cart": {
    "text": {
      "total": "Subtotal",
      "button": "Checkout"
    }
  },
  "toggle": {}
},
      });
    });
  }
})();
/*]]>*/
</script>`
            },
            {
                id: 2,
                title: "Inventory Management Platform",
                description: "Digital tool for tracking and optimizing physical product inventory across multiple locations.",
                image: "https://via.placeholder.com/600x400/f8f9fa/495057?text=Inventory+Platform",
                tags: ["Software", "Logistics", "Analytics"],
                detailImages: [
                    "https://via.placeholder.com/800x600/f8f9fa/495057?text=Dashboard+View",
                    "https://via.placeholder.com/800x600/e9ecef/495057?text=Analytics+Panel",
                    "https://via.placeholder.com/800x600/dee2e6/495057?text=Mobile+Interface"
                ],
                longDescription: "Comprehensive platform for managing physical inventory across distributed locations. System integrates barcode scanning, predictive analytics, and automated reordering to minimize stockouts while optimizing storage costs.\n\nCore functionality:\n• Real-time inventory tracking\n• Predictive demand modeling\n• Automated procurement workflows\n• Multi-location synchronization\n• Integration with existing ERP systems",
                year: "2023",
                client: "Global Retail Chain",
                duration: "12 months",
                teamSize: "8 developers",
                role: "UX Lead & Product Designer",
                challenge: "Creating an intuitive interface for complex inventory operations while ensuring real-time data accuracy across 50+ locations.",
                solution: "Developed a progressive web app with offline capabilities and smart notification system to guide users through optimal inventory decisions.",
                results: "Reduced inventory costs by 25% and improved stock availability by 30% across all locations.",
                metrics: [
                    { value: "25%", label: "Cost Reduction" },
                    { value: "30%", label: "Stock Availability" },
                    { value: "50+", label: "Locations Managed" }
                ],
                category: "Software Design",
                featured: true,
                status: "completed",
                shopifyButton: ""
            },
            {
                id: 3,
                title: "Sustainable Lighting System",
                description: "Environmentally conscious lighting fixtures with intelligent control and minimal material waste.",
                image: "https://via.placeholder.com/600x400/e8f5e8/2e7d32?text=Lighting+System",
                tags: ["Lighting", "Sustainability", "IoT"],
                detailImages: [
                    "https://via.placeholder.com/800x600/e8f5e8/2e7d32?text=Fixture+Design",
                    "https://via.placeholder.com/800x600/c8e6c9/2e7d32?text=Control+Interface",
                    "https://via.placeholder.com/800x600/a5d6a7/2e7d32?text=Installation"
                ],
                longDescription: "Design and engineering of a modular lighting system prioritizing material efficiency and longevity. Each fixture incorporates recyclable components, field-replaceable LED modules, and intelligent dimming controls.\n\nSustainability features:\n• 95% recyclable materials\n• 50,000+ hour LED lifespan\n• Daylight harvesting sensors\n• Occupancy-based dimming\n• Minimal packaging design\n• Local manufacturing capability",
                year: "2024",
                client: "Green Architecture Firm",
                duration: "6 months",
                teamSize: "4 designers",
                role: "Sustainable Design Lead",
                challenge: "Balancing environmental impact with performance requirements while maintaining cost-effectiveness for commercial applications.",
                solution: "Engineered a modular system using bio-based materials with intelligent controls that adapt to natural light patterns and occupancy.",
                results: "Achieved 60% energy reduction compared to traditional systems while maintaining superior light quality and user satisfaction.",
                metrics: [
                    { value: "60%", label: "Energy Reduction" },
                    { value: "95%", label: "Recyclable Materials" },
                    { value: "50,000+", label: "Hour LED Lifespan" }
                ],
                category: "Product Design",
                featured: false,
                status: "completed",
                shopifyButton: '<div style="text-align: center;"><button style="background: #2e7d32; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-family: inherit; cursor: pointer; width: 100%;">Pre-order Lighting System - $199</button></div>'
            }
        ];
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '';

        this.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            projectsGrid.appendChild(projectCard);
        });
    }

    createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.addEventListener('click', () => this.openProjectModal(project));

        // Extract first sentence or paragraph for card preview
        const getCardDescription = (description) => {
            if (!description) return '';
            
            // Remove markdown formatting and get first paragraph
            const cleanText = description
                .replace(/\n+/g, ' ')  // Replace newlines with spaces
                .replace(/[-*]\s+/g, '') // Remove list markers
                .trim();
            
            // Get first sentence or truncate at reasonable length
            const firstSentence = cleanText.split('.')[0];
            if (firstSentence.length > 150) {
                return firstSentence.substring(0, 147) + '...';
            }
            return firstSentence + (cleanText.includes('.') ? '.' : '');
        };

        card.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-overlay">
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${getCardDescription(project.description)}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    openProjectModal(project) {
        // This method will be overridden by the enhanced version
        console.log('Opening project modal for:', project.title);
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

// Enhanced Portfolio Manager
class EnhancedPortfolioManager extends PortfolioManager {
    constructor() {
        super();
        this.caseStudyModal = null;
    }
    
    async init() {
        await this.loadProjects();
        this.renderProjects();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        
        // Initialize the enhanced case study modal
        this.caseStudyModal = new CaseStudyModal(this);
    }
    
    openProjectModal(project) {
        // Use the new case study modal instead of the old modal
        this.caseStudyModal.openCaseStudy(project, this.projects);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppManager();
    app.init();
});
