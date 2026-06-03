const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name']
  },
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true // Allows nulls in unique indexes (for backward compatibility if needed)
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Ensures password is not returned in database queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  // Unified profile nested state which feeds Portfolio, Resume, and Job Matching systems
  profile: {
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    theme: { type: String, enum: ['minimal', 'dark', 'bold'], default: 'minimal' },
    isPublic: { type: Boolean, default: true },
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
    }],
    preferences: {
      targetRoles: { type: [String], default: [] },
      targetLocations: { type: [String], default: [] },
      minimumSalary: { type: Number, default: 0 },
      jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Any'], default: 'Any' }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to encrypt password using bcryptjs
UserSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
