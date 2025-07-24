// Application Manager - coordinates loading and initialization
class AppManager {
    constructor() {
        this.contentManager = null;
        this.portfolioManager = null;
        this.isContentLoaded = false;
        this.isProjectsLoaded = false;
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize content and portfolio managers in parallel
            const [contentManager, portfolioManager] = await Promise.all([
                this.initContentManager(),
                this.initPortfolioManager()
            ]);

            this.contentManager = contentManager;
            this.portfolioManager = portfolioManager;

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
        const portfolioManager = new PortfolioManager();
        await portfolioManager.init();
        return portfolioManager;
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

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
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

        // Handle dynamic content areas
        this.applyDynamicContent();
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
        this.currentProjectIndex = projects.findIndex(p => p.id === project.id);
        
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
        if (projectCategory && project.tags && project.tags.length > 0) {
            projectCategory.textContent = project.tags[0];
        }
        if (projectYear) {
            projectYear.textContent = new Date().getFullYear(); // Default to current year
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
        
        // Populate gallery
        this.populateGallery(project.detailImages || [project.image]);
        
        // Populate next project
        this.populateNextProject();
        
        // Update navigation
        this.updateNavigation();
    }
    
    populateGallery(images) {
        const gallery = this.modal.querySelector('#project-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        // Filter out empty or invalid images
        const validImages = images.filter(img => img && img.trim() !== '');
        
        if (validImages.length === 0) {
            gallery.innerHTML = '<p>No additional images available for this project.</p>';
            return;
        }
        
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

// Enhanced Portfolio Manager
class EnhancedPortfolioManager extends PortfolioManager {
    constructor() {
        super();
        this.caseStudyModal = null;
    }
    
    async init() {
        await this.loadProjects();
        this.setupDOM();
        this.renderProjects();
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        
        // Initialize the enhanced case study modal
        this.caseStudyModal = new CaseStudyModal(this);
    }
    
    setupDOM() {
        // No longer need the old modal elements, but keep for compatibility
        this.modal = document.getElementById('project-modal');
    }
    
    openProjectModal(project) {
        // Use the new case study modal instead of the old modal
        this.caseStudyModal.openCaseStudy(project, this.projects);
    }
    
    // Remove the old modal methods
    closeProjectModal() {
        // This method is now handled by CaseStudyModal
        if (this.caseStudyModal) {
            this.caseStudyModal.closeCaseStudy();
        }
    }
    
    setupEventListeners() {
        // Remove old modal event listeners since CaseStudyModal handles them
        // Keep keyboard navigation for compatibility
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.closeProjectModal();
            }
        });
    }
}

// Update the AppManager to use the enhanced portfolio manager
class AppManager {
    constructor() {
        this.contentManager = null;
        this.portfolioManager = null;
        this.isContentLoaded = false;
        this.isProjectsLoaded = false;
    }

    async init() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Initialize content and portfolio managers in parallel
            const [contentManager, portfolioManager] = await Promise.all([
                this.initContentManager(),
                this.initPortfolioManager()
            ]);

            this.contentManager = contentManager;
            this.portfolioManager = portfolioManager;

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
                id: parseInt(row.c[0]?.v) || (i + 1),
                title: row.c[1]?.v?.trim() || 'Untitled Project',
                description: rawDescription,
                descriptionHtml: this.convertMarkdownToHtml(rawDescription),
                image: this.processImageUrl(row.c[3]?.v),
                tags: this.processTags(row.c[4]?.v),
                detailImages: this.processDetailImages(row.c[5]?.v),
                longDescription: this.processLongDescription(row.c[6]?.v)
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

