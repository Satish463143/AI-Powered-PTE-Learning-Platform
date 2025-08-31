// mockTest.model.js
const mongoose = require("mongoose");
const { mockStatus } = require("../../config/constant.config");

const mockTestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "User"
    },
  section: {
    name: String, // 'Reading'|| 'Writing'|| 'Listening'|| 'Speaking'
    questionTypes: [{
      name: String,
      questions: [Object], // Store each question's structure
      answers: [Object],   // User responses
    }],
    score: { type: Number, default: 0 }
  },
  overallScore: Number,
  status: { 
    type: String,
     enum: [...Object.values(mockStatus)],
     default: mockStatus.IN_PROGRESS
     },
  attemptStartedAt: Date,
  submittedAt: Date,
  feedback: String,
}, { 
    timestamps: true,
    autoIndex: true,
    autoCreate: true
});

module.exports = mongoose.model("SectionMockTest", mockTestSchema);
