const express = require('express');
const router = express.Router();
const { Lesson, Page } = require('../models/Content');
const { verifyToken } = require('../middleware/auth');

// ========== LESSONS (90-Day Program) ==========

// Get All Lessons
router.get('/lessons', async (req, res) => {
    try {
        const lessons = await Lesson.find({ isPublished: true })
            .sort({ day: 1 });

        res.json({
            success: true,
            data: lessons
        });
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lessons'
        });
    }
});

// Get Single Lesson
router.get('/lessons/:day', async (req, res) => {
    try {
        const lesson = await Lesson.findOne({ day: req.params.day });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.json({
            success: true,
            data: lesson
        });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching lesson'
        });
    }
});

// Create/Update Lesson
router.post('/lessons', verifyToken, async (req, res) => {
    try {
        const {
            day,
            title,
            description,
            content,
            videoUrl,
            audioUrl,
            pdfUrl,
            duration,
            category,
            requiredTier,
            isPublished
        } = req.body;

        let lesson = await Lesson.findOne({ day });

        if (lesson) {
            // Update existing lesson
            lesson.title = title || lesson.title;
            lesson.description = description || lesson.description;
            lesson.content = content || lesson.content;
            lesson.videoUrl = videoUrl || lesson.videoUrl;
            lesson.audioUrl = audioUrl || lesson.audioUrl;
            lesson.pdfUrl = pdfUrl || lesson.pdfUrl;
            lesson.duration = duration || lesson.duration;
            lesson.category = category || lesson.category;
            lesson.requiredTier = requiredTier || lesson.requiredTier;
            lesson.isPublished = isPublished !== undefined ? isPublished : lesson.isPublished;
            lesson.metadata = {
                ...lesson.metadata,
                lastEditedBy: 'Admin',
                lastEditedAt: new Date()
            };
        } else {
            // Create new lesson
            lesson = new Lesson({
                day,
                title,
                description,
                content,
                videoUrl,
                audioUrl,
                pdfUrl,
                duration,
                category,
                requiredTier,
                isPublished,
                metadata: {
                    author: 'Admin',
                    createdBy: 'Admin'
                }
            });
        }

        await lesson.save();

        res.json({
            success: true,
            message: `Lesson ${day} saved successfully`,
            data: lesson
        });
    } catch (error) {
        console.error('Error saving lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving lesson'
        });
    }
});

// Delete Lesson
router.delete('/lessons/:day', verifyToken, async (req, res) => {
    try {
        const lesson = await Lesson.findOneAndDelete({ day: req.params.day });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: 'Lesson not found'
            });
        }

        res.json({
            success: true,
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lesson:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting lesson'
        });
    }
});

// ========== PAGES ==========

// Get All Pages
router.get('/pages', verifyToken, async (req, res) => {
    try {
        const pages = await Page.find();

        res.json({
            success: true,
            data: pages
        });
    } catch (error) {
        console.error('Error fetching pages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pages'
        });
    }
});

// Get Single Page
router.get('/pages/:pageName', async (req, res) => {
    try {
        const page = await Page.findOne({ pageName: req.params.pageName, isActive: true });

        if (!page) {
            return res.status(404).json({
                success: false,
                message: 'Page not found'
            });
        }

        res.json({
            success: true,
            data: page
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching page'
        });
    }
});

// Create/Update Page
router.post('/pages', verifyToken, async (req, res) => {
    try {
        const { pageName, title, content, isActive } = req.body;

        let page = await Page.findOne({ pageName });

        if (page) {
            // Update existing page
            const editHistory = {
                editedBy: 'Admin',
                editedAt: new Date(),
                changes: 'Content updated'
            };

            page.title = title || page.title;
            page.content = content || page.content;
            page.isActive = isActive !== undefined ? isActive : page.isActive;
            page.metadata.lastEditedBy = 'Admin';
            page.metadata.editHistory = page.metadata.editHistory || [];
            page.metadata.editHistory.push(editHistory);
        } else {
            // Create new page
            page = new Page({
                pageName,
                title,
                content,
                isActive,
                metadata: {
                    lastEditedBy: 'Admin',
                    editHistory: [{
                        editedBy: 'Admin',
                        editedAt: new Date(),
                        changes: 'Page created'
                    }]
                }
            });
        }

        await page.save();

        res.json({
            success: true,
            message: 'Page saved successfully',
            data: page
        });
    } catch (error) {
        console.error('Error saving page:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving page'
        });
    }
});

module.exports = router;
