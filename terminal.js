/**
 * Terminal Prompt Functionality
 * Displays a minimal terminal when "/" is typed while mouse is over the site
 */

class TerminalPrompt {
    constructor() {
        this.isVisible = false;
        this.terminal = null;
        this.input = null;
        this.suggestions = null;
        this.currentSuggestionIndex = -1;
        this.availableProjects = []; // Will be populated from Google Sheets
        
        this.init();
    }

    init() {
        this.createTerminal();
        this.setupEventListeners();
        this.loadProjectData();
    }

    async loadProjectData() {
        try {
            // Wait for app manager to be available
            await this.waitForAppManager();
            
            // Get projects from the portfolio manager
            this.updateAvailableProjects();
            
            console.log('Terminal: Loaded', this.availableProjects.length, 'projects for navigation');
        } catch (error) {
            console.warn('Terminal: Could not load project data, using fallback', error);
            this.setFallbackProjects();
        }
    }

    async waitForAppManager(maxAttempts = 50) {
        // Wait for the app manager and projects to be loaded
        for (let i = 0; i < maxAttempts; i++) {
            if (window.appManager && 
                window.appManager.portfolioManager && 
                window.appManager.portfolioManager.projects && 
                window.appManager.portfolioManager.projects.length > 0) {
                return window.appManager;
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
        }
        throw new Error('App manager not available after waiting');
    }

    updateAvailableProjects() {
        const portfolioManager = window.appManager.portfolioManager;
        if (!portfolioManager || !portfolioManager.projects) {
            throw new Error('Portfolio manager or projects not available');
        }

        // Transform the loaded projects into terminal-friendly format
        this.availableProjects = portfolioManager.projects.map((project, index) => {
            return {
                id: index + 1,
                name: this.createSearchableName(project),
                fullName: project.title || `Project ${index + 1}`,
                originalProject: project // Keep reference to original project data
            };
        });

        // Add some common search terms based on project titles
        this.addSearchAliases();
    }

    createSearchableName(project) {
        // Create a searchable name from the project title
        if (!project.title) return `project-${project.id || 'unknown'}`;
        
        return project.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .trim();
    }

    addSearchAliases() {
        // Add common search terms and aliases
        const aliases = [];
        
        this.availableProjects.forEach(project => {
            const original = project.originalProject;
            
            // Add individual words as searchable terms
            if (original.title) {
                const words = original.title.toLowerCase().split(/\s+/);
                words.forEach(word => {
                    if (word.length > 2) { // Only add meaningful words
                        aliases.push({
                            id: project.id,
                            name: word,
                            fullName: `${original.title} (${word})`,
                            originalProject: original
                        });
                    }
                });
            }
            
            // Add category/type if available
            if (original.category) {
                aliases.push({
                    id: project.id,
                    name: original.category.toLowerCase(),
                    fullName: `${original.title} (${original.category})`,
                    originalProject: original
                });
            }
        });
        
        // Add aliases to the main list (avoiding duplicates)
        aliases.forEach(alias => {
            if (!this.availableProjects.find(p => p.name === alias.name && p.id === alias.id)) {
                this.availableProjects.push(alias);
            }
        });
    }

    setFallbackProjects() {
        // Fallback projects if Google Sheets data isn't available
        this.availableProjects = [
            { id: 1, name: 'project-1', fullName: 'Project 1' },
            { id: 2, name: 'project-2', fullName: 'Project 2' },
            { id: 3, name: 'project-3', fullName: 'Project 3' }
        ];
    }

    createTerminal() {
        // Check if terminal already exists in DOM
        const existingTerminal = document.getElementById('terminal-prompt');
        if (existingTerminal) {
            console.log('Terminal already exists in DOM, removing old one');
            existingTerminal.remove();
        }
        
        // Create terminal container
        this.terminal = document.createElement('div');
        this.terminal.id = 'terminal-prompt';
        this.terminal.className = 'terminal-prompt hidden';
        
        // Create input row
        const inputRow = document.createElement('div');
        inputRow.className = 'terminal-input-row';
        
        // Create prompt text
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt-text';
        prompt.textContent = '$ ';
        
        // Create input field
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'terminal-input';
        this.input.placeholder = 'Enter command... (ESC to close)';
        
        // Assemble input row
        inputRow.appendChild(prompt);
        inputRow.appendChild(this.input);
        
        // Create suggestions container
        this.suggestions = document.createElement('div');
        this.suggestions.className = 'terminal-suggestions hidden';
        
        // Assemble terminal
        this.terminal.appendChild(inputRow);
        this.terminal.appendChild(this.suggestions);
        
        // Add to body
        document.body.appendChild(this.terminal);
        
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .terminal-prompt {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                min-height: 40px;
                background-color: #000000;
                color: #ffffff;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', monospace;
                font-size: 14px;
                display: flex;
                flex-direction: column;
                z-index: 10000;
                box-sizing: border-box;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(100%);
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
            }

            .terminal-prompt:not(.hidden) {
                transform: translateY(0);
            }

            .terminal-prompt.hidden {
                transform: translateY(100%);
            }

            .terminal-input-row {
                display: flex;
                align-items: center;
                padding: 0 20px;
                height: 40px;
                background: linear-gradient(135deg, #000000 0%, #111111 100%);
            }

            .terminal-prompt-text {
                color: #ffffff;
                margin-right: 12px;
                font-weight: 600;
                font-size: 16px;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
            }

            .terminal-input {
                background: transparent;
                border: none;
                outline: none;
                color: #ffffff;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', monospace;
                font-size: 14px;
                flex: 1;
                caret-color: #ffffff;
                font-weight: 500;
            }

            .terminal-input::placeholder {
                color: #777777;
                font-style: italic;
            }

            .terminal-input:focus {
                outline: none;
            }

            .terminal-suggestions {
                background-color: #111111;
                max-height: 180px;
                overflow-y: auto;
                padding: 8px 0;
                background: linear-gradient(135deg, #111111 0%, #222222 100%);
            }

            .terminal-suggestions.hidden {
                display: none;
            }

            .suggestion-item {
                padding: 8px 20px;
                color: #ffffff;
                cursor: pointer;
                transition: all 0.2s ease;
                font-weight: 500;
            }

            .suggestion-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
                padding-left: 24px;
            }
            
            .suggestion-item.selected {
                background-color: rgba(255, 255, 255, 0.15);
                padding-left: 24px;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            }

            /* Color coding for different command types */
            .suggestion-item[data-command^="open"] {
                color: rgb(255, 99, 72); /* Orange-red for navigation commands */
            }
            
            .suggestion-item[data-command^="help"] {
                color: #2196F3; /* Blue for help commands */
            }
            
            .suggestion-item[data-command^="about"],
            .suggestion-item[data-command^="contact"],
            .suggestion-item[data-command^="work"] {
                color: #FF9800; /* Orange for info commands */
            }
            
            .suggestion-item[data-command^="hello"],
            .suggestion-item[data-command^="recolor"],
            .suggestion-item[data-command^="reset"] {
                color: #E91E63; /* Pink for fun/utility commands */
            }
            
            .suggestion-item[data-command^="list"],
            .suggestion-item[data-command^="random"],
            .suggestion-item[data-command^="next"],
            .suggestion-item[data-command^="prev"] {
                color: #9C27B0; /* Purple for portfolio commands */
            }

            .suggestion-item .suggestion-id {
                color: #888888;
                margin-right: 12px;
                font-size: 12px;
                opacity: 0.8;
            }

            /* Command type indicators */
            .suggestion-item::before {
                content: '';
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                margin-right: 8px;
                background-color: currentColor;
                opacity: 0.7;
            }

            /* Add bottom padding to body when terminal is visible */
            body.terminal-active {
                padding-bottom: 40px;
                transition: padding-bottom 0.3s ease-in-out;
            }
            
            /* Add extra padding to footer when terminal is active */
            body.terminal-active .footer {
                padding-bottom: 44px;
                transition: padding-bottom 0.3s ease-in-out;
            }
            
            /* Ensure footer content is never hidden */
            .footer {
                transition: padding-bottom 0.3s ease-in-out;
            }

            /* Scrollbar styling for suggestions */
            .terminal-suggestions::-webkit-scrollbar {
                width: 8px;
            }

            .terminal-suggestions::-webkit-scrollbar-track {
                background: #000000;
            }

            .terminal-suggestions::-webkit-scrollbar-thumb {
                background: #444444;
                border-radius: 4px;
            }

            .terminal-suggestions::-webkit-scrollbar-thumb:hover {
                background: #666666;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Listen for "`" key press (backtick/grave accent)
        document.addEventListener('keydown', (e) => {
            // Debug logging
            console.log('Key pressed:', e.key, 'Code:', e.code, 'Which:', e.which);
            
            // Check for backtick key (easier to press than tilde)
            const isBacktick = e.key === '`' || e.code === 'Backquote';
            
            // Only trigger if terminal is not already visible
            if (isBacktick && !this.isVisible) {
                // Prevent the "`" from being typed in any other input
                e.preventDefault();
                console.log('Terminal triggered!');
                this.showTerminal();
            }
            
            // Close terminal on Escape
            if (e.key === 'Escape' && this.isVisible) {
                this.hideTerminal();
            }
            
            // Dismiss hello mode on Escape
            if (e.key === 'Escape' && document.body.classList.contains('hello-mode')) {
                this.dismissHelloMode();
            }
            
            // Reset colors on Escape when in recolor mode
            if (e.key === 'Escape' && document.body.classList.contains('recolor-mode')) {
                this.resetColors();
            }
            
            // Handle Enter key in terminal - highest priority
            if (e.key === 'Enter' && this.isVisible && document.activeElement === this.input) {
                e.preventDefault(); // Prevent any default behavior
                this.handleCommand(this.input.value);
                return; // Exit early to prevent other handlers
            }
            
            // Handle Tab key for completion
            if (e.key === 'Tab' && this.isVisible && document.activeElement === this.input) {
                e.preventDefault();
                this.handleTabCompletion();
            }
            
            // Handle Arrow keys for suggestion navigation
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && this.isVisible && !this.suggestions.classList.contains('hidden')) {
                e.preventDefault();
                this.navigateSuggestions(e.key === 'ArrowDown' ? 1 : -1);
            }
        });

        // Close terminal when clicking outside
        document.addEventListener('click', (e) => {
            // Dismiss hello mode when clicking anywhere (highest priority)
            if (document.body.classList.contains('hello-mode')) {
                this.dismissHelloMode();
                return; // Exit early, don't process other click logic
            }
            
            // Close terminal when clicking outside (only if not in hello mode)
            if (this.isVisible && !this.terminal.contains(e.target)) {
                this.hideTerminal();
            }
        });

        // Prevent terminal from closing when clicking inside it
        this.terminal.addEventListener('click', (e) => {
            e.stopPropagation();
            this.input.focus();
        });

        // Handle input changes for real-time suggestions
        this.input.addEventListener('input', () => {
            this.handleInputChange();
        });
    }

    showTerminal() {
        console.log('showTerminal called');
        this.isVisible = true;
        this.terminal.classList.remove('hidden');
        document.body.classList.add('terminal-active');
        
        // Focus the input after a short delay to ensure visibility
        setTimeout(() => {
            this.input.focus();
            console.log('Terminal should be visible now');
        }, 200);
    }

    hideTerminal() {
        this.isVisible = false;
        this.terminal.classList.add('hidden');
        document.body.classList.remove('terminal-active');
        this.input.value = '';
        this.input.blur();
        this.hideSuggestions();
    }

    handleCommand(command) {
        console.log('handleCommand called with:', `"${command}"`);
        
        // Parse and execute command first
        const trimmedCommand = command.trim().toLowerCase();
        console.log('Trimmed command:', `"${trimmedCommand}"`);
        
        let shouldHideTerminal = true; // Default behavior
        
        if (trimmedCommand === 'hello nominalco') {
            console.log('Executing hello nominalco');
            this.executeHelloCommand();
        } else if (trimmedCommand === 'recolor the website') {
            console.log('Executing recolor the website');
            this.executeRecolorCommand();
        } else if (trimmedCommand === 'reset colors' || trimmedCommand === 'reset') {
            console.log('Executing reset');
            this.resetColors();
        } else if (trimmedCommand.startsWith('open ')) {
            console.log('Executing open command');
            this.executeOpenCommand(trimmedCommand);
        } else if (this.isNavigationCommand(trimmedCommand)) {
            console.log('Executing navigation command');
            this.executeNavigationCommand(trimmedCommand);
        } else if (this.isPortfolioCommand(trimmedCommand)) {
            console.log('Detected as portfolio command:', trimmedCommand);
            // Execute the portfolio command
            if (trimmedCommand === 'list projects') {
                console.log('Executing list projects');
                this.executePortfolioCommand(trimmedCommand);
                shouldHideTerminal = false; // Keep terminal open to show results
            } else if (trimmedCommand === 'help') {
                console.log('Executing help from portfolio');
                shouldHideTerminal = true; // These show overlays
            } else {
                console.log('Executing other portfolio command:', trimmedCommand);
                shouldHideTerminal = this.executePortfolioCommand(trimmedCommand);
            }
        } else if (trimmedCommand === 'help') {
            console.log('Executing help');
            shouldHideTerminal = true; // Help shows overlay
            this.showHelp();
        } else if (trimmedCommand === '') {
            console.log('Empty command');
            // Empty command - just hide terminal
            shouldHideTerminal = true;
        } else {
            console.log('Unknown command:', trimmedCommand);
            // Unknown command - show feedback in terminal, keep it open
            shouldHideTerminal = false;
            this.showCommandFeedback(`Unknown command: "${command}". Type "help" for available commands.`);
        }
        
        // Hide terminal only if the command doesn't need to show feedback
        if (shouldHideTerminal) {
            this.hideTerminal();
        } else {
            // Clear input but keep terminal open for feedback
            this.input.value = '';
        }
    }

    isNavigationCommand(command) {
        const navCommands = ['about', 'contact', 'work', 'top', 'home'];
        return navCommands.includes(command);
    }

    isPortfolioCommand(command) {
        const portfolioCommands = ['list projects', 'random project', 'next', 'prev'];
        return portfolioCommands.includes(command);
    }

    executeHelloCommand() {
        console.log('Executing hello nominalco command');
        
        // Add fade effect to everything except the top-left logo
        this.fadeToWhite();
        
        // Show response text after fade completes
        setTimeout(() => {
            this.showResponseText();
        }, 1000); // Wait for fade animation
    }

    fadeToWhite() {
        // Create overlay for fade effect
        const overlay = document.createElement('div');
        overlay.className = 'hello-overlay';
        document.body.appendChild(overlay);
        
        // Add fade styles
        const style = document.createElement('style');
        style.textContent = `
            .hello-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0);
                z-index: 9000;
                pointer-events: none;
                transition: background 1s ease-in-out;
            }
            
            .hello-overlay.active {
                background: rgba(255, 255, 255, 0.95);
            }
            
            .hello-mode .header .logo {
                position: relative;
                z-index: 9500;
            }
            
            .hello-response {
                position: fixed;
                top: 80px;
                left: 20px;
                font-family: 'Space Grotesk', sans-serif;
                font-size: 18px;
                color: #333;
                z-index: 9500;
                opacity: 0;
                white-space: nowrap;
                overflow: hidden;
                width: 0;
                animation: typewriter 2s steps(13) 0.5s forwards;
            }
            
            @keyframes typewriter {
                0% { opacity: 1; width: 0; }
                100% { opacity: 1; width: 13ch; }
            }
            
            .hello-response::after {
                content: '|';
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Add hello mode class to body
        document.body.classList.add('hello-mode');
        
        // Trigger fade
        setTimeout(() => {
            overlay.classList.add('active');
        }, 100);
    }

    showResponseText() {
        // Create response text element
        const responseText = document.createElement('div');
        responseText.className = 'hello-response';
        responseText.textContent = 'hello, user.';
        document.body.appendChild(responseText);
        
        // No auto-dismiss - stays until Escape is pressed
    }

    dismissHelloMode() {
        // Remove all hello mode elements and classes
        const overlay = document.querySelector('.hello-overlay');
        const responseText = document.querySelector('.hello-response');
        
        if (overlay) {
            overlay.style.transition = 'background 0.5s ease-in-out';
            overlay.style.background = 'rgba(255, 255, 255, 0)';
            setTimeout(() => overlay.remove(), 500);
        }
        
        if (responseText) {
            responseText.style.transition = 'opacity 0.5s ease-in-out';
            responseText.style.opacity = '0';
            setTimeout(() => responseText.remove(), 500);
        }
        
        document.body.classList.remove('hello-mode');
    }

    executeRecolorCommand() {
        console.log('Executing recolor the website command');
        
        // Apply random colors to text elements
        this.recolorText();
    }

    recolorText() {
        // Generate random vibrant colors
        const getRandomColor = () => {
            const colors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
                '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
                '#0FB9B1', '#F8B500', '#3742FA', '#2F3542', '#FF3838',
                '#70A1FF', '#5352ED', '#747D8C', '#A4B0BE', '#57606F',
                '#FF6348', '#FF4757', '#FF3742', '#FF6B9D', '#C44569',
                '#F8B500', '#F3A683', '#F7D794', '#778BEB', '#786FA6',
                '#F19066', '#F5CD79', '#546DE5', '#574B90', '#F8B500'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        // Target text elements (excluding the main logo)
        const textSelectors = [
            'p', 'h2', 'h3', 'h4', 'h5', 'h6', 
            '.hero-subtitle', '.section-title', 
            '.nav-links a', '.contact-link',
            '.footer-tagline', '.footer-copyright',
            '.project-description', '.about-content p',
            'span:not(.logo-heavy):not(.logo-light)'
        ];

        // Apply random colors with animation
        textSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                // Skip if it's part of the main logo
                if (element.closest('.header .logo')) return;
                
                setTimeout(() => {
                    const randomColor = getRandomColor();
                    element.style.transition = 'color 0.5s ease-in-out';
                    element.style.color = randomColor;
                    
                    // Add a subtle glow effect
                    element.style.textShadow = `0 0 10px ${randomColor}40`;
                }, index * 100); // Stagger the color changes
            });
        });

        // Add recolor mode class for potential additional styling
        document.body.classList.add('recolor-mode');
        
        // Add reset functionality
        this.addRecolorStyles();
    }

    addRecolorStyles() {
        // Add styles for recolor mode if not already added
        if (document.querySelector('#recolor-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'recolor-styles';
        style.textContent = `
            .recolor-mode {
                transition: all 0.3s ease-in-out;
            }
            
            .recolor-reset {
                animation: resetColors 0.5s ease-in-out;
            }
            
            @keyframes resetColors {
                0% { filter: hue-rotate(0deg); }
                50% { filter: hue-rotate(180deg); }
                100% { filter: hue-rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }

    resetColors() {
        // Reset all text colors to original
        const coloredElements = document.querySelectorAll('[style*="color"]');
        coloredElements.forEach(element => {
            if (!element.closest('.header .logo')) {
                element.style.transition = 'color 0.5s ease-in-out, text-shadow 0.5s ease-in-out';
                element.style.color = '';
                element.style.textShadow = '';
            }
        });
        
        document.body.classList.remove('recolor-mode');
        document.body.classList.add('recolor-reset');
        
        setTimeout(() => {
            document.body.classList.remove('recolor-reset');
        }, 500);
    }

    executeOpenCommand(command) {
        const parts = command.split(' ').slice(1); // Remove 'open'
        const target = parts.join(' ');
        
        // Try to find project by name or ID
        const project = this.findProject(target);
        
        if (project) {
            console.log(`Opening project: ${project.fullName}`);
            this.navigateToProject(project);
        } else {
            console.log(`Project not found: ${target}`);
            // Could add error message display here
        }
    }

    findProject(target) {
        const lowerTarget = target.toLowerCase();
        
        // Try exact name match first
        let project = this.availableProjects.find(p => p.name.toLowerCase() === lowerTarget);
        if (project) return project;
        
        // Try ID match (project 1, project 2, etc.)
        const idMatch = target.match(/^project\s+(\d+)$/i);
        if (idMatch) {
            const id = parseInt(idMatch[1]);
            project = this.availableProjects.find(p => p.id === id);
            if (project) return project;
        }
        
        // Try partial name match
        project = this.availableProjects.find(p => p.name.toLowerCase().includes(lowerTarget));
        return project;
    }

    navigateToProject(project) {
        // Use the original project data if available
        const actualProject = project.originalProject || project;
        
        // Get the portfolio manager
        const appManager = window.appManager;
        if (!appManager || !appManager.portfolioManager) {
            console.log('Portfolio manager not available, trying fallback');
            this.scrollToWorkSection();
            return;
        }

        console.log(`Opening project: ${actualProject.title || project.fullName}`);
        
        // Use the existing openProjectModal method with the actual project data
        appManager.portfolioManager.openProjectModal(actualProject);
    }

    scrollToWorkSection() {
        // Fallback: scroll to the work section
        const workSection = document.querySelector('#work');
        if (workSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = workSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            console.log('Scrolled to work section as fallback');
        }
    }

    executeNavigationCommand(command) {
        console.log(`Executing navigation command: ${command}`);
        
        // Check if project modal is open and close it first
        this.closeProjectModalIfOpen();
        
        // Small delay to let modal close before scrolling
        setTimeout(() => {
            switch (command) {
                case 'about':
                    this.scrollToSection('#about');
                    break;
                case 'contact':
                    this.scrollToSection('#contact');
                    break;
                case 'work':
                    this.scrollToSection('#work');
                    break;
                case 'top':
                case 'home':
                    this.scrollToTop();
                    break;
            }
        }, 300); // Wait for modal close animation
    }

    closeProjectModalIfOpen() {
        console.log('Attempting to close project modal...');
        
        // Method 1: Check if project modal is open via app manager
        const appManager = window.appManager;
        if (appManager && appManager.portfolioManager) {
            console.log('Found app manager and portfolio manager');
            const portfolioManager = appManager.portfolioManager;
            const modal = portfolioManager.caseStudyModal;
            
            if (modal && modal.isOpen) {
                console.log('Modal is open, attempting to close...');
                
                // Try the close button
                const closeBtn = document.querySelector('.nav-close');
                if (closeBtn) {
                    console.log('Found close button, clicking...');
                    closeBtn.click();
                    return true;
                }
                
                // Try programmatic close
                if (modal.closeCaseStudy) {
                    console.log('Using programmatic close...');
                    modal.closeCaseStudy();
                    return true;
                }
            } else {
                console.log('Modal not open or not found via app manager');
            }
        } else {
            console.log('App manager or portfolio manager not found');
        }
        
        // Method 2: Look for modal elements directly
        const modalSelectors = [
            '#project-modal',
            '.case-study-modal',
            '.modal',
            '[class*="modal"]'
        ];
        
        for (const selector of modalSelectors) {
            const modalElement = document.querySelector(selector);
            if (modalElement) {
                console.log(`Found modal element: ${selector}`);
                
                // Check if it's visible
                const isVisible = !modalElement.classList.contains('hidden') && 
                                modalElement.style.display !== 'none' &&
                                window.getComputedStyle(modalElement).display !== 'none';
                
                if (isVisible) {
                    console.log(`Modal ${selector} is visible, closing...`);
                    
                    // Try to find and click close button within this modal
                    const closeButtons = modalElement.querySelectorAll('.nav-close, .close, .modal-close, [aria-label*="close"], [aria-label*="Close"]');
                    if (closeButtons.length > 0) {
                        console.log('Found close button in modal, clicking...');
                        closeButtons[0].click();
                        return true;
                    }
                    
                    // Try adding hidden class
                    modalElement.classList.add('hidden');
                    modalElement.style.display = 'none';
                    
                    // Restore body scrolling
                    document.body.style.overflow = '';
                    document.body.classList.remove('modal-open');
                    
                    console.log('Closed modal by hiding element');
                    return true;
                }
            }
        }
        
        // Method 3: Check for any element with modal-like properties
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            if (element.style.zIndex && parseInt(element.style.zIndex) > 1000) {
                const isVisible = window.getComputedStyle(element).display !== 'none' &&
                                window.getComputedStyle(element).visibility !== 'hidden' &&
                                window.getComputedStyle(element).opacity !== '0';
                
                if (isVisible && (element.offsetWidth > window.innerWidth * 0.5 || element.offsetHeight > window.innerHeight * 0.5)) {
                    console.log('Found potential modal by z-index and size:', element);
                    element.style.display = 'none';
                    document.body.style.overflow = '';
                    return true;
                }
            }
        }
        
        console.log('No open modal found');
        return false;
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = section.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            console.log(`Scrolled to ${selector}`);
        } else {
            console.log(`Section ${selector} not found`);
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('Scrolled to top');
    }

    executePortfolioCommand(command) {
        console.log(`Executing portfolio command: ${command}`);
        
        switch (command) {
            case 'list projects':
                this.listProjects();
                return false; // Keep terminal open (shows results in terminal)
            case 'random project':
                this.openRandomProject();
                return true; // Hide terminal (opens project)
            case 'next':
                return this.navigateProject(1); // Return based on success
            case 'prev':
                return this.navigateProject(-1); // Return based on success
            default:
                return true; // Hide terminal for unknown portfolio commands
        }
    }

    listProjects() {
        console.log('Available projects:');
        this.availableProjects.forEach((project, index) => {
            if (project.originalProject) {
                console.log(`${index + 1}. ${project.fullName}`);
            }
        });
        
        // Create a visual overlay to show projects
        this.showProjectsList();
    }

    openRandomProject() {
        const uniqueProjects = this.getUniqueProjects();
        if (uniqueProjects.length === 0) {
            console.log('No projects available');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * uniqueProjects.length);
        const randomProject = uniqueProjects[randomIndex];
        
        console.log(`Opening random project: ${randomProject.fullName}`);
        this.navigateToProject(randomProject);
    }

    navigateProject(direction) {
        // Check if project modal is open
        const appManager = window.appManager;
        if (!appManager || !appManager.portfolioManager) {
            this.showCommandFeedback('No project modal open. Open a project first with "open [project-name]"');
            return false; // Keep terminal open
        }

        const portfolioManager = appManager.portfolioManager;
        const modal = portfolioManager.caseStudyModal;

        if (!modal || !modal.modal || modal.modal.style.display === 'none') {
            this.showCommandFeedback('No project modal open. Open a project first with "open [project-name]"');
            return false; // Keep terminal open
        }

        // Get current project info for better feedback
        const currentIndex = modal.currentProjectIndex;
        const totalProjects = modal.projects.length;

        if (direction === 1) {
            // Next project
            if (currentIndex < totalProjects - 1) {
                modal.nextProject();
                const newProject = modal.projects[modal.currentProjectIndex];
                this.showCommandFeedback(`✓ Navigated to next project: "${newProject.title}" (${modal.currentProjectIndex + 1}/${totalProjects})`);
                return false; // Keep terminal open to show success message
            } else {
                this.showCommandFeedback(`Already at the last project: "${modal.projects[currentIndex].title}" (${totalProjects}/${totalProjects})`);
                return false; // Keep terminal open
            }
        } else if (direction === -1) {
            // Previous project
            if (currentIndex > 0) {
                modal.previousProject();
                const newProject = modal.projects[modal.currentProjectIndex];
                this.showCommandFeedback(`✓ Navigated to previous project: "${newProject.title}" (${modal.currentProjectIndex + 1}/${totalProjects})`);
                return false; // Keep terminal open to show success message
            } else {
                this.showCommandFeedback(`Already at the first project: "${modal.projects[currentIndex].title}" (1/${totalProjects})`);
                return false; // Keep terminal open
            }
        }

        return true; // Hide terminal (shouldn't reach here)
    }

    getUniqueProjects() {
        // Get unique projects (filter out aliases)
        const seen = new Set();
        return this.availableProjects.filter(project => {
            if (project.originalProject && !seen.has(project.originalProject.title || project.fullName)) {
                seen.add(project.originalProject.title || project.fullName);
                return true;
            }
            return false;
        });
    }

    handleInputChange() {
        const value = this.input.value;
        
        // Check if user is typing an 'open' command
        if (value.toLowerCase().startsWith('open ') && value.length > 5) {
            this.showSuggestions(value);
        } else {
            this.hideSuggestions();
        }
    }

    handleTabCompletion() {
        const value = this.input.value;
        const trimmedValue = value.trim();
        
        console.log('Tab completion triggered for:', `"${value}"`);
        
        // If empty or just starting, show all commands
        if (trimmedValue === '' || trimmedValue === 'open') {
            console.log('Showing all commands');
            this.showAllCommands();
            return;
        }
        
        // Handle "open " specifically for projects
        if (trimmedValue.toLowerCase() === 'open ' || trimmedValue.toLowerCase().startsWith('open ')) {
            console.log('Handling project completion for:', trimmedValue);
            this.handleProjectCompletion(trimmedValue);
            return;
        }
        
        // Handle general command completion
        console.log('Handling general completion for:', trimmedValue);
        this.handleGeneralCompletion(trimmedValue);
    }

    handleGeneralCompletion(input) {
        const allCommands = this.getAllAvailableCommands();
        const matches = allCommands.filter(cmd => 
            cmd.toLowerCase().startsWith(input.toLowerCase())
        );
        
        console.log('General completion - input:', input, 'matches:', matches);
        
        if (matches.length === 1) {
            // Single match - auto-complete
            console.log('Auto-completing to:', matches[0]);
            this.input.value = matches[0];
            this.hideSuggestions();
        } else if (matches.length > 1) {
            // Multiple matches - show suggestions
            console.log('Showing suggestions for multiple matches:', matches);
            this.showCommandSuggestions(matches, input);
        } else {
            // No matches
            console.log('No matches found for:', input);
            this.hideSuggestions();
        }
    }

    handleProjectCompletion(input) {
        if (input.toLowerCase() === 'open ' || input.toLowerCase() === 'open') {
            // Show all available projects
            this.showAllProjectSuggestions();
        } else {
            // Try to complete the current project input
            this.completeProjectName(input);
        }
    }

    getAllAvailableCommands() {
        return [
            // Basic commands
            'help',
            'hello nominalco',
            'recolor the website',
            'reset colors',
            'reset',
            
            // Navigation commands
            'about',
            'contact',
            'work',
            'top',
            'home',
            
            // Portfolio commands
            'list projects',
            'random project',
            'next',
            'prev',
            
            // Project commands (dynamic)
            ...this.getProjectCommands()
        ];
    }

    getProjectCommands() {
        // Only return commands for unique projects (not aliases)
        const uniqueProjects = this.getUniqueProjects();
        return uniqueProjects.map(project => `open ${project.name}`);
    }

    showAllCommands() {
        this.suggestions.innerHTML = '';
        this.currentSuggestionIndex = -1;
        
        const commands = this.getAllAvailableCommands();
        const categorizedCommands = this.categorizeCommands(commands);
        
        // Create categorized display
        Object.entries(categorizedCommands).forEach(([category, cmds]) => {
            // Add category header
            const header = document.createElement('div');
            header.className = 'suggestion-category';
            header.textContent = category;
            this.suggestions.appendChild(header);
            
            // Add commands in this category
            cmds.forEach(cmd => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = cmd;
                item.setAttribute('data-command', cmd);
                item.addEventListener('click', () => {
                    this.selectCommand(cmd);
                });
                this.suggestions.appendChild(item);
            });
        });
        
        this.suggestions.classList.remove('hidden');
        this.addCommandSuggestionStyles();
    }

    categorizeCommands(commands) {
        const categories = {
            'Navigation': [],
            'Portfolio': [],
            'Visual Effects': [],
            'Projects': [],
            'Utility': []
        };
        
        commands.forEach(cmd => {
            if (['about', 'contact', 'work', 'top', 'home'].includes(cmd)) {
                categories['Navigation'].push(cmd);
            } else if (['list projects', 'random project', 'next', 'prev'].includes(cmd)) {
                categories['Portfolio'].push(cmd);
            } else if (['hello nominalco', 'recolor the website', 'reset colors', 'reset'].includes(cmd)) {
                categories['Visual Effects'].push(cmd);
            } else if (cmd.startsWith('open ')) {
                categories['Projects'].push(cmd);
            } else {
                categories['Utility'].push(cmd);
            }
        });
        
        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });
        
        return categories;
    }

