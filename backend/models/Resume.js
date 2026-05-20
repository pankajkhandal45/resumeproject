import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:              { type: String, required: true },

  // Core AI Analysis
  skills:            [String],
  skillsByCategory:  { type: mongoose.Schema.Types.Mixed, default: {} },
  confidenceScore:   { type: Number, default: 0 },
  completenessScore: { type: Number, default: 0 },
  flags:             [String],

  // Trust Score (composite)
  trustScore:        { type: Number, default: 0 },
  blockchainVerified:{ type: Boolean, default: false },

  // Extra parsed info
  experienceYears:   { type: Number, default: null },
  education:         [String],
  sectionsFound:     [String],
  contactInfo: {
    email:    { type: Boolean, default: false },
    phone:    { type: Boolean, default: false },
    linkedin: { type: Boolean, default: false },
    github:   { type: Boolean, default: false },
  },
  wordCount:         { type: Number, default: 0 },
  analysisDepth:     { type: String, default: 'Basic' },
  mlOnline:          { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Resume', resumeSchema);
