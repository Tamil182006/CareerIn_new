const mongoose = require("mongoose");

const RoadmapStepSchema = new mongoose.Schema(
  {
    step:  { type: Number, required: true },
    title: { type: String, required: true },
    desc:  { type: String, required: true },
  },
  { _id: false }
);

const CareerSchema = new mongoose.Schema(
  {
    // URL-friendly identifier e.g. "software-developer"
    slug: {
      type:     String,
      required: true,
      unique:   true,
      lowercase: true,
      trim:     true,
    },

    title:    { type: String, required: true },
    category: { type: String, required: true }, // coding | design | data | mobile | cloud | security | devops | marketing | business | gaming | finance
    icon:     { type: String, default: "💼" },  // emoji

    description: { type: String, required: true },

    // Interest tags for recommendation matching
    relatedInterests: { type: [String], default: [] },

    // Skills list shown on career detail page
    skills: { type: [String], default: [] },

    // Salary range in INR
    salary: { type: String, default: "Varies" },

    // Step-by-step learning roadmap
    roadmap: { type: [RoadmapStepSchema], default: [] },
  },
  { timestamps: true }
);

// Index on category and interests for fast filtering
CareerSchema.index({ category: 1 });
CareerSchema.index({ relatedInterests: 1 });

module.exports = mongoose.model("Career", CareerSchema);
