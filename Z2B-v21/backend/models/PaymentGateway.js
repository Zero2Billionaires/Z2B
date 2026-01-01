const mongoose = require('mongoose');

const paymentGatewaySchema = new mongoose.Schema({
    // Yoco Configuration
    yoco: {
        enabled: { type: Boolean, default: true },
        publicKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        webhookSecret: { type: String, default: '' },
        mode: {
            type: String,
            enum: ['test', 'live'],
            default: 'test'
        },
        paymentUrl: { type: String, default: 'https://pay.yoco.com/zero2billionaires-amavulandlela' }
    },

    // Payfast - South African Payment Gateway (NWM Friendly)
    payfast: {
        enabled: { type: Boolean, default: false },
        merchantId: { type: String, default: '' },
        merchantKey: { type: String, default: '' },
        passphrase: { type: String, default: '' },
        mode: {
            type: String,
            enum: ['sandbox', 'live'],
            default: 'sandbox'
        },
        paymentUrl: { type: String, default: 'https://www.payfast.co.za/eng/process' },
        description: { type: String, default: 'South African card payments, EFT, instant EFT, SnapScan, Zapper' }
    },

    // CoinPayments - Cryptocurrency Gateway (2000+ Cryptos, NWM Friendly)
    coinpayments: {
        enabled: { type: Boolean, default: false },
        merchantId: { type: String, default: '' },
        ipnSecret: { type: String, default: '' },
        publicKey: { type: String, default: '' },
        privateKey: { type: String, default: '' },
        mode: {
            type: String,
            enum: ['test', 'live'],
            default: 'test'
        },
        acceptedCoins: {
            type: [String],
            default: ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'BNB', 'XRP', 'DOGE', 'ADA', 'SOL']
        },
        description: { type: String, default: 'Accept Bitcoin, Ethereum, USDT, and 2000+ cryptocurrencies' }
    },

    // Manual Bank Transfer
    bankTransfer: {
        enabled: { type: Boolean, default: true },
        bankName: { type: String, default: '' },
        accountName: { type: String, default: 'Z2B Legacy Builders' },
        accountNumber: { type: String, default: '' },
        branchCode: { type: String, default: '' },
        accountType: { type: String, default: 'Business Cheque' },
        reference: { type: String, default: 'Use your Referral Code' }
    },

    // Active Gateway
    activeGateway: {
        type: String,
        enum: ['yoco', 'payfast', 'coinpayments', 'bankTransfer'],
        default: 'yoco'
    }
}, {
    timestamps: true,
    collection: 'payment_gateway'
});

module.exports = mongoose.model('PaymentGateway', paymentGatewaySchema);
