const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Groq = require('groq-sdk');

const router = express.Router();

/**
 * POST /api/interview/chat
 * Handles both the initialization and the multi-turn chat.
 * Body: { history: [], currentAnswer: "" }
 */
router.post('/chat', protect, async (req, res) => {
  try {
    const { history = [], currentAnswer = "", goalOverride = "" } = req.body;
    
    // Fetch the user to get their goal and skills
    const userDoc = await User.findById(req.user._id);

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: "GROQ API Key is missing. Cannot start interview." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Format variables (Prioritize the dynamic override)
    const goal = goalOverride || userDoc.goal || "Software Engineer";

    // If the user provided a goal override on the first turn, globally save it to their DB
    if (goalOverride && !userDoc.goal) {
      await User.findByIdAndUpdate(req.user._id, { goal: goalOverride });
    }
    const knownSkills = userDoc?.extractedSkills?.length > 0 
      ? userDoc.extractedSkills.join(", ") 
      : "Basic technical skills";

    // Build the strict System Prompt
    const SYSTEM_PROMPT = `You are an expert, strict, professional hiring manager and technical recruiter interviewing a candidate for the position of [${goal}].
The candidate's resume shows they have the following skills: [${knownSkills}].

RULES:
1. You must ONLY ask ONE question at a time. Do not ask multi-part questions.
2. Questions must be technical and specifically related to the skills on their resume and the role of ${goal}.
3. The interview MUST end exactly after you have asked 5 questions.
4. On the 6th response (after they answer the 5th question), you MUST output a final Diagnostic string starting exactly with "FINAL_SCORE:" followed by a score out of 100, then briefly explain their strengths and weaknesses.
5. If the user gives a bad answer, briefly correct them before moving to the next question.
6. Keep your responses under 100 words. Be conversational but highly professional.`;

    // Construct the message array to send to Groq
    const messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    // Append the history so the AI remembers the conversation state
    if (history.length > 0) {
      history.forEach(msg => {
        messages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text });
      });
    }

    // Append the entirely new current answer from the user
    if (currentAnswer) {
      messages.push({ role: "user", content: currentAnswer });
    } else if (history.length === 0) {
      // If there is no history and no answer, the user is just starting the interview.
      messages.push({ role: "user", content: "Hi, I am ready to begin the interview." });
    }

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.1-8b-instant",
    });

    const aiResponse = completion.choices[0].message.content;

    // INTERCEPT PHASE 3: SCORING
    if (aiResponse.includes('FINAL_SCORE:')) {
      const scoreMatch = aiResponse.match(/FINAL_SCORE:\s*(\d{1,3})/);
      if (scoreMatch && scoreMatch[1]) {
        const numericScore = parseInt(scoreMatch[1], 10);
        const bestScore = userDoc.bestInterviewScore || 0;
        
        await User.findByIdAndUpdate(req.user._id, {
          lastInterviewScore: numericScore,
          bestInterviewScore: numericScore > bestScore ? numericScore : bestScore
        });
      }
    }

    res.status(200).json({
      reply: aiResponse
    });

  } catch (err) {
    console.error("POST /api/interview/chat error:", err.message);
    res.status(500).json({ message: "Failed to communicate with AI recruiter." });
  }
});

module.exports = router;
