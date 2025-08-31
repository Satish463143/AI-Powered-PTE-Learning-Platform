// mockTest.model.js
const mongoose = require("mongoose");
const { mockStatus } = require("../../config/constant.config");

const mockTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  aboutMe: {
    audioUrl: String,
    recordedAt: Date
  },
  sections: [{
    name: String, // 'Reading', 'Writing', etc.
    questionTypes: [{
      type: { type: String }, // The type field needs to be explicitly defined as an object
      questions: { type: [mongoose.Schema.Types.Mixed] }, // Allow any structure for questions
      answers: { type: [mongoose.Schema.Types.Mixed] },   // Allow any structure for answers
    }],
    score: { type: Number, default: 0 }
  }],
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

module.exports = mongoose.model("FullMockTest", mockTestSchema);
