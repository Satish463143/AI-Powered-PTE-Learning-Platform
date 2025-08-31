const mongoose = require('mongoose');
const { Section } = require('../../config/constant.config');

const sectionXP = new mongoose.Schema({
    section: {
      type: String,
      required: true,
      enum: [...Object.values(Section)]
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,  // Add max validation for XP
      validate: {
        validator: function(v) {
          return v <= 10;
        },
        message: 'XP progress cannot exceed 10'
      }
    }
}, { _id: false }); 

const practiceXpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sectionXP: [sectionXP],
    overall: {
        level: {
          type: Number,
          default: 1,
          min: 1
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 10,  // Add max validation for overall XP
          validate: {
            validator: function(v) {
              return v <= 10;
            },
            message: 'Overall XP progress cannot exceed 10'
          }
        }
    }
},
{
    autoCreate: true,
    timestamps: true,
    autoIndex: true,
    minimize: true,
    validateBeforeSave: true
});

// Create compound index for common queries
practiceXpSchema.index({ userId: 1, 'sectionXP.section': 1 });

// Add instance method for efficient section lookup
practiceXpSchema.methods.getSectionData = function(section) {
    return this.sectionXP.find(s => s.section.toLowerCase() === section.toLowerCase());
};

const practiceXpModel = mongoose.model('PracticeXp', practiceXpSchema);
module.exports = practiceXpModel;