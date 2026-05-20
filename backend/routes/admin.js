import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';

const router = express.Router();

router.get('/users', protect(['Admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect(['Admin']), async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const resumeCount = await Resume.countDocuments();
    res.json({ userCount, resumeCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
