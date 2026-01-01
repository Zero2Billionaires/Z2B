import fetch from 'node-fetch';

/**
 * Glowie AI Service
 * Handles AI-powered app generation using Claude and other AI models
 */

class GlowieAI {
    constructor() {
        this.claudeApiUrl = 'https://api.anthropic.com/v1/messages';
        this.claudeVersion = '2023-06-01';
        this.defaultModel = 'claude-sonnet-4-20250514';
        this.maxTokens = 4096;
    }

    /**
     * Build prompt for app generation
     */
    buildPrompt(description, appType, features, colorScheme) {
        const featuresList = Object.entries(features)
            .filter(([key, value]) => value)
            .map(([key]) => this.formatFeatureName(key))
            .join(', ');

        const colorSchemeDesc = this.getColorSchemeDescription(colorScheme);

        return `You are an expert web developer and UI/UX designer. Create a complete, production-ready, single-file HTML application based on the following requirements:

APP DESCRIPTION:
${description}

APP TYPE: ${appType}
${this.getAppTypeGuidelines(appType)}

REQUIRED FEATURES:
${featuresList || 'Standard features'}

COLOR SCHEME: ${colorScheme}
${colorSchemeDesc}

TECHNICAL REQUIREMENTS:
1. Create a COMPLETE, SELF-CONTAINED HTML file with embedded CSS and JavaScript
2. The app must be fully functional and production-ready
3. Use modern HTML5, CSS3, and vanilla JavaScript (ES6+)
4. Include Bootstrap 5 and Font Awesome 6 from CDN for styling and icons
5. Make it visually stunning with smooth animations and modern design principles
6. Add proper error handling and user feedback mechanisms
7. Include helpful comments in the code for maintainability
8. Ensure all interactive features work perfectly
9. Make the design responsive and mobile-friendly
10. Add loading states and transitions for better UX

DESIGN GUIDELINES:
- Use modern card-based layouts with subtle shadows
- Implement smooth hover effects and transitions
- Add appropriate spacing and typography hierarchy
- Include a professional color palette
- Ensure high contrast for accessibility
- Add micro-interactions for user engagement

IMPORTANT: Respond with ONLY the complete HTML code. No explanations, no markdown code blocks, no extra text - just the raw HTML file content that can be saved and opened directly in a browser. The response should start with <!DOCTYPE html> and end with </html>.`;
    }

    /**
     * Format feature name for prompt
     */
    formatFeatureName(feature) {
        const featureMap = {
            mobile: 'Mobile Responsive Design',
            darkMode: 'Dark Mode Toggle',
            localStorage: 'Local Storage Persistence',
            animations: 'Smooth Animations',
            icons: 'Icon Integration',
            modern: 'Modern UI Design'
        };
        return featureMap[feature] || feature;
    }

    /**
     * Get color scheme description
     */
    getColorSchemeDescription(scheme) {
        const schemes = {
            z2b: 'Use the Z2B brand colors: Navy Blue (#0A2647) as primary, Gold (#FFD700) as accent, Orange (#FF6B35) for CTAs, and Dark Navy (#051428) for backgrounds.',
            modern: 'Use a modern tech palette: Deep Blue (#2C3E50) as primary, Purple (#9B59B6) as accent, Teal (#4ECDC4) for highlights.',
            vibrant: 'Use vibrant colors: Coral Orange (#FF6B6B) as primary, Turquoise (#4ECDC4) as accent, Sunny Yellow (#FFE66D) for highlights.',
            minimal: 'Use a minimal palette: Pure Black (#000000) as primary, Pure White (#FFFFFF) as background, with Gray (#666666) for text.',
            custom: 'Use colors based on the app description and context.'
        };
        return schemes[scheme] || schemes.custom;
    }

    /**
     * Get app type specific guidelines
     */
    getAppTypeGuidelines(appType) {
        const guidelines = {
            landing: `
Guidelines for Landing Page:
- Hero section with compelling headline and CTA
- Feature showcase with icons and descriptions
- Social proof section (testimonials, stats)
- Clear call-to-action buttons throughout
- FAQ or features section
- Contact or signup form`,

            dashboard: `
Guidelines for Dashboard:
- Top navigation with user menu
- Sidebar with navigation links
- Main content area with data cards
- Charts and statistics displays
- Quick action buttons
- Responsive grid layout for widgets`,

            form: `
Guidelines for Form/Survey:
- Clear progress indicator
- Logical field grouping
- Proper input validation
- Helpful error messages
- Auto-save functionality
- Success confirmation page`,

            game: `
Guidelines for Game:
- Game canvas or play area
- Score display and timer
- Clear game controls
- Start/pause/reset functionality
- Instructions modal
- Animations for interactions`,

            tool: `
Guidelines for Tool/Utility:
- Clear input areas
- Instant results display
- Copy/download functionality
- Settings or options panel
- Help or documentation section
- Keyboard shortcuts`,

            other: `
Guidelines:
- Clear purpose and navigation
- Intuitive user interface
- Responsive design
- Proper error handling
- User feedback mechanisms`
        };

        return guidelines[appType] || guidelines.other;
    }

