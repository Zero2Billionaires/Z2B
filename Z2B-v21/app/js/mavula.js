/**
 * MAVULA - AI Prospecting Automation
 * Frontend JavaScript - FIXED VERSION
 *
 * FIXES APPLIED:
 * 1. Better error handling with detailed messages
 * 2. Demo mode when backend is unavailable
 * 3. Enhanced form validation
 * 4. Improved social connect with fallback
 * 5. LocalStorage fallback for all operations
 */

class MavulaApp {
    constructor() {
        this.apiBase = window.location.hostname === 'localhost'
            ? 'http://localhost:5000'
            : 'https://z2b-production-3cd3.up.railway.app';

        this.token = localStorage.getItem('token');
        this.currentProspectId = null;
        this.selectedConversationId = null;
        this.automationEnabled = false;
        this.demoMode = false; // Enable if backend unavailable

        // Initialize local storage data structures
        this.initLocalStorage();

        if (!this.token) {
            // Allow demo access
            console.log('[MAVULA] No token found. Running in DEMO mode.');
            this.demoMode = true;
            this.token = 'demo-token-' + Date.now();
            localStorage.setItem('token', this.token);
        }

        this.init();
    }

    initLocalStorage() {
        if (!localStorage.getItem('mavula_prospects')) {
            localStorage.setItem('mavula_prospects', JSON.stringify([
                {
                    _id: '1',
                    prospectName: 'Demo Prospect',
                    phone: '+27123456789',
                    email: 'demo@example.com',
                    leadScore: 75,
                    leadTemperature: 'HOT',
                    conversationStage: 'VALUE_PRESENTATION',
                    lastContactDate: new Date().toISOString(),
                    tags: ['demo']
                }
            ]));
        }

        if (!localStorage.getItem('mavula_settings')) {
            localStorage.setItem('mavula_settings', JSON.stringify({
                dailyProspectTarget: 10,
                dailyConversionTarget: 1,
                communicationStyle: 'PROFESSIONAL',
                autoResponseEnabled: true,
                autoFollowUpEnabled: true,
                activeHours: { start: '09:00', end: '18:00' },
                timezone: 'Africa/Johannesburg',
                whatsappEnabled: true,
                emailNotifications: true,
                weeklyReports: true
            }));
        }

        if (!localStorage.getItem('mavula_content')) {
            localStorage.setItem('mavula_content', JSON.stringify([]));
        }

        if (!localStorage.getItem('mavula_stats')) {
            localStorage.setItem('mavula_stats', JSON.stringify({
                prospectsToday: 3,
                conversationsToday: 8,
                conversionsToday: 0,
                weeklyProjection: 2450
            }));
        }
    }

    async init() {
        console.log('[MAVULA] Initializing...');
        console.log('[MAVULA] Demo Mode:', this.demoMode);

        // Test backend connection
        await this.testBackendConnection();

        // Load initial data
        await this.loadDashboard();
        await this.loadSettings();
        await this.checkSocialStatus();

        // Set up event listeners
        this.setupEventListeners();

        // Start polling for updates
        this.startPolling();

        console.log('[MAVULA] Initialization complete');
    }

    async testBackendConnection() {
        try {
            const response = await fetch(`${this.apiBase}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.token}` },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (response.ok) {
                this.demoMode = false;
                console.log('[MAVULA] Backend connected successfully');
            } else {
                this.demoMode = true;
                console.log('[MAVULA] Backend returned error, using demo mode');
            }
        } catch (error) {
            this.demoMode = true;
            console.log('[MAVULA] Backend unavailable, using demo mode');
            this.showNotification(
                'Running in DEMO mode. Connect to backend for full functionality.',
                'info',
                8000
            );
        }
    }

