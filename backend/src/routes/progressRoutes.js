const express = require("express");
const router = express.Router();

// ── Placeholder — will be fully built on Day 7 ───────────────────────────────
// POST /api/progress
router.post("/", (req, res) => {
  res.json({ message: "Progress routes coming Day 7 ⏳" });
});

module.exports = router;
