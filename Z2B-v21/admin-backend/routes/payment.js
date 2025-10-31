const express = require('express');
const router = express.Router();
const PaymentGateway = require('../models/PaymentGateway');
const { verifyToken } = require('../middleware/auth');
const { createTierCheckout } = require('../utils/tierCheckout');

// Create Tier Checkout Session (PUBLIC ENDPOINT - No auth required)
router.post('/create-tier-checkout', async (req, res) => {
    try {
        const result = await createTierCheckout(req);
        res.json(result);
    } catch (error) {
        console.error('Create tier checkout error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to create checkout session'
        });
    }
});

// Get Payment Gateway Settings
router.get('/', verifyToken, async (req, res) => {
    try {
        let gateway = await PaymentGateway.findOne();

        // If no gateway settings exist, create default
        if (!gateway) {
            gateway = new PaymentGateway();
            await gateway.save();
        }

        res.json({
            success: true,
            data: gateway
        });
    } catch (error) {
        console.error('Error fetching payment gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment gateway settings'
        });
    }
});

// Update Yoco Settings
router.put('/yoco', verifyToken, async (req, res) => {
    try {
        const { yoco } = req.body;

        let gateway = await PaymentGateway.findOne();
        if (!gateway) {
            gateway = new PaymentGateway();
        }

        gateway.yoco = { ...gateway.yoco, ...yoco };
        await gateway.save();

        res.json({
            success: true,
            message: 'Yoco settings updated successfully',
            data: gateway.yoco
        });
    } catch (error) {
        console.error('Error updating Yoco settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating Yoco settings'
        });
    }
});

// Update Payfast Settings (South African Payment Gateway)
router.put('/payfast', verifyToken, async (req, res) => {
    try {
        const { payfast } = req.body;

        let gateway = await PaymentGateway.findOne();
        if (!gateway) {
            gateway = new PaymentGateway();
        }

        gateway.payfast = { ...gateway.payfast, ...payfast };
        await gateway.save();

        res.json({
            success: true,
            message: 'Payfast settings updated successfully',
            data: gateway.payfast
        });
    } catch (error) {
        console.error('Error updating Payfast settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating Payfast settings'
        });
    }
});

// Update CoinPayments Settings (Cryptocurrency Gateway)
router.put('/coinpayments', verifyToken, async (req, res) => {
    try {
        const { coinpayments } = req.body;

        let gateway = await PaymentGateway.findOne();
        if (!gateway) {
            gateway = new PaymentGateway();
        }

        gateway.coinpayments = { ...gateway.coinpayments, ...coinpayments };
        await gateway.save();

        res.json({
            success: true,
            message: 'CoinPayments settings updated successfully',
            data: gateway.coinpayments
        });
    } catch (error) {
        console.error('Error updating CoinPayments settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating CoinPayments settings'
        });
    }
});

// Update Bank Transfer Settings
router.put('/bank-transfer', verifyToken, async (req, res) => {
    try {
        const { bankTransfer } = req.body;

        let gateway = await PaymentGateway.findOne();
        if (!gateway) {
            gateway = new PaymentGateway();
        }

        gateway.bankTransfer = { ...gateway.bankTransfer, ...bankTransfer };
        await gateway.save();

        res.json({
            success: true,
            message: 'Bank transfer settings updated successfully',
            data: gateway.bankTransfer
        });
    } catch (error) {
        console.error('Error updating bank transfer settings:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating bank transfer settings'
        });
    }
});

// Set Active Gateway
router.put('/active', verifyToken, async (req, res) => {
    try {
        const { activeGateway } = req.body;

        let gateway = await PaymentGateway.findOne();
        if (!gateway) {
            gateway = new PaymentGateway();
        }

        gateway.activeGateway = activeGateway;
        await gateway.save();

        res.json({
            success: true,
            message: `Active gateway set to ${activeGateway}`,
            data: { activeGateway: gateway.activeGateway }
        });
    } catch (error) {
        console.error('Error setting active gateway:', error);
        res.status(500).json({
            success: false,
            message: 'Error setting active gateway'
        });
    }
});

module.exports = router;
