const mongoose = require('mongoose');
const EventEmitter = require('events');

// Create an event emitter for practice score updates
const practiceScoreEmitter = new EventEmitter();

const practiceScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true
    },
    attemptDuration: {
        type: Number,
        required: true
    },
    xpProcessed: {
        type: Boolean,
        default: false
    },
    feedbackProcessed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    autoIndex: true,
    autoCreate: true
});

// Add post-save hook to emit event
practiceScoreSchema.post('save', async function(doc) {
    // Emit event instead of directly calling the service
    practiceScoreEmitter.emit('practiceScoreUpdated', {
        userId: doc.userId,
        section: doc.section
    });
});

const PracticeScore = mongoose.model('PracticeScore', practiceScoreSchema);

module.exports = {
    PracticeScore,
    practiceScoreEmitter
};