    parseCSVLine(line) {
        // This method is now replaced by the improved parseCSV method above
        // Keeping for compatibility but not used
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    transformSheetData(sheetData) {
        return sheetData.map(row => {
            // Handle empty rows
            if (!row.title || row.title.trim() === '') {
                return null;
            }

            const rawDescription = row.description?.trim() || '';
            return {
                id: parseInt(row.id) || Date.now(),
                title: row.title?.trim() || 'Untitled Project',
                description: rawDescription,
                descriptionHtml: this.convertMarkdownToHtml(rawDescription),
                image: this.processImageUrl(row.image),
                tags: this.processTags(row.tags),
                detailImages: this.processDetailImages(row.detailImages),
                longDescription: this.processLongDescription(row.longDescription)
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

        // Clean and normalize the input
        let processed = longDesc
            .replace(/\\n/g, '\n')  // Handle escaped newlines
            .replace(/\r\n/g, '\n') // Handle Windows line endings
            .replace(/\r/g, '\n')   // Handle Mac line endings
            .trim();

        // Split into blocks by double line breaks
        const blocks = processed.split(/\n\s*\n/);
        const result = [];

        for (let block of blocks) {
            block = block.trim();
            if (!block) continue;

            const lines = block.split('\n');
            
            // Check if this block is a list (all lines start with - or *)
            const isListBlock = lines.every(line => {
                const trimmed = line.trim();
                return trimmed === '' || trimmed.match(/^[-*]\s+/);
            });

            if (isListBlock) {
                // Process as a list
                const listItems = lines
                    .map(line => line.trim())
                    .filter(line => line.match(/^[-*]\s+/))
                    .map(line => line.replace(/^[-*]\s+/, ''));
                
                if (listItems.length > 0) {
                    result.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`);
                }
            } else {
                // Process as paragraph(s)
                // Check if any lines in this block are list items
                const paragraphLines = [];
                const listItems = [];
                
                for (let line of lines) {
                    line = line.trim();
                    if (line.match(/^[-*]\s+/)) {
                        // If we have paragraph content, add it first
                        if (paragraphLines.length > 0) {
                            result.push(`<p>${paragraphLines.join(' ')}</p>`);
                            paragraphLines.length = 0;
                        }
                        listItems.push(line.replace(/^[-*]\s+/, ''));
                    } else if (line) {
                        // If we have list items, add them first
                        if (listItems.length > 0) {
                            result.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`);
                            listItems.length = 0;
                        }
                        paragraphLines.push(line);
                    }
                }
                
                // Add remaining content
                if (listItems.length > 0) {
                    result.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join('')}</ul>`);
                }
                if (paragraphLines.length > 0) {
                    result.push(`<p>${paragraphLines.join(' ')}</p>`);
                }
            }
        }

        return result.join('');
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
                longDescription: "Development of a modular audio interface system that bridges professional studio equipment with modern digital workflows. The project required extensive research into signal processing, electromagnetic compatibility, and user interface design.\n\nTechnical specifications:\n• 24-bit/192kHz conversion\n• Modular I/O expansion\n• Software-controlled routing matrix\n• USB-C and Thunderbolt connectivity\n• Field-replaceable components"
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
                longDescription: "Comprehensive platform for managing physical inventory across distributed locations. System integrates barcode scanning, predictive analytics, and automated reordering to minimize stockouts while optimizing storage costs.\n\nCore functionality:\n• Real-time inventory tracking\n• Predictive demand modeling\n• Automated procurement workflows\n• Multi-location synchronization\n• Integration with existing ERP systems"
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
                longDescription: "Design and engineering of a modular lighting system prioritizing material efficiency and longevity. Each fixture incorporates recyclable components, field-replaceable LED modules, and intelligent dimming controls.\n\nSustainability features:\n• 95% recyclable materials\n• 50,000+ hour LED lifespan\n• Daylight harvesting sensors\n• Occupancy-based dimming\n• Minimal packaging design\n• Local manufacturing capability"
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
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${getCardDescription(project.description)}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        return card;
    }

    openProjectModal(project) {
        const detailImagesHTML = project.detailImages ? 
            `<div class="project-images-grid">
                ${project.detailImages.map(img => 
                    `<img src="${img}" alt="${project.title} detail" class="project-detail-img">`
                ).join('')}
            </div>` : '';

        // Use the converted HTML description, fallback to longDescription, then plain description
        let descriptionHTML = '';
        if (project.descriptionHtml && project.descriptionHtml.trim() !== '') {
            descriptionHTML = project.descriptionHtml;
        } else if (project.longDescription && project.longDescription.trim() !== '') {
            descriptionHTML = project.longDescription;
        } else {
            descriptionHTML = `<p>${project.description}</p>`;
        }

        this.modalBody.innerHTML = `
            <div class="project-detail">
                <img src="${project.image}" alt="${project.title}" class="project-detail-image">
                <h2>${project.title}</h2>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="project-detail-description">
                    ${descriptionHTML}
                </div>
                ${detailImagesHTML}
            </div>
        `;

        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeProjectModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    setupEventListeners() {
        // Modal close events
        this.closeBtn.addEventListener('click', () => this.closeProjectModal());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeProjectModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.closeProjectModal();
            }
        });
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

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AppManager();
    app.init();
});
