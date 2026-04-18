const express = require("express");
const Profile = require("../models/Profile");

const router = express.Router();

/**
 * POST /api/profile
 * Save parsed resume data
 */
router.post("/", async (req, res) => {
  try {
    const { userId, basic_info, sections } = req.body;

    let profile = await Profile.findOne({ userId });

    if (profile) {
      profile.basic_info = basic_info;
      profile.sections = sections;
      await profile.save();
    } else {
      profile = await Profile.create({
        userId,
        basic_info,
        sections
      });
    }

    res.status(200).json({
      message: "Profile saved successfully",
      profile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/profile/:userId
 * Fetch profile data
 */
router.get("/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.params.userId
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
