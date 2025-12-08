const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');
const MavulaContentLibrary = require('../models/MavulaContentLibrary');
const MavulaAIService = require('./MavulaAIService');
const MatrixStructure = require('../models/MatrixStructure');
const User = require('../models/User');

class MavulaContentProcessor {
    constructor() {
        // Supported file types
        this.supportedFileTypes = ['.pdf'];

        // Maximum file size (10MB)
        this.maxFileSize = 10 * 1024 * 1024;

        // Maximum content length for AI processing
        this.maxContentLength = 50000; // ~50k characters
    }

    // ===================================================================
    // PDF PROCESSING
    // ===================================================================

    /**
     * Process uploaded PDF file
     * @param {Object} file - Multer file object
     * @param {String} userId - User ID
     * @param {Object} metadata - Additional metadata (category, title, etc.)
     */
    async processPDF(file, userId, metadata = {}) {
        try {
            console.log('[MAVULA CONTENT] Processing PDF:', file.originalname);

            // Validate file
            const validation = this._validateFile(file);
            if (!validation.valid) {
                return {
                    success: false,
                    message: validation.message
                };
            }

            // Read file buffer
            const fileBuffer = await fs.readFile(file.path);

            // Extract text from PDF
            const extractedText = await this._extractTextFromPDF(fileBuffer);

            if (!extractedText || extractedText.trim().length === 0) {
                return {
                    success: false,
                    message: 'No text could be extracted from PDF'
                };
            }

            console.log(`[MAVULA CONTENT] Extracted ${extractedText.length} characters from PDF`);

            // Truncate if too long
            const processableText = this._truncateContent(extractedText);

            // Generate AI summary
            const summaryResult = await MavulaAIService.generateContentSummary(
                processableText,
                500
            );

            // Extract key points
            const keyPointsResult = await MavulaAIService.extractKeyPoints(
                processableText,
                5
            );

            // Create content library entry
            const content = new MavulaContentLibrary({
                userId,
                title: metadata.title || file.originalname,
                contentType: 'PDF',
                category: metadata.category || 'GENERAL',
                sourceUrl: null,
                filePath: file.path,
                fileSize: file.size,
                extractedText,
                aiSummary: summaryResult.success ? summaryResult.summary : null,
                keyPoints: keyPointsResult.success ? keyPointsResult.keyPoints : [],
                isProcessed: true,
                processingStatus: 'COMPLETED',
                tags: metadata.tags || []
            });

            await content.save();

            console.log('[MAVULA CONTENT] PDF processed successfully:', content._id);

            return {
                success: true,
                contentId: content._id,
                extractedLength: extractedText.length,
                summary: content.aiSummary,
                keyPoints: content.keyPoints
            };
        } catch (error) {
            console.error('[MAVULA CONTENT] Error processing PDF:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Extract text from PDF buffer
     */
    async _extractTextFromPDF(buffer) {
        try {
            const data = await pdfParse(buffer);
            return data.text;
        } catch (error) {
            console.error('[MAVULA CONTENT] PDF parsing error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    // ===================================================================
    // URL PROCESSING
    // ===================================================================

    /**
     * Process URL and extract content
     * @param {String} url - URL to scrape
     * @param {String} userId - User ID
     * @param {Object} metadata - Additional metadata
     */
    async processURL(url, userId, metadata = {}) {
        try {
            console.log('[MAVULA CONTENT] Processing URL:', url);

            // Validate URL
            if (!this._isValidURL(url)) {
                return {
                    success: false,
                    message: 'Invalid URL format'
                };
            }

            // Fetch URL content
            const htmlContent = await this._fetchURL(url);

            // Extract text from HTML
            const extractedText = this._extractTextFromHTML(htmlContent, url);

            if (!extractedText || extractedText.trim().length === 0) {
                return {
                    success: false,
                    message: 'No content could be extracted from URL'
                };
            }

            console.log(`[MAVULA CONTENT] Extracted ${extractedText.length} characters from URL`);

            // Truncate if too long
            const processableText = this._truncateContent(extractedText);

            // Generate AI summary
            const summaryResult = await MavulaAIService.generateContentSummary(
                processableText,
                500
            );

            // Extract key points
            const keyPointsResult = await MavulaAIService.extractKeyPoints(
                processableText,
                5
            );

            // Create content library entry
            const content = new MavulaContentLibrary({
                userId,
                title: metadata.title || this._extractTitleFromHTML(htmlContent) || url,
                contentType: 'URL',
                category: metadata.category || 'GENERAL',
                sourceUrl: url,
                filePath: null,
                fileSize: htmlContent.length,
                extractedText,
                aiSummary: summaryResult.success ? summaryResult.summary : null,
                keyPoints: keyPointsResult.success ? keyPointsResult.keyPoints : [],
                isProcessed: true,
                processingStatus: 'COMPLETED',
                tags: metadata.tags || []
            });

            await content.save();

            console.log('[MAVULA CONTENT] URL processed successfully:', content._id);

            return {
                success: true,
                contentId: content._id,
                extractedLength: extractedText.length,
                summary: content.aiSummary,
                keyPoints: content.keyPoints
            };
        } catch (error) {
            console.error('[MAVULA CONTENT] Error processing URL:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Fetch URL content
     */
    async _fetchURL(url) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                maxRedirects: 5,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            return response.data;
        } catch (error) {
            console.error('[MAVULA CONTENT] URL fetch error:', error.message);
            throw new Error(`Failed to fetch URL: ${error.message}`);
        }
    }

    /**
     * Extract text content from HTML
     */
    _extractTextFromHTML(html, url) {
        try {
            const $ = cheerio.load(html);

            // Remove script and style elements
            $('script, style, nav, header, footer, iframe, noscript').remove();

            // Try to find main content area
            let content = '';

            // Common content selectors
            const contentSelectors = [
                'article',
                'main',
                '[role="main"]',
                '.content',
                '.main-content',
                '#content',
                '.post-content',
                '.article-content'
            ];

            for (const selector of contentSelectors) {
                const element = $(selector).first();
                if (element.length > 0) {
                    content = element.text();
                    break;
                }
            }

            // Fallback to body if no content area found
            if (!content || content.trim().length < 100) {
                content = $('body').text();
            }

            // Clean up whitespace
            content = content
                .replace(/\s+/g, ' ')
                .replace(/\n+/g, '\n')
                .trim();

            return content;
        } catch (error) {
            console.error('[MAVULA CONTENT] HTML parsing error:', error);
            throw new Error('Failed to extract text from HTML');
        }
    }

    /**
     * Extract title from HTML
     */
    _extractTitleFromHTML(html) {
        try {
            const $ = cheerio.load(html);

            // Try multiple title sources
            let title = $('meta[property="og:title"]').attr('content') ||
                       $('meta[name="twitter:title"]').attr('content') ||
                       $('title').text() ||
                       $('h1').first().text();

            return title ? title.trim() : null;
        } catch (error) {
            return null;
        }
    }

    // ===================================================================
    // TEXT CONTENT PROCESSING
    // ===================================================================

    /**
     * Process plain text content
     * @param {String} text - Plain text content
     * @param {String} userId - User ID
     * @param {Object} metadata - Additional metadata
     */
    async processText(text, userId, metadata = {}) {
        try {
            console.log('[MAVULA CONTENT] Processing text content');

            if (!text || text.trim().length === 0) {
                return {
                    success: false,
                    message: 'Text content is empty'
                };
            }

            // Truncate if too long
            const processableText = this._truncateContent(text);

            // Generate AI summary
            const summaryResult = await MavulaAIService.generateContentSummary(
                processableText,
                500
            );

            // Extract key points
            const keyPointsResult = await MavulaAIService.extractKeyPoints(
                processableText,
                5
            );

            // Create content library entry
            const content = new MavulaContentLibrary({
                userId,
                title: metadata.title || 'Text Content',
                contentType: 'TEXT',
                category: metadata.category || 'GENERAL',
                sourceUrl: null,
                filePath: null,
                fileSize: text.length,
                extractedText: text,
                aiSummary: summaryResult.success ? summaryResult.summary : null,
                keyPoints: keyPointsResult.success ? keyPointsResult.keyPoints : [],
                isProcessed: true,
                processingStatus: 'COMPLETED',
                tags: metadata.tags || []
            });

            await content.save();

            console.log('[MAVULA CONTENT] Text content processed successfully:', content._id);

            return {
                success: true,
                contentId: content._id,
                extractedLength: text.length,
                summary: content.aiSummary,
                keyPoints: content.keyPoints
            };
        } catch (error) {
            console.error('[MAVULA CONTENT] Error processing text:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // ===================================================================
    // TEAM SHARING
    // ===================================================================

    /**
     * Share content with team (downline members)
     * @param {String} contentId - Content ID to share
     * @param {String} userId - User ID (content owner)
     */
    async shareWithTeam(contentId, userId) {
        try {
            console.log('[MAVULA CONTENT] Sharing content with team:', contentId);

            // Get content
            const content = await MavulaContentLibrary.findById(contentId);
            if (!content) {
                return {
                    success: false,
                    message: 'Content not found'
                };
            }

            // Verify ownership
            if (content.userId.toString() !== userId.toString()) {
                return {
                    success: false,
                    message: 'Unauthorized: You do not own this content'
                };
            }

            // Check if already shared
            if (content.isSharedWithTeam) {
                return {
                    success: false,
                    message: 'Content is already shared with team'
                };
            }

            // Get user's matrix structure
            const matrixStructure = await MatrixStructure.findOne({ userId });
            if (!matrixStructure) {
                return {
                    success: false,
                    message: 'Matrix structure not found'
                };
            }

            // Collect all downline member IDs (up to 10 levels)
            const downlineIds = this._getAllDownlineIds(matrixStructure);

            console.log(`[MAVULA CONTENT] Found ${downlineIds.length} team members`);

            // Create duplicate content entries for each team member
            let sharedCount = 0;
            const errors = [];

            for (const memberId of downlineIds) {
                try {
                    // Check if member already has this content
                    const existingContent = await MavulaContentLibrary.findOne({
                        userId: memberId,
                        sharedFromUserId: userId,
                        title: content.title,
                        contentType: content.contentType
                    });

                    if (existingContent) {
                        continue; // Skip if already shared
                    }

                    // Create duplicate for team member
                    const sharedContent = new MavulaContentLibrary({
                        userId: memberId,
                        title: content.title,
                        contentType: content.contentType,
                        category: content.category,
                        sourceUrl: content.sourceUrl,
                        filePath: content.filePath, // Reference same file
                        fileSize: content.fileSize,
                        extractedText: content.extractedText,
                        aiSummary: content.aiSummary,
                        keyPoints: content.keyPoints,
                        isProcessed: true,
                        processingStatus: 'COMPLETED',
                        tags: content.tags,
                        isSharedContent: true,
                        sharedFromUserId: userId,
                        sharedDate: new Date()
                    });

                    await sharedContent.save();
                    sharedCount++;
                } catch (memberError) {
                    console.error(`[MAVULA CONTENT] Error sharing with member ${memberId}:`, memberError);
                    errors.push({
                        memberId,
                        error: memberError.message
                    });
                }
            }

            // Mark original as shared
            content.isSharedWithTeam = true;
            content.sharedDate = new Date();
            await content.save();

            console.log(`[MAVULA CONTENT] Content shared with ${sharedCount} team members`);

            return {
                success: true,
                sharedCount,
                totalTeamMembers: downlineIds.length,
                errors: errors.length > 0 ? errors : undefined
            };
        } catch (error) {
            console.error('[MAVULA CONTENT] Error sharing with team:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Get all downline member IDs from matrix structure
     */
    _getAllDownlineIds(matrixStructure) {
        const downlineIds = [];

        // Collect IDs from all 10 levels
        for (let level = 1; level <= 10; level++) {
            const levelKey = `level${level}`;
            if (matrixStructure[levelKey] && matrixStructure[levelKey].length > 0) {
                matrixStructure[levelKey].forEach(member => {
                    if (member.userId) {
                        downlineIds.push(member.userId);
                    }
                });
            }
        }

        // Remove duplicates
        return [...new Set(downlineIds.map(id => id.toString()))];
    }

    // ===================================================================
    // HELPER METHODS
    // ===================================================================

    /**
     * Validate uploaded file
     */
    _validateFile(file) {
        if (!file) {
            return { valid: false, message: 'No file provided' };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                message: `File size exceeds maximum (${this.maxFileSize / 1024 / 1024}MB)`
            };
        }

        // Check file type
        const ext = path.extname(file.originalname).toLowerCase();
        if (!this.supportedFileTypes.includes(ext)) {
            return {
                valid: false,
                message: `Unsupported file type. Supported: ${this.supportedFileTypes.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Validate URL format
     */
    _isValidURL(url) {
        try {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch (error) {
            return false;
        }
    }

    /**
     * Truncate content to maximum length
     */
    _truncateContent(text) {
        if (text.length <= this.maxContentLength) {
            return text;
        }

        console.log(`[MAVULA CONTENT] Truncating content from ${text.length} to ${this.maxContentLength} characters`);
        return text.substring(0, this.maxContentLength) + '\n\n[Content truncated...]';
    }

    /**
     * Delete content and associated files
     */
    async deleteContent(contentId, userId) {
        try {
            const content = await MavulaContentLibrary.findById(contentId);

            if (!content) {
                return { success: false, message: 'Content not found' };
            }

            // Verify ownership (unless it's shared content)
            if (!content.isSharedContent && content.userId.toString() !== userId.toString()) {
                return { success: false, message: 'Unauthorized' };
            }

            // Delete file if exists
            if (content.filePath) {
                try {
                    await fs.unlink(content.filePath);
                    console.log('[MAVULA CONTENT] Deleted file:', content.filePath);
                } catch (fileError) {
                    console.warn('[MAVULA CONTENT] Could not delete file:', fileError.message);
                }
            }

            // Delete content entry
            await MavulaContentLibrary.findByIdAndDelete(contentId);

            console.log('[MAVULA CONTENT] Content deleted:', contentId);

            return { success: true };
        } catch (error) {
            console.error('[MAVULA CONTENT] Error deleting content:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new MavulaContentProcessor();
