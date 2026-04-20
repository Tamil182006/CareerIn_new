const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/generate-materials', protect, async (req, res) => {
  try {
    const { topic, level, goal } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    // Step 1: Call Groq to break down the topic into 3 highly search-optimized web topics
    const prompt = `You are a Career Curriculum Advisor for a ${level || 'beginner'} striving to become a ${goal || 'professional'}.
The user needs to learn the specific topic: "${topic}".
Your ONLY job right now is to return exactly 3 highly specific, highly actionable "Search Queries" or Sub-Topics that the user must study to master this topic.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "topics": [
    "Subtopic 1: Concept Details",
    "Subtopic 2: Practical Application",
    "Subtopic 3: Advanced Optimization"
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const responseContent = JSON.parse(completion.choices[0]?.message?.content);
    const subTopics = responseContent.topics || [];

    // Step 2: Phase 3 Web Scraper Execution (Puppeteer Edition)
    // We import the newly rewritten headless browser service.
    const { scrapeMultipleTopics } = require('../services/scraperService');

    // Puppeteer intelligently handles the 'One Browser, Multi-Tab' threading internally.
    const liveRAGPayload = await scrapeMultipleTopics(subTopics);

    res.status(200).json({
      success: true,
      results: liveRAGPayload
    });

  } catch (error) {
    console.error('Error in /generate-materials:', error);
    res.status(500).json({ error: 'Failed to generate training materials pipeline.', details: error.message });
  }
});


// ==========================================
// PHASE 4: ASSESSMENT GENERATION
// ==========================================
router.post('/generate-exam', protect, async (req, res) => {
  try {
    const { topic, level } = req.body;
    
    if (!topic) {
       return res.status(400).json({ error: 'Topic is strictly required for exam generation.' });
    }

    const prompt = `You are an expert technical examiner.
The user just studied the concept of: "${topic}". Their level is: ${level || 'beginner'}.
Generate a strict 5-question multiple choice exam to test their knowledge.

STRICT JSON OUTPUT FORMAT ONLY:
{
  "questions": [
    {
      "question": "What is the primary function of...",
      "options": ["A) Answer", "B) Answer", "C) Answer", "D) Answer"],
      "correctAnswerIndex": 1, 
      "explanation": "Because mechanism X dictates..."
    }
  ]
}
Note: correctAnswerIndex must be an integer 0-3 corresponding to the correct option in the array.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2, // keep it highly deterministic for exams
      response_format: { type: "json_object" }
    });

    const responseContent = JSON.parse(completion.choices[0]?.message?.content);

    res.status(200).json({
       success: true,
       exam: responseContent.questions || []
    });

  } catch (error) {
     console.error('Error in /generate-exam:', error);
     res.status(500).json({ error: 'Failed to generate exam module.', details: error.message });
  }
});

module.exports = router;
