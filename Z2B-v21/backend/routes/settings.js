const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { verifyToken } = require('../middleware/auth');

// Get All Settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

// Update Tier Settings
router.put('/tiers', verifyToken, async (req, res) => {
    try {
        const { tiers } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.tiers = { ...settings.tiers, ...tiers };
        await settings.save();

        res.json({
            success: true,
            message: 'Tier settings updated successfully',
            data: settings.tiers
        });
    } catch (error) {
        console.error('Error updating tiers:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating tier settings'
        });
    }
});

// Update Branding Settings
router.put('/branding', verifyToken, async (req, res) => {
    try {
        const { branding } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.branding = { ...settings.branding, ...branding };
        await settings.save();

        res.json({
            success: true,
            message: 'Branding settings updated successfully',
            data: settings.branding
        });
    } catch (error) {
        console.error('Error updating branding:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating branding settings'
        });
    }
});

// Update Compensation Plan
router.put('/compensation', verifyToken, async (req, res) => {
    try {
        const { compensation } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.compensation = { ...settings.compensation, ...compensation };
        await settings.save();

        res.json({
            success: true,
            message: 'Compensation plan updated successfully',
            data: settings.compensation
        });
    } catch (error) {
        console.error('Error updating compensation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating compensation plan'
        });
    }
});

// Update General Settings
router.put('/general', verifyToken, async (req, res) => {
    try {
        const { general } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.general = { ...settings.general, ...general };
        await settings.save();

        res.json({
            success: true,
            message: 'General settings updated successfully',
            data: settings.general
        });
    } catch (error) {
        console.error('Error updating general settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating general settings'
        });
    }
});

// Reset All Settings to Default
router.post('/reset', verifyToken, async (req, res) => {
    try {
        await Settings.deleteMany({});

        const defaultSettings = new Settings();
        await defaultSettings.save();

        res.json({
            success: true,
            message: 'Settings reset to default values',
            data: defaultSettings
        });
    } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting settings'
        });
    }
});

module.exports = router;
