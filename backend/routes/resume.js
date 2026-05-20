import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';
import Resume from '../models/Resume.js';

const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// Fallback analysis when ML service is offline
// ──────────────────────────────────────────────────────────────────────────────
function fallbackAnalysis(text) {
  const text_lower = text.toLowerCase();
  const words = text.trim().split(/\s+/);
  const wordCount = words.length;

  const skillKeywords = [
    "python","javascript","java","react","node.js","c++","html","css",
    "mongodb","mysql","aws","docker","git","typescript","django","flask",
    "machine learning","deep learning","sql","linux","php","kotlin","swift"
  ];
  const skills = skillKeywords.filter(s => text_lower.includes(s))
    .map(s => s.charAt(0).toUpperCase() + s.slice(1));

  const flags = ["⚠️ ML Service Offline — basic fallback analysis used"];

  let confidence = 60;
  if (wordCount < 50)  { confidence -= 20; flags.push("⚠️ Resume too short"); }
  if (skills.length === 0) { confidence -= 10; flags.push("⚠️ No recognizable skills found"); }

  const completeness = wordCount > 300 ? 70 : wordCount > 150 ? 50 : 30;

  return {
    skills,
    skills_by_category: skills.length > 0 ? { "General": skills } : {},
    confidence_score: Math.max(0, confidence),
    completeness_score: completeness,
    flags,
    experience_years: 0,
    education: [],
    sections_found: [],
    contact_info: { email: false, phone: false, linkedin: false, github: false },
    word_count: wordCount,
    analysis_depth: "Basic (Fallback)",
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/resume/upload  — Candidate uploads & analyzes resume
// ──────────────────────────────────────────────────────────────────────────────
router.post('/upload', protect(['Candidate']), async (req, res) => {
  try {
    const { text, certificateHashes } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Resume text cannot be empty' });
    }

    // ── Call ML Microservice ──────────────────────────────────────────────────
    let analysis;
    let mlOnline = false;
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'}/analyze-resume`,
        { text },
        { timeout: 5000 }
      );
      analysis = mlResponse.data;
      mlOnline = true;
    } catch (mlError) {
      console.warn('⚠️  ML Service unreachable — using fallback analysis');
      analysis = fallbackAnalysis(text);
    }

    // ── Trust Score Calculation ───────────────────────────────────────────────
    const hasCertificates  = certificateHashes && certificateHashes.length > 0;
    const blockchainScore  = hasCertificates ? 40 : 0;
    
    // AI Scores (Max 50 combined)
    const aiScore          = ((analysis.confidence_score || 0) / 100) * 30;
    const completenessScore= ((analysis.completeness_score || 0) / 100) * 20;

    // Contact Scores (Max 10)
    const ci = analysis.contact_info || {};
    const contactScore =
      (ci.email    ? 4 : 0) +
      (ci.phone    ? 2 : 0) +
      (ci.linkedin ? 2 : 0) +
      (ci.github   ? 2 : 0);

    // Skill Density Bonus (Max 10)
    const skillCount = analysis.skills?.length || 0;
    const skillBonus = Math.min(10, Math.floor(skillCount / 3)); // 1 point per 3 skills, max 10

    // Experience Bonus (Max 5)
    const expYears = analysis.experience_years || 0;
    const expBonus = Math.min(5, Math.floor(expYears / 2)); // 1 point per 2 years, max 5

    // Length Bonus (Max 5)
    const lengthBonus = Math.min(5, Math.floor((analysis.word_count || 0) / 100)); // 1 point per 100 words

    let trustScore = Math.round(blockchainScore + aiScore + completenessScore + contactScore + skillBonus + expBonus + lengthBonus);
    
    // Cap at 100
    trustScore = Math.min(100, trustScore);

    // ── Save to DB ────────────────────────────────────────────────────────────
    const resume = await Resume.create({
      userId:            req.user.id,
      text,
      skills:            analysis.skills || [],
      skillsByCategory:  analysis.skills_by_category || {},
      confidenceScore:   analysis.confidence_score || 0,
      completenessScore: analysis.completeness_score || 0,
      flags:             analysis.flags || [],
      trustScore,
      blockchainVerified: hasCertificates,
      experienceYears:   analysis.experience_years,
      education:         analysis.education || [],
      sectionsFound:     analysis.sections_found || [],
      contactInfo:       analysis.contact_info || {},
      wordCount:         analysis.word_count || 0,
      analysisDepth:     analysis.analysis_depth || 'Basic',
      mlOnline,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/resume/all  — Recruiter / Admin: all resumes
// ──────────────────────────────────────────────────────────────────────────────
router.get('/all', protect(['Recruiter', 'Admin']), async (req, res) => {
  try {
    const resumes = await Resume.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/resume/my-resume  — Candidate: own resumes
// ──────────────────────────────────────────────────────────────────────────────
router.get('/my-resume', protect(['Candidate']), async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// DELETE /api/resume/:id  — Candidate deletes own resume
// ──────────────────────────────────────────────────────────────────────────────
router.delete('/:id', protect(['Candidate']), async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
