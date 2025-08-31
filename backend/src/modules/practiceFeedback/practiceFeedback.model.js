const mongoose = require('mongoose');
const { Section } = require('../../config/constant.config');

const sectionFeedbackSchema = new mongoose.Schema({
    section: {
      type: String,
      required: true,
      enum: [...Object.values(Section)]
    },
    feedbackText: {
        type: String,
        required: true
    },
    pdfContent: {
        type: String,
        required: false
    },
}, { _id: false });

const practiceFeedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    section: [sectionFeedbackSchema],
    overall: {
        feedbackText: {
            type: String,
            required: true // summary/overview shown in UI
        },
        pdfContent: {
            type: String,
            required: false // detailed breakdown for PDF rendering (optional)
        },
    },   
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const practiceFeedbackModel = mongoose.model('PracticeFeedback', practiceFeedbackSchema);

module.exports =   practiceFeedbackModel



