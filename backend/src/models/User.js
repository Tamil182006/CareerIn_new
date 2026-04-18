const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },

    // Interests selected during onboarding (e.g. ["coding", "design"])
    interests: {
      type: [String],
      default: [],
    },

    // "beginner" | "intermediate" | "advanced"
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // The career goal the user is aiming for (e.g. "Software Developer")
    goal: {
      type: String,
      default: null,
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // RESUME PARSER FIELDS (Added in Phase 1 / Onboarding)
    // ─────────────────────────────────────────────────────────────────────────────
    
    // Skills dynamically extracted from the user's uploaded PDF resume
    extractedSkills: {
      type: [String],
      default: [],
    },

    // The complete raw JSON data output from the Python parser (for future features)
    resumeParsedData: {
      type: Object,
      default: {},
    },

  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────────────────────────
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare entered password to hash ─────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
