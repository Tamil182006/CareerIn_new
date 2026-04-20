const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Database model
const { protect } = require('../middleware/authMiddleware'); // For protecting the route
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB max

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/upload
// Parses resume via Python, updates User profile with extracted skills & level
// ─────────────────────────────────────────────────────────────────────────────
router.post('/upload', protect, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' });
  }

  const filePath = req.file.path;
  // Point to the run_parser.py file explicitly
  const parserScript = path.join(__dirname, '../../resume_parser-main/run_parser.py');
  
  // The command to run python. (Assuming 'python' is in PATH)
  const command = `python "${parserScript}" "${filePath}"`;

  console.log(`[ResumeRoutes] Executing parser for user ${req.user.name}...`);
  console.log(`[ResumeRoutes] Command: ${command}`);

  exec(command, { maxBuffer: 1024 * 1024 * 5 }, async (error, stdout, stderr) => {
    // Attempt to delete the file immediately after finishing to save disk space
    fs.unlink(filePath, (err) => {
      if (err) console.error(`[ResumeRoutes] Failed to delete temporary file: ${filePath}`);
    });

    if (error) {
      console.error(`[ResumeRoutes] Python Error: ${error.message}`);
      console.error(`[ResumeRoutes] stderr: ${stderr}`);
      return res.status(500).json({ message: 'Resume analysis failed. Python processing error.' });
    }

    try {
      // The Python script prints [INFO] stuff before the JSON, so we gracefully slice out just the JSON
      const firstBrace = stdout.indexOf('{');
      const lastBrace = stdout.lastIndexOf('}');
      
      if (firstBrace === -1 || lastBrace === -1) {
         throw new Error("No valid JSON output found from Python parser.");
      }

      const jsonStr = stdout.substring(firstBrace, lastBrace + 1);
      const parsedData = JSON.parse(jsonStr);

      console.log(`[ResumeRoutes] Parse successful! Extracted ${parsedData.skills?.length || 0} skills.`);

      // 1. Calculate an Auto Skill Level based on what was found
      let determinedLevel = "Beginner";
      const skillCount = parsedData.skills ? parsedData.skills.length : 0;
      const hasExperience = parsedData.experience && parsedData.experience.length > 0;
      
      if (skillCount > 8 && hasExperience) {
        determinedLevel = "Advanced";
      } else if (skillCount >= 4 || hasExperience) {
        determinedLevel = "Intermediate";
      }

      // 2. Groq AI Analysis Pipeline (Phase 5 Polish)
      let aiAnalysis = null;
      try {
         const prompt = `You are an elite silicon valley recruiter and career coach.
Analyze the following parsed resume data:
Skills: ${(parsedData.skills || []).join(", ") || "None"}
Level: ${determinedLevel}

Please provide a highly critical but constructive analysis formatted strictly as JSON.
Format required:
{
  "strengths": "1-2 short sentences summarizing best technical traits.",
  "weaknesses": "1-2 short sentences summarizing critical missing skills or gaps.",
  "recommendedCareers": ["Software Engineer", "Data Analyst", "Product Manager"]
}
Limit recommendedCareers to exactly 3 highly relevant professional titles.`;

         const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            response_format: { type: "json_object" }
         });
         
         if (completion.choices[0]?.message?.content) {
            aiAnalysis = JSON.parse(completion.choices[0].message.content);
         }
      } catch (aiErr) {
         console.error("[ResumeRoutes] Groq AI Analysis failed natively:", aiErr.message);
      }

      // 3. Update the Database Document permanently
      const atsScoreInt = Math.round(parsedData.scoring?.["Total Score"] || 0);

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
          $set: {
            extractedSkills: parsedData.skills || [],
            skillLevel: determinedLevel,
            resumeParsedData: parsedData, // saving the entire structure just in case! 
            resumeAtsScore: atsScoreInt,
            resumeFeedback: aiAnalysis
          } 
        },
        { new: true } // Return the updated document
      );

      return res.status(200).json({ 
        message: "Resume analyzed perfectly!",
        levelDetermined: determinedLevel,
        skillsFound: parsedData.skills || [],
        atsScore: atsScoreInt,
        analysis: aiAnalysis
      });

    } catch (parseError) {
      console.error(`[ResumeRoutes] JSON Extraction Error:`, parseError);
      return res.status(500).json({ message: 'Failed to extract data from resume output.' });
    }
  });
});

module.exports = router;