    /**
     * Generate app using Claude AI
     */
    async generateWithClaude(description, appType, features, colorScheme, apiKey) {
        const startTime = Date.now();

        try {
            // Build the prompt
            const prompt = this.buildPrompt(description, appType, features, colorScheme);

            // Call Claude API
            const response = await fetch(this.claudeApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': this.claudeVersion
                },
                body: JSON.stringify({
                    model: this.defaultModel,
                    max_tokens: this.maxTokens,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();

            // Extract generated code
            if (!data.content || !data.content[0] || !data.content[0].text) {
                throw new Error('Invalid response from Claude API - no content returned');
            }

            let generatedCode = data.content[0].text.trim();

            // Clean up the code (remove any markdown if present)
            generatedCode = this.cleanGeneratedCode(generatedCode);

            // Validate that it's HTML
            if (!generatedCode.includes('<!DOCTYPE html>') && !generatedCode.includes('<html')) {
                throw new Error('Generated content is not valid HTML');
            }

            const generationTime = Date.now() - startTime;

            return {
                success: true,
                code: generatedCode,
                generationTime,
                model: this.defaultModel,
                tokensUsed: data.usage?.output_tokens || 0,
                promptUsed: prompt
            };

        } catch (error) {
            console.error('Claude API error:', error);

            return {
                success: false,
                error: error.message,
                generationTime: Date.now() - startTime
            };
        }
    }

    /**
     * Clean generated code (remove markdown formatting if present)
     */
    cleanGeneratedCode(code) {
        // Remove markdown code blocks if present
        code = code.replace(/^```html\s*/i, '');
        code = code.replace(/^```\s*/i, '');
        code = code.replace(/\s*```$/i, '');

        // Trim whitespace
        code = code.trim();

        return code;
    }

    /**
     * Generate app name from description
     */
    generateAppName(description) {
        // Extract potential name from description
        const words = description.toLowerCase().split(' ');
        const stopWords = ['a', 'an', 'the', 'build', 'create', 'make', 'app', 'application'];
        const meaningfulWords = words
            .filter(word => !stopWords.includes(word) && word.length > 3)
            .slice(0, 3);

        if (meaningfulWords.length > 0) {
            return meaningfulWords
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') + ' App';
        }

        return `App ${Date.now()}`;
    }

    /**
     * Extract tags from description
     */
    extractTags(description, appType) {
        const tags = [appType];

        const keywords = {
            'task': ['todo', 'task', 'productivity'],
            'game': ['game', 'play', 'fun'],
            'calculator': ['calculator', 'calc', 'math'],
            'form': ['form', 'survey', 'quiz'],
            'dashboard': ['dashboard', 'analytics', 'stats'],
            'e-commerce': ['shop', 'store', 'cart', 'product'],
            'social': ['social', 'chat', 'messaging'],
            'finance': ['finance', 'money', 'budget', 'expense']
        };

        const lowerDesc = description.toLowerCase();

        for (const [tag, words] of Object.entries(keywords)) {
            if (words.some(word => lowerDesc.includes(word))) {
                tags.push(tag);
            }
        }

        return [...new Set(tags)]; // Remove duplicates
    }

    /**
     * Validate app generation request
     */
    validateRequest(description, appType, features, colorScheme) {
        const errors = [];

        // Validate description
        if (!description || description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }

        if (description.length > 2000) {
            errors.push('Description cannot exceed 2000 characters');
        }

        // Validate app type
        const validAppTypes = ['landing', 'dashboard', 'form', 'game', 'tool', 'other'];
        if (!validAppTypes.includes(appType)) {
            errors.push(`Invalid app type. Must be one of: ${validAppTypes.join(', ')}`);
        }

        // Validate color scheme
        const validColorSchemes = ['z2b', 'modern', 'vibrant', 'minimal', 'custom'];
        if (!validColorSchemes.includes(colorScheme)) {
            errors.push(`Invalid color scheme. Must be one of: ${validColorSchemes.join(', ')}`);
        }

        // Validate features
        if (typeof features !== 'object') {
            errors.push('Features must be an object');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Generate app with fallback options
     */
    async generateApp(options) {
        const {
            description,
            appType,
            features,
            colorScheme,
            apiKey,
            preferredModel = 'claude'
        } = options;

        // Validate request
        const validation = this.validateRequest(description, appType, features, colorScheme);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', ')
            };
        }

        // Try to generate with Claude
        if (apiKey) {
            const result = await this.generateWithClaude(description, appType, features, colorScheme, apiKey);

            if (result.success) {
                // Add additional metadata
                result.appName = this.generateAppName(description);
                result.tags = this.extractTags(description, appType);
                return result;
            }

            // If failed, return the error
            return result;
        }

        return {
            success: false,
            error: 'No API key provided. Please configure your AI API key in settings.'
        };
    }
}

// Export singleton instance
const glowieAI = new GlowieAI();
export default glowieAI;