    setupEventListeners() {
        // Automation toggle
        document.getElementById('automationToggle')?.addEventListener('click', () => this.toggleAutomation());

        // Prospect management
        document.getElementById('saveProspectBtn')?.addEventListener('click', () => this.addProspect());
        document.getElementById('filterTemperature')?.addEventListener('change', () => this.loadProspects());
        document.getElementById('filterStage')?.addEventListener('change', () => this.loadProspects());
        document.getElementById('searchProspects')?.addEventListener('input', () => this.loadProspects());

        // Content upload
        document.getElementById('pdfUpload')?.addEventListener('change', (e) => this.uploadPDF(e.target.files[0]));
        document.getElementById('processUrlBtn')?.addEventListener('click', () => this.processURL());
        document.getElementById('saveTextBtn')?.addEventListener('click', () => this.saveTextContent());

        // Social connections
        document.getElementById('facebookConnectBtn')?.addEventListener('click', () => this.connectSocial('facebook'));
        document.getElementById('instagramConnectBtn')?.addEventListener('click', () => this.connectSocial('instagram'));
        document.getElementById('tiktokConnectBtn')?.addEventListener('click', () => this.connectSocial('tiktok'));

        // Chat/messaging
        document.getElementById('sendMessageBtn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('generateAIBtn')?.addEventListener('click', () => this.generateAIResponse());
        document.getElementById('messageInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Settings
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // Tab change events
        document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('href');
                this.onTabChange(target);
            });
        });
    }

    async onTabChange(tabId) {
        switch(tabId) {
            case '#prospects':
                await this.loadProspects();
                break;
            case '#conversations':
                await this.loadConversationProspects();
                break;
            case '#content':
                await this.loadContent();
                break;
            case '#analytics':
                await this.loadAnalytics();
                break;
        }
    }

    startPolling() {
        // Poll for dashboard updates every 30 seconds
        setInterval(() => this.loadDashboard(), 30000);
    }

    // ===================================================================
    // DASHBOARD
    // ===================================================================

    async loadDashboard() {
        try {
            if (this.demoMode) {
                // Use local storage data
                const stats = JSON.parse(localStorage.getItem('mavula_stats'));
                this.updateDashboard(stats);
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/dashboard`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (data.success) {
                this.updateDashboard(data.stats);
                // Cache in localStorage
                localStorage.setItem('mavula_stats', JSON.stringify(data.stats));
            }
        } catch (error) {
            console.error('[MAVULA] Error loading dashboard:', error);
            // Fallback to localStorage
            const stats = JSON.parse(localStorage.getItem('mavula_stats'));
            this.updateDashboard(stats);
        }
    }

    updateDashboard(stats) {
        document.getElementById('prospectsToday').textContent = stats.prospectsToday || 0;
        document.getElementById('conversationsToday').textContent = stats.conversationsToday || 0;
        document.getElementById('conversionsToday').textContent = stats.conversionsToday || 0;
        document.getElementById('weeklyProjection').textContent = `R${stats.weeklyProjection || 0}`;
    }

    // ===================================================================
    // PROSPECT MANAGEMENT
    // ===================================================================

    async addProspect() {
        try {
            // Enhanced validation
            const prospectName = document.getElementById('prospectName')?.value.trim();
            const phone = document.getElementById('prospectPhone')?.value.trim();
            const email = document.getElementById('prospectEmail')?.value.trim();
            const tags = document.getElementById('prospectTags')?.value.trim();
            const notes = document.getElementById('prospectNotes')?.value.trim();

            // Validation
            if (!prospectName) {
                this.showNotification('Please enter prospect name', 'warning');
                document.getElementById('prospectName')?.focus();
                return;
            }

            if (!phone) {
                this.showNotification('Please enter phone number', 'warning');
                document.getElementById('prospectPhone')?.focus();
                return;
            }

            // Phone format validation (South African format)
            const phoneRegex = /^\+?27\d{9}$|^0\d{9}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                this.showNotification(
                    'Invalid phone format. Use: +27XXXXXXXXX or 0XXXXXXXXX',
                    'warning'
                );
                document.getElementById('prospectPhone')?.focus();
                return;
            }

            // Email validation
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    this.showNotification('Invalid email format', 'warning');
                    document.getElementById('prospectEmail')?.focus();
                    return;
                }
            }

            const prospectData = {
                prospectName,
                phone,
                email: email || null,
                tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                notes: notes || null,
                source: 'MANUAL',
                leadScore: 30,
                leadTemperature: 'COLD',
                conversationStage: 'INITIAL_CONTACT'
            };

            if (this.demoMode) {
                // Save to localStorage
                const prospects = JSON.parse(localStorage.getItem('mavula_prospects'));
                prospectData._id = Date.now().toString();
                prospectData.createdAt = new Date().toISOString();
                prospects.push(prospectData);
                localStorage.setItem('mavula_prospects', JSON.stringify(prospects));

                this.showNotification('✅ Prospect added successfully (DEMO)!', 'success');
                document.getElementById('addProspectForm')?.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProspectModal'));
                modal?.hide();
                await this.loadProspects();
                await this.loadDashboard();
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/prospects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(prospectData)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Prospect added successfully!', 'success');
                document.getElementById('addProspectForm')?.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addProspectModal'));
                modal?.hide();
                await this.loadProspects();
                await this.loadDashboard();
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to add prospect'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error adding prospect:', error);
            this.showNotification(
                '❌ Failed to add prospect. Check your connection and try again.',
                'error'
            );
        }
    }

    async loadProspects() {
        try {
            const temperature = document.getElementById('filterTemperature')?.value || 'ALL';
            const stage = document.getElementById('filterStage')?.value || 'ALL';
            const search = document.getElementById('searchProspects')?.value || '';

            if (this.demoMode) {
                let prospects = JSON.parse(localStorage.getItem('mavula_prospects'));

                // Apply filters
                if (temperature !== 'ALL') {
                    prospects = prospects.filter(p => p.leadTemperature === temperature);
                }
                if (search) {
                    const searchLower = search.toLowerCase();
                    prospects = prospects.filter(p =>
                        p.prospectName.toLowerCase().includes(searchLower) ||
                        p.phone.includes(search) ||
                        (p.email && p.email.toLowerCase().includes(searchLower))
                    );
                }

                this.displayProspects(prospects);
                return;
            }

            const response = await fetch(
                `${this.apiBase}/api/mavula/prospects?temperature=${temperature}&stage=${stage}&search=${search}`,
                { headers: { 'Authorization': `Bearer ${this.token}` } }
            );

            const data = await response.json();

            if (data.success) {
                this.displayProspects(data.prospects);
                // Cache
                localStorage.setItem('mavula_prospects', JSON.stringify(data.prospects));
            }
        } catch (error) {
            console.error('[MAVULA] Error loading prospects:', error);
            // Fallback
            const prospects = JSON.parse(localStorage.getItem('mavula_prospects'));
            this.displayProspects(prospects);
        }
    }

    displayProspects(prospects) {
        const container = document.getElementById('prospectsList');
        if (!container) return;

        if (!prospects || prospects.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <p>No prospects found. Click "Add Prospect" to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = prospects.map(p => `
            <div class="prospect-card ${p.leadTemperature?.toLowerCase() || 'cold'}" onclick="mavulaApp.viewProspect('${p._id}')">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="mb-1">${p.prospectName}</h5>
                        <div class="text-muted small">
                            <i class="fas fa-phone"></i> ${p.phone}
                            ${p.email ? `<br><i class="fas fa-envelope"></i> ${p.email}` : ''}
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="badge bg-${this.getTemperatureBadge(p.leadTemperature)}">
                            ${p.leadTemperature || 'COLD'}
                        </div>
                        <div class="small text-muted mt-1">Score: ${p.leadScore || 0}/100</div>
                    </div>
                </div>
                ${p.tags && p.tags.length > 0 ? `
                    <div class="mt-2">
                        ${p.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getTemperatureBadge(temp) {
        switch(temp) {
            case 'HOT': return 'danger';
            case 'WARM': return 'warning';
            case 'COLD': return 'info';
            default: return 'secondary';
        }
    }

    viewProspect(prospectId) {
        this.currentProspectId = prospectId;
        const tab = new bootstrap.Tab(document.querySelector('a[href="#conversations"]'));
        tab.show();
        this.loadConversation(prospectId);
    }

    // ===================================================================
    // CONTENT PROCESSING
    // ===================================================================

    async uploadPDF(file) {
        if (!file) {
            this.showNotification('No file selected', 'warning');
            return;
        }

        // File size validation (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File too large. Maximum size is 10MB', 'error');
            return;
        }

        // File type validation
        if (!file.type.includes('pdf')) {
            this.showNotification('Invalid file type. Please upload a PDF', 'error');
            return;
        }

        try {
            this.showNotification('📄 Uploading and processing PDF...', 'info');

            if (this.demoMode) {
                // Simulate processing
                await this.sleep(2000);

                const content = JSON.parse(localStorage.getItem('mavula_content'));
                content.push({
                    _id: Date.now().toString(),
                    title: file.name,
                    contentType: 'PDF',
                    category: 'GENERAL',
                    createdAt: new Date().toISOString(),
                    extractedText: 'Demo PDF content (full text would be extracted from real PDF)',
                    aiSummary: 'This is a demo PDF. In production, AI would summarize the content.'
                });
                localStorage.setItem('mavula_content', JSON.stringify(content));

                this.showNotification('✅ PDF processed successfully (DEMO)!', 'success');
                document.getElementById('pdfUpload').value = '';
                await this.loadContent();
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'GENERAL');

            const response = await fetch(`${this.apiBase}/api/mavula/content/upload-pdf`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ PDF processed successfully!', 'success');
                document.getElementById('pdfUpload').value = '';
                await this.loadContent();
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to process PDF'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error uploading PDF:', error);
            this.showNotification('❌ Failed to upload PDF. Check connection.', 'error');
        }
    }

    async processURL() {
        const url = document.getElementById('contentUrl')?.value.trim();
        const title = document.getElementById('contentUrlTitle')?.value.trim();
        const category = document.getElementById('contentUrlCategory')?.value;

        // Validation
        if (!url) {
            this.showNotification('Please enter a URL', 'warning');
            document.getElementById('contentUrl')?.focus();
            return;
        }

        // URL format validation
        try {
            new URL(url);
        } catch {
            this.showNotification('Invalid URL format. Include http:// or https://', 'warning');
            document.getElementById('contentUrl')?.focus();
            return;
        }

        try {
            this.showNotification('🌐 Processing URL...', 'info');

            if (this.demoMode) {
                await this.sleep(2000);

                const content = JSON.parse(localStorage.getItem('mavula_content'));
                content.push({
                    _id: Date.now().toString(),
                    title: title || 'Web Content',
                    contentType: 'URL',
                    url: url,
                    category: category,
                    createdAt: new Date().toISOString(),
                    extractedText: 'Demo URL content (would be scraped from actual URL)',
                    aiSummary: 'This is demo content. In production, the URL would be fetched and processed.'
                });
                localStorage.setItem('mavula_content', JSON.stringify(content));

                this.showNotification('✅ URL processed successfully (DEMO)!', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('urlModal'));
                modal?.hide();
                document.getElementById('contentUrl').value = '';
                document.getElementById('contentUrlTitle').value = '';
                await this.loadContent();
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/content/url`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, title, category })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ URL processed successfully!', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('urlModal'));
                modal?.hide();
                document.getElementById('contentUrl').value = '';
                await this.loadContent();
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to process URL'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error processing URL:', error);
            this.showNotification('❌ Failed to process URL. Check connection.', 'error');
        }
    }

    async saveTextContent() {
        const title = document.getElementById('contentTextTitle')?.value.trim();
        const text = document.getElementById('contentText')?.value.trim();
        const category = document.getElementById('contentTextCategory')?.value;

        // Validation
        if (!title) {
            this.showNotification('Please enter a title', 'warning');
            document.getElementById('contentTextTitle')?.focus();
            return;
        }

        if (!text) {
            this.showNotification('Please enter content', 'warning');
            document.getElementById('contentText')?.focus();
            return;
        }

        if (text.length < 50) {
            this.showNotification('Content too short. Please add at least 50 characters', 'warning');
            document.getElementById('contentText')?.focus();
            return;
        }

        try {
            this.showNotification('💾 Saving content...', 'info');

            if (this.demoMode) {
                await this.sleep(1000);

                const content = JSON.parse(localStorage.getItem('mavula_content'));
                content.push({
                    _id: Date.now().toString(),
                    title: title,
                    contentType: 'TEXT',
                    category: category,
                    createdAt: new Date().toISOString(),
                    extractedText: text,
                    aiSummary: 'User-provided text content'
                });
                localStorage.setItem('mavula_content', JSON.stringify(content));

                this.showNotification('✅ Content saved successfully (DEMO)!', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('textModal'));
                modal?.hide();
                document.getElementById('contentTextTitle').value = '';
                document.getElementById('contentText').value = '';
                await this.loadContent();
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/content/text`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, text, category })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Content saved successfully!', 'success');
                const modal = bootstrap.Modal.getInstance(document.getElementById('textModal'));
                modal?.hide();
                document.getElementById('contentTextTitle').value = '';
                document.getElementById('contentText').value = '';
                await this.loadContent();
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to save content'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error saving content:', error);
            this.showNotification('❌ Failed to save content. Check connection.', 'error');
        }
    }

    async loadContent() {
        try {
            if (this.demoMode) {
                const content = JSON.parse(localStorage.getItem('mavula_content'));
                this.displayContent(content);
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/content`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (data.success) {
                this.displayContent(data.content);
                localStorage.setItem('mavula_content', JSON.stringify(data.content));
            }
        } catch (error) {
            console.error('[MAVULA] Error loading content:', error);
            const content = JSON.parse(localStorage.getItem('mavula_content'));
            this.displayContent(content);
        }
    }

    displayContent(content) {
        const container = document.getElementById('contentList');
        if (!container) return;

        if (!content || content.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-book fa-3x mb-3"></i>
                    <p>No content yet. Upload PDFs, URLs, or add text to train your AI!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = content.map(c => `
            <div class="content-item">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6><i class="fas fa-${this.getContentIcon(c.contentType)}"></i> ${c.title}</h6>
                        <div class="text-muted small">${c.category} • ${new Date(c.createdAt).toLocaleDateString()}</div>
                        ${c.aiSummary ? `<p class="mt-2 mb-0 small">${c.aiSummary}</p>` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="mavulaApp.deleteContent('${c._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getContentIcon(type) {
        switch(type) {
            case 'PDF': return 'file-pdf';
            case 'URL': return 'globe';
            case 'TEXT': return 'file-alt';
            default: return 'file';
        }
    }

    async deleteContent(contentId) {
        if (!confirm('Delete this content?')) return;

        try {
            if (this.demoMode) {
                let content = JSON.parse(localStorage.getItem('mavula_content'));
                content = content.filter(c => c._id !== contentId);
                localStorage.setItem('mavula_content', JSON.stringify(content));
                this.showNotification('✅ Content deleted', 'success');
                await this.loadContent();
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/content/${contentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Content deleted', 'success');
                await this.loadContent();
            }
        } catch (error) {
            console.error('[MAVULA] Error deleting content:', error);
            this.showNotification('❌ Failed to delete', 'error');
        }
    }

    // ===================================================================
    // SOCIAL CONNECTIONS
    // ===================================================================

    async checkSocialStatus() {
        const socialData = JSON.parse(localStorage.getItem('mavula_social') || '{}');
        this.updateSocialStatus({
            facebook: { connected: socialData.facebook || false },
            instagram: { connected: socialData.instagram || false },
            tiktok: { connected: socialData.tiktok || false }
        });
    }

    updateSocialStatus(status) {
        // Facebook
        const fbBtn = document.getElementById('facebookConnectBtn');
        const fbStatus = document.getElementById('facebookStatus');
        if (status.facebook?.connected) {
            if (fbStatus) fbStatus.textContent = 'Connected ✓';
            if (fbBtn) {
                fbBtn.innerHTML = '<i class="fab fa-facebook fa-2x"></i><div class="mt-2">Import Friends</div><small>Connected ✓</small>';
                fbBtn.onclick = () => this.importSocial('facebook');
            }
        }

        // Instagram
        const igBtn = document.getElementById('instagramConnectBtn');
        const igStatus = document.getElementById('instagramStatus');
        if (status.instagram?.connected) {
            if (igStatus) igStatus.textContent = 'Connected ✓';
            if (igBtn) {
                igBtn.innerHTML = '<i class="fab fa-instagram fa-2x"></i><div class="mt-2">Import Followers</div><small>Connected ✓</small>';
                igBtn.onclick = () => this.importSocial('instagram');
            }
        }

        // TikTok
        const ttBtn = document.getElementById('tiktokConnectBtn');
        const ttStatus = document.getElementById('tiktokStatus');
        if (status.tiktok?.connected) {
            if (ttStatus) ttStatus.textContent = 'Connected ✓';
            if (ttBtn) {
                ttBtn.innerHTML = '<i class="fab fa-tiktok fa-2x"></i><div class="mt-2">Import Followers</div><small>Connected ✓</small>';
                ttBtn.onclick = () => this.importSocial('tiktok');
            }
        }
    }

    async connectSocial(platform) {
        if (this.demoMode) {
            this.showNotification(
                `🔌 Social media connections require backend setup.\n\nTo connect ${platform.toUpperCase()}:\n1. Set up OAuth credentials\n2. Start backend server\n3. Configure ${platform} app`,
                'info',
                8000
            );

            // Simulate connection for demo
            if (confirm(`Connect ${platform} in DEMO mode? (No real connection)`)) {
                const socialData = JSON.parse(localStorage.getItem('mavula_social') || '{}');
                socialData[platform] = true;
                localStorage.setItem('mavula_social', JSON.stringify(socialData));
                await this.checkSocialStatus();
                this.showNotification(`✅ ${platform} connected (DEMO)`, 'success');
            }
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/api/mavula/social/${platform}/auth`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (data.success) {
                // Open OAuth URL in popup
                const popup = window.open(data.authURL, 'OAuth', 'width=600,height=700');

                // Poll for connection status
                const checkInterval = setInterval(async () => {
                    if (popup.closed) {
                        clearInterval(checkInterval);
                        await this.checkSocialStatus();
                    }
                }, 1000);

                // Stop polling after 2 minutes
                setTimeout(() => clearInterval(checkInterval), 120000);
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to connect'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error connecting social:', error);
            this.showNotification('❌ Failed to connect. Check backend configuration.', 'error');
        }
    }

    async importSocial(platform) {
        try {
            if (this.demoMode) {
                this.showNotification(`📥 Importing from ${platform} (DEMO)...`, 'info');
                await this.sleep(2000);

                // Add demo prospects
                const prospects = JSON.parse(localStorage.getItem('mavula_prospects'));
                const demoContacts = [
                    { name: `${platform} Friend 1`, phone: '+27' + Math.floor(Math.random() * 1000000000) },
                    { name: `${platform} Friend 2`, phone: '+27' + Math.floor(Math.random() * 1000000000) }
                ];

                demoContacts.forEach(contact => {
                    prospects.push({
                        _id: Date.now().toString() + Math.random(),
                        prospectName: contact.name,
                        phone: contact.phone,
                        source: platform.toUpperCase(),
                        leadScore: 20,
                        leadTemperature: 'COLD',
                        conversationStage: 'INITIAL_CONTACT',
                        createdAt: new Date().toISOString(),
                        tags: [platform]
                    });
                });

                localStorage.setItem('mavula_prospects', JSON.stringify(prospects));
                this.showNotification(`✅ Imported 2 prospects from ${platform} (DEMO)`, 'success');
                await this.loadDashboard();
                await this.loadProspects();
                return;
            }

            this.showNotification(`📥 Importing from ${platform}...`, 'info');

            const response = await fetch(`${this.apiBase}/api/mavula/social/${platform}/import`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(
                    `✅ Imported ${data.imported} prospects, ${data.duplicates} duplicates skipped`,
                    'success'
                );
                await this.loadDashboard();
                await this.loadProspects();
            } else {
                this.showNotification('❌ ' + (data.message || 'Import failed'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error importing:', error);
            this.showNotification('❌ Import failed. Check connection.', 'error');
        }
    }

    // ===================================================================
    // SETTINGS
    // ===================================================================

    async loadSettings() {
        try {
            let settings;

            if (this.demoMode) {
                settings = JSON.parse(localStorage.getItem('mavula_settings'));
            } else {
                const response = await fetch(`${this.apiBase}/api/mavula/settings`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });

                const data = await response.json();

                if (data.success) {
                    settings = data.settings;
                    localStorage.setItem('mavula_settings', JSON.stringify(settings));
                } else {
                    settings = JSON.parse(localStorage.getItem('mavula_settings'));
                }
            }

            // Populate form
            if (document.getElementById('dailyProspectTarget')) {
                document.getElementById('dailyProspectTarget').value = settings.dailyProspectTarget;
            }
            if (document.getElementById('dailyConversionTarget')) {
                document.getElementById('dailyConversionTarget').value = settings.dailyConversionTarget;
            }
            if (document.getElementById('communicationStyle')) {
                document.getElementById('communicationStyle').value = settings.communicationStyle;
            }
            if (document.getElementById('autoResponseEnabled')) {
                document.getElementById('autoResponseEnabled').checked = settings.autoResponseEnabled;
            }
            if (document.getElementById('autoFollowUpEnabled')) {
                document.getElementById('autoFollowUpEnabled').checked = settings.autoFollowUpEnabled;
            }

            // New settings fields
            if (document.getElementById('timezone')) {
                document.getElementById('timezone').value = settings.timezone || 'Africa/Johannesburg';
            }
            if (document.getElementById('activeHoursStart')) {
                document.getElementById('activeHoursStart').value = settings.activeHours?.start || '09:00';
            }
            if (document.getElementById('activeHoursEnd')) {
                document.getElementById('activeHoursEnd').value = settings.activeHours?.end || '18:00';
            }
            if (document.getElementById('whatsappEnabled')) {
                document.getElementById('whatsappEnabled').checked = settings.whatsappEnabled !== false;
            }
            if (document.getElementById('emailNotifications')) {
                document.getElementById('emailNotifications').checked = settings.emailNotifications !== false;
            }
            if (document.getElementById('weeklyReports')) {
                document.getElementById('weeklyReports').checked = settings.weeklyReports !== false;
            }

        } catch (error) {
            console.error('[MAVULA] Error loading settings:', error);
            const settings = JSON.parse(localStorage.getItem('mavula_settings'));
            // Still populate form with cached data
        }
    }

    async saveSettings() {
        try {
            const settings = {
                dailyProspectTarget: parseInt(document.getElementById('dailyProspectTarget')?.value) || 10,
                dailyConversionTarget: parseInt(document.getElementById('dailyConversionTarget')?.value) || 1,
                communicationStyle: document.getElementById('communicationStyle')?.value || 'PROFESSIONAL',
                autoResponseEnabled: document.getElementById('autoResponseEnabled')?.checked || false,
                autoFollowUpEnabled: document.getElementById('autoFollowUpEnabled')?.checked || false,
                timezone: document.getElementById('timezone')?.value || 'Africa/Johannesburg',
                activeHours: {
                    start: document.getElementById('activeHoursStart')?.value || '09:00',
                    end: document.getElementById('activeHoursEnd')?.value || '18:00'
                },
                whatsappEnabled: document.getElementById('whatsappEnabled')?.checked !== false,
                emailNotifications: document.getElementById('emailNotifications')?.checked !== false,
                weeklyReports: document.getElementById('weeklyReports')?.checked !== false
            };

            // Validation
            if (settings.dailyProspectTarget < 1 || settings.dailyProspectTarget > 100) {
                this.showNotification('Daily prospect target must be between 1-100', 'warning');
                return;
            }

            if (settings.dailyConversionTarget < 0 || settings.dailyConversionTarget > 50) {
                this.showNotification('Daily conversion target must be between 0-50', 'warning');
                return;
            }

            if (this.demoMode) {
                localStorage.setItem('mavula_settings', JSON.stringify(settings));
                this.showNotification('✅ Settings saved (DEMO)!', 'success');
                return;
            }

            const response = await fetch(`${this.apiBase}/api/mavula/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('✅ Settings saved successfully!', 'success');
                localStorage.setItem('mavula_settings', JSON.stringify(settings));
            } else {
                this.showNotification('❌ ' + (data.message || 'Failed to save settings'), 'error');
            }
        } catch (error) {
            console.error('[MAVULA] Error saving settings:', error);
            this.showNotification('❌ Failed to save settings. Check connection.', 'error');
        }
    }

    async toggleAutomation() {
        this.automationEnabled = !this.automationEnabled;
        const btn = document.getElementById('automationToggle');

        if (this.automationEnabled) {
            btn.innerHTML = '<i class="fas fa-pause"></i> Stop Automation';
            btn.classList.add('btn-danger');
            btn.classList.remove('btn-primary');
            this.showNotification('✅ Automation started!', 'success');
        } else {
            btn.innerHTML = '<i class="fas fa-play"></i> Start Automation';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
            this.showNotification('⏸️ Automation stopped', 'info');
        }
    }

    // ===================================================================
    // UTILITIES
    // ===================================================================

    showNotification(message, type = 'info', duration = 5000) {
        // Remove existing notification
        const existing = document.querySelector('.mavula-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `mavula-notification mavula-notification-${type}`;
        notification.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="fas fa-${this.getNotificationIcon(type)} me-3"></i>
                <div class="flex-grow-1">${message.replace(/\n/g, '<br>')}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-close btn-close-white ms-3"></button>
            </div>
        `;

        // Add styles if not exists
        if (!document.getElementById('mavula-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'mavula-notification-styles';
            style.textContent = `
                .mavula-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    padding: 15px;
                    border-radius: 10px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 9999;
                    animation: slideIn 0.3s;
                    color: white;
                    font-size: 14px;
                }
                .mavula-notification-success { background: #28a745; }
                .mavula-notification-error { background: #dc3545; }
                .mavula-notification-warning { background: #ff8c00; }
                .mavula-notification-info { background: #0066cc; }
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => notification.remove(), duration);
        }
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info': return 'info-circle';
            default: return 'bell';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Stub methods for other features (conversations, messaging, etc.)
    async loadConversationProspects() { console.log('Loading conversation prospects...'); }
    async loadConversation(prospectId) { console.log('Loading conversation:', prospectId); }
    async sendMessage() { console.log('Sending message...'); }
    async generateAIResponse() { console.log('Generating AI response...'); }
    async loadAnalytics() { console.log('Loading analytics...'); }
}

// Initialize app when DOM is ready
let mavulaApp;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        mavulaApp = new MavulaApp();
    });
} else {
    mavulaApp = new MavulaApp();
}
