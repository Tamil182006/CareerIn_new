const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware (MUST come before routes) ─────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes    = require("./src/routes/authRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const resumeRoute   = require("./src/routes/resumeRoutes");
const careerRoutes  = require("./src/routes/careerRoutes");
const progressRoutes = require("./src/routes/progressRoutes");

app.use("/api/auth",     authRoutes);
app.use("/api/profile",  profileRoutes);
app.use("/api/resume",   resumeRoute);
app.use("/api/careers",  careerRoutes);
app.use("/api/progress", progressRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "CareerIN backend running ✅" });
});

// ── DB + Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB connection error:", err));
