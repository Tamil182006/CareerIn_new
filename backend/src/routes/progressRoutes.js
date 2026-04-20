const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Progress = require('../models/Progress');

const router = express.Router();

/**
 * GET /api/progress/:slug
 * Fetch the user's progress for a specific career roadmap
 */
router.get('/:slug', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      careerSlug: req.params.slug
    });

    if (!progress) {
      return res.status(200).json({ completedSteps: [] });
    }

    res.status(200).json({ completedSteps: progress.completedSteps });
  } catch (error) {
    console.error('Fetch progress error:', error);
    res.status(500).json({ message: 'Server error fetching progress' });
  }
});

/**
 * POST /api/progress/:slug/check
 * Toggle a step completed state
 */
router.post('/:slug/check', protect, async (req, res) => {
  try {
    const { stepIndex } = req.body; // The index of the timeline step
    
    if (stepIndex === undefined) {
      return res.status(400).json({ message: 'stepIndex is required' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      careerSlug: req.params.slug
    });

    if (!progress) {
      // First time marking a step for this career
      progress = await Progress.create({
        user: req.user._id,
        careerSlug: req.params.slug,
        completedSteps: [stepIndex]
      });
    } else {
      // Toggle logic
      const hasStep = progress.completedSteps.includes(stepIndex);
      if (hasStep) {
        progress.completedSteps = progress.completedSteps.filter(s => s !== stepIndex);
      } else {
        progress.completedSteps.push(stepIndex);
      }
      await progress.save();
    }

    res.status(200).json({ 
      message: 'Progress saved', 
      completedSteps: progress.completedSteps 
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error saving progress' });
  }
});

module.exports = router;
