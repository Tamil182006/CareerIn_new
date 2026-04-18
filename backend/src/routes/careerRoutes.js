const express = require("express");
const Career = require("../models/Career");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/careers
// Returns all careers (id, slug, title, category, icon, skills, salary)
// Supports optional query: ?category=coding
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category.toLowerCase();
    }

    // Return everything EXCEPT the heavy roadmap array for the list view
    const careers = await Career.find(filter).select(
      "slug title category icon description skills salary relatedInterests"
    );

    res.status(200).json({
      count: careers.length,
      careers,
    });
  } catch (err) {
    console.error("GET /api/careers error:", err.message);
    res.status(500).json({ message: "Failed to fetch careers" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/careers/:slug
// Returns ONE career with full roadmap
// e.g. GET /api/careers/software-developer
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:slug", async (req, res) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug.toLowerCase() });

    if (!career) {
      return res.status(404).json({ message: "Career not found" });
    }

    res.status(200).json({ career });
  } catch (err) {
    console.error("GET /api/careers/:slug error:", err.message);
    res.status(500).json({ message: "Failed to fetch career" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/careers/recommend
// Body: { interests: ["coding", "design", ...] }
// Returns careers whose relatedInterests overlap with the user's interests
// Sorted by match score (most matching interests first)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/recommend", async (req, res) => {
  try {
    const { interests } = req.body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      // No interests given → return all careers
      const all = await Career.find().select(
        "slug title category icon description skills salary relatedInterests"
      );
      return res.status(200).json({ count: all.length, careers: all });
    }

    const lowerInterests = interests.map((i) => i.toLowerCase());

    // Find all careers where at least 1 interest matches
    const careers = await Career.find({
      relatedInterests: { $in: lowerInterests },
    }).select("slug title category icon description skills salary relatedInterests");

    // Score each career by how many interests match
    const scored = careers.map((c) => {
      const matchCount = c.relatedInterests.filter((interest) =>
        lowerInterests.includes(interest)
      ).length;
      return { ...c.toObject(), matchScore: matchCount };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      count: scored.length,
      careers: scored,
    });
  } catch (err) {
    console.error("POST /api/careers/recommend error:", err.message);
    res.status(500).json({ message: "Failed to get recommendations" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/careers/:slug/generate
// Body: { skillLevel: "beginner" }
// Uses Groq API (Llama 3) to generate a personalized 6-step roadmap on the fly
// ─────────────────────────────────────────────────────────────────────────────
const Groq = require("groq-sdk");

router.post("/:slug/generate", protect, async (req, res) => {
  try {
    const { skillLevel = "beginner" } = req.body;
    
    // Fetch the career and the user
    const career = await Career.findOne({ slug: req.params.slug.toLowerCase() });
    const userDoc = await User.findById(req.user._id);

    if (!career) {
      return res.status(404).json({ message: "Career not found" });
    }

    if (!process.env.GROQ_API_KEY) {
      console.log("No GROQ_API_KEY found, falling back to static database roadmap.");
      return res.status(200).json({ roadmap: career.roadmap });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Format the skills pulled from the Python Parser
    const knownSkills = userDoc?.extractedSkills?.length > 0 
      ? userDoc.extractedSkills.join(", ") 
      : "None";

    const prompt = `You are an expert career counselor. Create a highly detailed 6-step learning roadmap for a user whose current skill level is [${skillLevel}], and who wants to become a [${career.title}].
    
    IMPORTANT: The user ALREADY possesses the following skills from their parsed resume: [${knownSkills}].
    If they have skills listed, you MUST completely skip any steps teaching those exact basics, and advance the roadmap accordingly to prevent wasting their time.

    You MUST output valid JSON containing:
    1. An "aiReasoning" string explaining mathematically why you built this roadmap based on their existing skills.
    2. A "roadmap" array of exactly 6 steps.
    NO markdown, NO formatting, just purely JSON.
    Example:
    {
      "aiReasoning": "Because your resume shows you already know React and Python, we skipped frontend basics and started you directly at Data Pipeline construction.",
      "roadmap": [
        {
          "step": 1,
          "title": "Short title of step",
          "desc": "Detailed explanation of what to learn or do.",
          "duration": "Estimated time (e.g. 2-3 weeks)",
          "advancedTip": "One advanced pro-tip for this step."
        }
      ]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    let text = completion.choices[0].message.content;

    // Clean up any potential markdown formatting just in case
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);
    const roadmap = parsed.roadmap || parsed; // Handles if the model nested it or returned it flat
    const aiReasoning = parsed.aiReasoning || "Custom AI roadmap generated based on your profile.";
    
    console.log(`✅ Groq AI generated roadmap and reasoning for: ${career.title} | Level: ${skillLevel}`);

    res.status(200).json({ roadmap, aiReasoning });
  } catch (err) {
    console.error("POST /api/careers/:slug/generate error:", err.message);
    // On failure, smoothly fallback to the hardcoded DB roadmap
    try {
      const career = await Career.findOne({ slug: req.params.slug.toLowerCase() });
      res.status(200).json({ roadmap: career.roadmap, fallback: true });
    } catch {
      res.status(500).json({ message: "Failed to generate roadmap" });
    }
  }
});

module.exports = router;