    showCommandSuggestions(matches, input) {
        this.suggestions.innerHTML = '';
        this.currentSuggestionIndex = -1;
        
        matches.forEach(cmd => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('data-command', cmd);
            
            // Highlight matching part
            const matchIndex = cmd.toLowerCase().indexOf(input.toLowerCase());
            if (matchIndex === 0) {
                const beforeMatch = cmd.substring(0, input.length);
                const afterMatch = cmd.substring(input.length);
                item.innerHTML = `<span class="suggestion-match">${beforeMatch}</span>${afterMatch}`;
            } else {
                item.textContent = cmd;
            }
            
            item.addEventListener('click', () => {
                this.selectCommand(cmd);
            });
            this.suggestions.appendChild(item);
        });
        
        this.suggestions.classList.remove('hidden');
        this.addCommandSuggestionStyles();
    }

    selectCommand(command) {
        this.input.value = command;
        this.hideSuggestions();
        this.input.focus();
    }

    addCommandSuggestionStyles() {
        if (document.querySelector('#command-suggestion-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'command-suggestion-styles';
        style.textContent = `
            .suggestion-category {
                padding: 8px 20px;
                background: linear-gradient(135deg, #222222 0%, #333333 100%);
                color: #cccccc;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 4px 0;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            .suggestion-match {
                background: rgba(255, 255, 255, 0.2);
                color: #ffffff;
                padding: 1px 3px;
                border-radius: 2px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    showAllProjectSuggestions() {
        this.suggestions.innerHTML = '';
        this.currentSuggestionIndex = -1;
        
        // Get unique projects only
        const uniqueProjects = this.getUniqueProjects();
        
        uniqueProjects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('data-command', `open ${project.name}`);
            item.innerHTML = `<span class="suggestion-id">project ${project.id}</span>${project.fullName}`;
            item.addEventListener('click', () => {
                this.selectSuggestion(project);
            });
            this.suggestions.appendChild(item);
        });
        
        this.suggestions.classList.remove('hidden');
    }

    showSuggestions(input) {
        const searchTerm = input.substring(5).toLowerCase(); // Remove 'open '
        
        // Search in unique projects first, then fall back to aliases if needed
        const uniqueProjects = this.getUniqueProjects();
        let matches = uniqueProjects.filter(project => 
            project.fullName.toLowerCase().includes(searchTerm) ||
            project.name.toLowerCase().includes(searchTerm) ||
            `project ${project.id}`.includes(searchTerm)
        );
        
        // If no matches in main projects, search aliases
        if (matches.length === 0) {
            matches = this.availableProjects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                `project ${project.id}`.includes(searchTerm)
            );
        }
        
        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.suggestions.innerHTML = '';
        this.currentSuggestionIndex = -1;
        
        matches.forEach(project => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.setAttribute('data-command', `open ${project.name}`);
            
            // Show full name for unique projects, or name for aliases
            const displayName = project.originalProject ? project.fullName : project.name;
            item.innerHTML = `<span class="suggestion-id">project ${project.id}</span>${displayName}`;
            
            item.addEventListener('click', () => {
                this.selectSuggestion(project);
            });
            this.suggestions.appendChild(item);
        });
        
        this.suggestions.classList.remove('hidden');
    }

    completeProjectName(input) {
        const searchTerm = input.substring(5).toLowerCase(); // Remove 'open '
        const matches = this.availableProjects.filter(project => 
            project.name.toLowerCase().startsWith(searchTerm)
        );
        
        if (matches.length === 1) {
            // Auto-complete with the single match
            this.input.value = `open ${matches[0].name}`;
            this.hideSuggestions();
        } else if (matches.length > 1) {
            // Show suggestions for multiple matches
            this.showSuggestions(input);
        }
    }

    selectSuggestion(project) {
        // Use the project name for the command, not the display name
        this.input.value = `open ${project.name}`;
        this.hideSuggestions();
        this.input.focus();
    }

    navigateSuggestions(direction) {
        const items = this.suggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;
        
        // Remove current selection
        if (this.currentSuggestionIndex >= 0 && items[this.currentSuggestionIndex]) {
            items[this.currentSuggestionIndex].classList.remove('selected');
        }
        
        // Update index
        this.currentSuggestionIndex += direction;
        
        // Wrap around
        if (this.currentSuggestionIndex >= items.length) {
            this.currentSuggestionIndex = 0;
        } else if (this.currentSuggestionIndex < 0) {
            this.currentSuggestionIndex = items.length - 1;
        }
        
        // Apply new selection
        if (items[this.currentSuggestionIndex]) {
            items[this.currentSuggestionIndex].classList.add('selected');
            
            // Get the actual command to use in input
            const selectedText = this.getCommandFromSuggestionItem(items[this.currentSuggestionIndex]);
            this.input.value = selectedText;
            
            // Scroll selected item into view
            items[this.currentSuggestionIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    getCommandFromSuggestionItem(item) {
        // Check if this item has a data-command attribute (for projects)
        const command = item.getAttribute('data-command');
        if (command) {
            return command;
        }
        
        // For non-project suggestions, just return the text content
        return item.textContent;
    }

    hideSuggestions() {
        this.suggestions.classList.add('hidden');
        this.currentSuggestionIndex = -1;
    }

    showHelp() {
        console.log('Available commands:');
        console.log('Navigation: about, contact, work, top, home');
        console.log('Portfolio: list projects, random project, next, prev');
        console.log('Visual: hello nominalco, recolor the website, reset');
        console.log('Projects: open [project-name]');
        
        // Show visual help overlay
        this.showHelpOverlay();
    }

    showProjectsList() {
        // Debug project loading
        console.log('showProjectsList called');
        console.log('Available projects:', this.availableProjects.length);
        
        // Get unique projects
        const uniqueProjects = this.getUniqueProjects();
        console.log('Unique projects:', uniqueProjects.length);
        
        if (uniqueProjects.length === 0) {
            this.showCommandFeedback('No projects available. Try waiting a moment for projects to load, then try again.');
            return;
        }

        // Create terminal display of projects
        let projectsList = 'Available Projects:\n\n';
        uniqueProjects.forEach((project, index) => {
            projectsList += `${index + 1}. ${project.fullName}\n`;
            projectsList += `   Command: open ${project.name}\n\n`;
        });
        
        projectsList += `\nTotal: ${uniqueProjects.length} projects\n`;
        projectsList += 'Type "open [project-name]" to open a project';
        
        this.showCommandFeedback(projectsList);
        console.log('Projects listed in terminal');
    }

    showHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'help-overlay';
        
        const container = document.createElement('div');
        container.className = 'help-container';
        
        container.innerHTML = `
            <div class="help-header">
                <h2>Terminal Command Reference</h2>
                <p class="help-subtitle">Interactive portfolio navigation and commands</p>
            </div>
            
            <div class="help-grid">
                <div class="help-section navigation">
                    <div class="help-section-header">
                        <h3>Navigation</h3>
                    </div>
                    <div class="help-commands">
                        <div class="help-command">
                            <code class="cmd-nav">open [project]</code>
                            <span class="cmd-desc">Open specific project</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-nav">about</code>
                            <span class="cmd-desc">Go to about section</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-nav">contact</code>
                            <span class="cmd-desc">Go to contact section</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-nav">work</code>
                            <span class="cmd-desc">Go to work section</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-nav">top</code> / <code class="cmd-nav">home</code>
                            <span class="cmd-desc">Return to top</span>
                        </div>
                    </div>
                </div>

                <div class="help-section portfolio">
                    <div class="help-section-header">
                        <h3>Portfolio</h3>
                    </div>
                    <div class="help-commands">
                        <div class="help-command">
                            <code class="cmd-portfolio">list projects</code>
                            <span class="cmd-desc">Show all projects</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-portfolio">random project</code>
                            <span class="cmd-desc">Open random project</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-portfolio">next</code>
                            <span class="cmd-desc">Next project (in modal)</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-portfolio">prev</code>
                            <span class="cmd-desc">Previous project (in modal)</span>
                        </div>
                    </div>
                </div>

                <div class="help-section effects">
                    <div class="help-section-header">
                        <h3>Visual Effects</h3>
                    </div>
                    <div class="help-commands">
                        <div class="help-command">
                            <code class="cmd-effects">hello nominalco</code>
                            <span class="cmd-desc">Hello animation effect</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-effects">recolor the website</code>
                            <span class="cmd-desc">Apply random colors</span>
                        </div>
                        <div class="help-command">
                            <code class="cmd-effects">reset</code>
                            <span class="cmd-desc">Reset all effects</span>
                        </div>
                    </div>
                </div>

                <div class="help-section help">
                    <div class="help-section-header">
                        <h3>Help & Tips</h3>
                    </div>
                    <div class="help-commands">
                        <div class="help-command">
                            <code class="cmd-help">help</code>
                            <span class="cmd-desc">Show this help menu</span>
                        </div>
                        <div class="help-tip">
                            <strong>Tip:</strong> Use <kbd>\`</kbd> (backtick) to open terminal
                        </div>
                        <div class="help-tip">
                            <strong>Tip:</strong> Use <kbd>Tab</kbd> for command completion
                        </div>
                        <div class="help-tip">
                            <strong>Tip:</strong> Use <kbd>↑</kbd>/<kbd>↓</kbd> to navigate suggestions
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="help-footer">
                <p>Press <kbd>Escape</kbd> or click outside to close</p>
            </div>
        `;
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        this.addHelpStyles();
        
        // Close on escape
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        };
        
        document.addEventListener('keydown', closeHandler);
        overlay.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                overlay.remove();
                document.removeEventListener('keydown', closeHandler);
            }
        });
    }

    addProjectsListStyles() {
        if (document.querySelector('#projects-list-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'projects-list-styles';
        style.textContent = `
            .projects-list-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-in-out;
                backdrop-filter: blur(10px);
            }
            
            .projects-list-container {
                background: linear-gradient(135deg, #000000 0%, #111111 100%);
                color: #ffffff;
                padding: 40px;
                border-radius: 12px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', monospace;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .projects-list-title {
                margin: 0 0 30px 0;
                color: #ffffff;
                font-size: 24px;
                font-weight: 600;
                text-align: center;
                letter-spacing: -0.5px;
            }
            
            .projects-list-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                margin: 8px 0;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s ease;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .projects-list-item:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateX(4px);
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            .project-number {
                color: #888888;
                margin-right: 16px;
                min-width: 30px;
                font-weight: 600;
                font-size: 14px;
            }
            
            .project-name {
                flex: 1;
                margin-right: 16px;
                font-weight: 500;
                color: #ffffff;
            }
            
            .project-command {
                color: rgb(255, 99, 72);
                font-size: 12px;
                font-weight: 500;
                background: rgba(255, 99, 72, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                font-family: inherit;
            }
            
            .projects-list-instruction {
                margin: 30px 0 0 0;
                text-align: center;
                color: #888888;
                font-size: 13px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            /* Scrollbar styling */
            .projects-list-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .projects-list-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }
            
            .projects-list-container::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            
            .projects-list-container::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .projects-list-container {
                    margin: 20px;
                    padding: 30px 20px;
                    max-width: calc(100vw - 40px);
                }
                
                .projects-list-item {
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }
                
                .project-number {
                    margin-bottom: 5px;
                }
                
                .project-command {
                    margin-top: 5px;
                    align-self: flex-end;
                }
            }
        `;
        document.head.appendChild(style);
    }

    addHelpStyles() {
        if (document.querySelector('#help-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'help-styles';
        style.textContent = `
            .help-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease-in-out;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }
            
            .help-container {
                background: transparent;
                -webkit-backdrop-filter: blur(10px);
                color: #000000;
                padding: 40px;
                border-radius: 12px;
                max-width: 900px;
                max-height: 85vh;
                overflow-y: auto;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', monospace;
                position: relative;
                border: 1px solid rgba(255, 255, 255, 0.3);
                
            }
            
            .help-header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #eeeeee;
                padding-bottom: 20px;
            }
            
            .help-header h2 {
                margin: 0 0 10px 0;
                color: #000000;
                font-size: 28px;
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            
            .help-subtitle {
                margin: 0;
                color: #666666;
                font-size: 14px;
                font-style: italic;
            }
            
            .help-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .help-section {
                background: rgba(255, 255, 255, 0.4);
                border-radius: 8px;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.6);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            
            .help-section-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.5);
            }
            
            .help-section h3 {
                margin: 0;
                color: #000000;
                font-size: 16px;
                font-weight: 600;
            }
            
            .help-commands {
                margin: 0;
            }
            
            .help-command {
                display: flex;
                align-items: center;
                margin: 10px 0;
                font-size: 13px;
                line-height: 1.4;
                color: #000000;
            }
            
            .help-command code {
                background: rgba(0, 0, 0, 0.1);
                padding: 4px 8px;
                border-radius: 4px;
                margin-right: 12px;
                min-width: 120px;
                display: inline-block;
                font-size: 12px;
                font-weight: 500;
                border: 1px solid rgba(0, 0, 0, 0.1);
                color: #000000;
            }
            
            /* Color coding for command types */
            .cmd-nav {
                color: rgb(255, 99, 72) !important;
                background: rgba(255, 99, 72, 0.1) !important;
                border-color: rgba(255, 99, 72, 0.3) !important;
            }
            
            .cmd-portfolio {
                color: #9C27B0 !important;
                background: rgba(156, 39, 176, 0.1) !important;
                border-color: rgba(156, 39, 176, 0.3) !important;
            }
            
            .cmd-effects {
                color: #E91E63 !important;
                background: rgba(233, 30, 99, 0.1) !important;
                border-color: rgba(233, 30, 99, 0.3) !important;
            }
            
            .cmd-help {
                color: #2196F3 !important;
                background: rgba(33, 150, 243, 0.1) !important;
                border-color: rgba(33, 150, 243, 0.3) !important;
            }
            
            .cmd-desc {
                color: #444444;
                font-size: 13px;
            }
            
            .help-tip {
                margin: 8px 0;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
                font-size: 12px;
                color: #666666;
                border-left: 3px solid #cccccc;
            }
            
            .help-tip strong {
                color: #000000;
            }
            
            .help-tip kbd {
                background: rgba(0, 0, 0, 0.1);
                color: #000000;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                font-family: inherit;
                border: 1px solid rgba(0, 0, 0, 0.2);
            }
            
            .help-footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eeeeee;
                color: #666666;
                font-size: 12px;
            }
            
            .help-footer kbd {
                background: rgba(0, 0, 0, 0.1);
                color: #000000;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 11px;
                margin: 0 2px;
                border: 1px solid rgba(0, 0, 0, 0.2);
            }
            
            /* Scrollbar styling */
            .help-container::-webkit-scrollbar {
                width: 8px;
            }
            
            .help-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 4px;
            }
            
            .help-container::-webkit-scrollbar-thumb {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 4px;
            }
            
            .help-container::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 0, 0, 0.3);
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            /* Responsive design */
            @media (max-width: 768px) {
                .help-container {
                    margin: 20px;
                    padding: 30px 20px;
                    max-width: calc(100vw - 40px);
                }
                
                .help-grid {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                
                .help-command {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .help-command code {
                    margin-bottom: 5px;
                    margin-right: 0;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showCommandFeedback(message) {
        // Create or update feedback element in terminal
        let feedback = this.terminal.querySelector('.terminal-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'terminal-feedback';
            this.terminal.appendChild(feedback);
            
            // Add styles for feedback
            this.addFeedbackStyles();
        }
        
        feedback.textContent = message;
        feedback.style.display = 'block';
        
        // Auto-hide feedback after 3 seconds
        setTimeout(() => {
            if (feedback) {
                feedback.style.display = 'none';
            }
        }, 3000);
    }

    addFeedbackStyles() {
        if (document.querySelector('#terminal-feedback-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'terminal-feedback-styles';
        style.textContent = `
            .terminal-feedback {
                padding: 12px 20px;
                background: linear-gradient(135deg, #111111 0%, #222222 100%);
                color: #ffffff;
                font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Menlo', 'Consolas', monospace;
                font-size: 14px;
                font-weight: 500;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: none;
                animation: feedbackSlide 0.3s ease-in-out;
                line-height: 1.4;
                white-space: pre-line;
            }
            
            @keyframes feedbackSlide {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Singleton pattern to prevent multiple terminals
let terminalInstance = null;

function initializeTerminal() {
    if (terminalInstance) {
        console.log('Terminal already initialized');
        return terminalInstance;
    }
    
    terminalInstance = new TerminalPrompt();
    console.log('Terminal initialized');
    return terminalInstance;
}

// Initialize terminal when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTerminal);
} else {
    initializeTerminal();
}