const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Optimization: Speeds up finding all profiles for a user
  },
  profileType: {
    type: String,
    enum: ['OWNER', 'CUSTOM'],
    required: true,
    default: 'CUSTOM'
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },

  // Professional Identity Information
  fullName: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  
  bio: { type: String, default: '' },
  title: { type: String, default: '' }, // Professional Title
  profilePhoto: { type: String, default: '' },
  
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  website: { type: String, default: '' },
  
  theme: { type: String, default: 'minimal' }, // Default preferred theme for this profile
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
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }],
  
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    githubLink: { type: String, default: '' },
    liveLink: { type: String, default: '' }
  }],
  
  certifications: [{
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String },
    link: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

// Enforce one OWNER profile per user. 
// This creates a partial unique index where profileType = 'OWNER'
ProfileSchema.index(
  { userId: 1, profileType: 1 }, 
  { unique: true, partialFilterExpression: { profileType: 'OWNER' } }
);

// Enforce one DEFAULT profile per user
ProfileSchema.index(
  { userId: 1, isDefault: 1 }, 
  { unique: true, partialFilterExpression: { isDefault: true } }
);

module.exports = mongoose.model('Profile', ProfileSchema);
