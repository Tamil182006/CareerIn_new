const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  careerSlug: {
    type: String,
    required: true
  },
  completedSteps: {
    type: [Number], // Array of indexes representing completed step numbers
    default: []
  }
}, { timestamps: true });

// Ensure a user only has one progress document per career
ProgressSchema.index({ user: 1, careerSlug: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
