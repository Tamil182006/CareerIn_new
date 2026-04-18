const express = require("express");
const multer = require("multer");
const Profile = require("../models/Profile");
const runParser = require("../utils/runParser");

const router = express.Router();

const upload = multer({ dest: "src/uploads/" });

router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const userId = req.body.userId;
    const filePath = req.file.path;

    // Run parser.py
    const parsedData = await runParser(filePath);

    // Save to DB
    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        userId,
        basic_info: parsedData.basic_info,
        sections: parsedData.sections
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Resume uploaded and parsed successfully",
      profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
