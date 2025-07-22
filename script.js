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
            const response = await fetch('projects.json');
            this.projects = await response.json();
        } catch (error) {
            console.warn('Could not load projects.json, using default data');
            this.projects = this.getDefaultProjects();
        }
    }

    getDefaultProjects() {
        return [
            {
                id: 1,
                title: "E-commerce Mobile App",
                description: "A clean and intuitive mobile shopping experience focused on conversion and user engagement.",
                image: "https://via.placeholder.com/600x400/f5f5f5/666?text=E-commerce+App",
                tags: ["Mobile", "E-commerce", "UI/UX"],
                detailImages: [
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=App+Screens",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=User+Flow",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Design+System"
                ],
                longDescription: "This project involved redesigning a mobile e-commerce platform to improve user experience and increase conversion rates. The challenge was to create a streamlined shopping experience that would work across different device sizes while maintaining the brand's premium feel.\n\nKey achievements:\n• 40% increase in conversion rate\n• 25% reduction in cart abandonment\n• Improved accessibility compliance\n• Streamlined checkout process"
            },
            {
                id: 2,
                title: "SaaS Dashboard Design",
                description: "Data visualization and workflow optimization for a B2B analytics platform.",
                image: "https://via.placeholder.com/600x400/f5f5f5/666?text=SaaS+Dashboard",
                tags: ["Web", "SaaS", "Data Viz"],
                detailImages: [
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Dashboard+Overview",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Analytics+View",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Settings+Panel"
                ],
                longDescription: "A comprehensive redesign of a B2B analytics dashboard focusing on data clarity and user workflow efficiency. The project required extensive user research and iterative testing to ensure the complex data sets remained accessible and actionable.\n\nKey features:\n• Customizable dashboard layouts\n• Advanced filtering and search\n• Real-time data updates\n• Export and sharing capabilities\n• Mobile-responsive design"
            },
            {
                id: 3,
                title: "Brand Identity System",
                description: "Complete visual identity and brand guidelines for a sustainable fashion startup.",
                image: "https://via.placeholder.com/600x400/f5f5f5/666?text=Brand+Identity",
                tags: ["Branding", "Visual Identity", "Guidelines"],
                detailImages: [
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Logo+Variations",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Color+Palette",
                    "https://via.placeholder.com/800x600/f5f5f5/666?text=Typography+System"
                ],
                longDescription: "Development of a complete brand identity system for an eco-conscious fashion startup. The project included logo design, color palette, typography, packaging design, and comprehensive brand guidelines.\n\nDeliverables included:\n• Primary and secondary logos\n• Color system and palette\n• Typography hierarchy\n• Photography style guide\n• Packaging design templates\n• Digital and print applications"
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
