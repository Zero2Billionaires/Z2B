// Marketplace Product Access Schema (to replace MAVULA-specific fields)
// This supports ALL marketplace products: MAVULA, ZYRO, ZYRA, BENOWN, GLOWIE, VIDZIE, ZYNTH, ZYNECT

const productAccessSchema = {
    hasAccess: { type: Boolean, default: false },
    accessType: {
        type: String,
        enum: ['PAID', 'GIFT', 'BETA', 'ADMIN', 'FREE'],
        default: null
    },
    subscriptionPlan: {
        type: String,
        enum: ['MONTHLY', 'LIFETIME', 'PAY_AS_GO'],
        default: null
    },
    grantedDate: { type: Date },
    expiryDate: { type: Date },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    revokedDate: { type: Date },
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    revocationReason: { type: String }
};

// Add to User schema:
marketplaceAccess: {
    mavula: productAccessSchema,
    zyro: productAccessSchema,
    zyra: productAccessSchema,
    benown: productAccessSchema,
    glowie: productAccessSchema,
    vidzie: productAccessSchema,
    zynth: productAccessSchema,
    zynect: productAccessSchema
}

// Products list for reference:
const MARKETPLACE_PRODUCTS = [
    { id: 'mavula', name: 'MAVULA', icon: '🤖', price: { monthly: 497, lifetime: 2997 } },
    { id: 'zyro', name: 'ZYRO', icon: '🎯', price: { monthly: 497, lifetime: 2997 } },
    { id: 'zyra', name: 'ZYRA', icon: '💼', price: { monthly: 497, lifetime: 2997 } },
    { id: 'benown', name: 'BENOWN', icon: '📊', price: { monthly: 497, lifetime: 2997 } },
    { id: 'glowie', name: 'GLOWIE', icon: '✨', price: { monthly: 497, lifetime: 2997 } },
    { id: 'vidzie', name: 'VIDZIE', icon: '🎬', price: { monthly: 497, lifetime: 2997 } },
    { id: 'zynth', name: 'ZYNTH', icon: '🎵', price: { monthly: 497, lifetime: 2997 } },
    { id: 'zynect', name: 'ZYNECT', icon: '🔗', price: { monthly: 497, lifetime: 2997 } }
];
