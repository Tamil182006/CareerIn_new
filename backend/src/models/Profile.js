const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    basic_info: {
      name: String,
      email: String,
      phone: String
    },

    sections: {
      profile: String,
      skills: [String],
      experience: String,
      projects: String,
      education: String,
      certifications: String,
      publications: String,
      interests: String,
      languages: [String]
    },

    resumeScore: {
      type: Number,
      default: null
    },

    resumeReview: {
      strengths: [String],
      weaknesses: [String],
      suggestions: [String]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
