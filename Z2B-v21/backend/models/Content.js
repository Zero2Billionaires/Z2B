const mongoose = require('mongoose');

// 90-Day Lesson Content
const lessonSchema = new mongoose.Schema({
    day: { type: Number, required: true, unique: true, min: 1, max: 90 },
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String, required: true }, // Full lesson content
    videoUrl: { type: String },
    audioUrl: { type: String },
    pdfUrl: { type: String },
    duration: { type: Number }, // Minutes
    category: {
        type: String,
        enum: ['Foundation', 'Mindset', 'Strategy', 'Execution', 'Leadership', 'Advanced'],
        default: 'Foundation'
    },
    requiredTier: {
        type: String,
        enum: ['FAM', 'BRONZE', 'COPPER', 'SILVER', 'GOLD', 'PLATINUM'],
        default: 'FAM'
    },
    isPublished: { type: Boolean, default: true },
    orderIndex: { type: Number },
    relatedLessons: [{ type: Number }], // Day numbers
    metadata: {
        author: String,
        createdBy: String,
        lastEditedBy: String,
        tags: [String]
    }
}, {
    timestamps: true,
    collection: 'lessons'
});

// General Content Pages
const pageSchema = new mongoose.Schema({
    pageName: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    metadata: {
        lastEditedBy: String,
        editHistory: [{
            editedBy: String,
            editedAt: Date,
            changes: String
        }]
    }
}, {
    timestamps: true,
    collection: 'pages'
});

const Lesson = mongoose.model('Lesson', lessonSchema);
const Page = mongoose.model('Page', pageSchema);

module.exports = { Lesson, Page };
