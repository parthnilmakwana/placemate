const mongoose = require('mongoose');

const PortfolioDraftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileDraft: {
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    theme: { type: String, default: 'minimal' },
    skills: { type: [String], default: [] },
    education: [{
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      fieldOfStudy: { type: String },
      startYear: { type: Number },
      endYear: { type: Number },
      description: { type: String, default: '' }
    }],
    experience: [{
      company: { type: String, required: true },
      position: { type: String, required: true },
      location: { type: String },
      startDate: { type: String },
      endDate: { type: String }, // e.g. "Present" or date string
      current: { type: Boolean, default: false },
      description: { type: String, default: '' }
    }],
    projects: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      technologies: { type: [String], default: [] },
      githubLink: { type: String, default: '' },
      liveLink: { type: String, default: '' }
    }]
  },
  isApplied: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('PortfolioDraft', PortfolioDraftSchema);
