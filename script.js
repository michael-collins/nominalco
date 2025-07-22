// Project data and functionality
class PortfolioManager {
    constructor() {
        this.projects = [];
        this.modal = document.getElementById('project-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.querySelector('.close');
        
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.renderProjects();
        this.setupEventListeners();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    }

    async loadProjects() {
        try {
            // Pull directly from Google Sheets CSV export (no third-party service needed)
            const SHEET_ID = '10Ze__9S_rwj_HWnJEMH-pArREc_XheP5NCJNohJVtkc';
            const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name
            const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
            
            const response = await fetch(csvUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Google Sheets');
            }
            
            const csvText = await response.text();
            const data = this.parseCSV(csvText);
            this.projects = this.transformSheetData(data);
            
            console.log('✅ Projects loaded directly from Google Sheets');
        } catch (error) {
            console.warn('⚠️ Could not load from Google Sheets, using local data');
            console.warn('Error:', error.message);
            
            // Fallback to local JSON file
            try {
                const response = await fetch('projects.json');
                this.projects = await response.json();
            } catch (fallbackError) {
                console.warn('⚠️ Could not load projects.json, using default data');
                this.projects = this.getDefaultProjects();
            }
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = this.parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = this.parseCSVLine(lines[i]);
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
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

    transformSheetData(sheetData) {
        return sheetData.map(row => {
            // Handle empty rows
            if (!row.title || row.title.trim() === '') {
                return null;
            }

            return {
                id: parseInt(row.id) || Date.now(),
                title: row.title?.trim() || 'Untitled Project',
                description: row.description?.trim() || '',
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

    processLongDescription(longDesc) {
        if (!longDesc || longDesc.trim() === '') {
            return '';
        }

        // Convert Google Sheets line breaks and formatting
        return longDesc
            .replace(/\\n/g, '\n')  // Handle escaped newlines
            .replace(/\n\n/g, '\n\n') // Preserve paragraph breaks
            .trim();
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

        card.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
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

        this.modalBody.innerHTML = `
            <div class="project-detail">
                <img src="${project.image}" alt="${project.title}" class="project-detail-image">
                <h2>${project.title}</h2>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="project-detail-description">
                    ${project.longDescription ? 
                        project.longDescription.split('\n').map(para => `<p>${para}</p>`).join('') :
                        `<p>${project.description}</p>`
                    }
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

// Initialize the portfolio when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioManager();
});
