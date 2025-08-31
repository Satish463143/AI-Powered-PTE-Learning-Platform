const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  pronunciationScore: { type: Number, min: 0, max: 100, default: 0 },
  oralFluencyScore:   { type: Number, min: 0, max: 100, default: 0 },
  vocabularyScore:    { type: Number, min: 0, max: 100, default: 0 },
  contentScore:       { type: Number, min: 0, max: 100, default: 0 },
}, { _id: false });

const callSessionSchema = new mongoose.Schema({
  scores:    { type: scoreSchema, default: () => ({}) },
  hasChat:   { type: Boolean, default: false },
  chat:      { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const liveCallAnalysisSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  currentSessionScores: { type: scoreSchema, default: () => ({}) },

  xp:       { type: Number, default: 0 },
  progress: { type: Number, default: 0 },

  averageScores: { type: scoreSchema, default: () => ({}) },

  callHistory: { type: [callSessionSchema], default: [] },
}, { timestamps: true });

liveCallAnalysisSchema.pre('save', function(next) {
  if (this.isModified('callHistory') && this.callHistory.length > 0) {
    const totals = this.callHistory.reduce((acc, s) => {
      const sc = s.scores || {};
      acc.pronunciationScore += sc.pronunciationScore || 0;
      acc.oralFluencyScore   += sc.oralFluencyScore   || 0;
      acc.vocabularyScore    += sc.vocabularyScore    || 0;
      acc.contentScore       += sc.contentScore       || 0;
      return acc;
    }, { pronunciationScore: 0, oralFluencyScore: 0, vocabularyScore: 0, contentScore: 0 });

    const n = this.callHistory.length;
    const round1 = (x) => Math.round(x * 10) / 10;

    this.averageScores = {
      pronunciationScore: round1(totals.pronunciationScore / n),
      oralFluencyScore:   round1(totals.oralFluencyScore   / n),
      vocabularyScore:    round1(totals.vocabularyScore    / n),
      contentScore:       round1(totals.contentScore       / n),
    };
  }
  next();
});

const LiveCallAnalysis = mongoose.model('LiveCallAnalysis', liveCallAnalysisSchema);
module.exports = LiveCallAnalysis;
