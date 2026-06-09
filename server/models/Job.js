const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // Secondary dedup key — the unique ID the source API uses for this job
  externalJobId: {
    type: String,
    default: null,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please enter a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please enter a company name'],
    trim: true
  },
  location: {
    type: String,
    default: 'Remote',
    trim: true
  },
  // Which job family this belongs to — drives the fixed-category sync strategy
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Full Stack', 'Android', 'Data Science', 'DevOps', 'Other'],
    default: 'Other',
    index: true
  },
  // Explicit technology skills extracted from the description by normalize.js
  skills: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: [true, 'Please enter a job description']
  },
  // Kept for backward compatibility with existing documents
  requirements: {
    type: [String],
    default: []
  },
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior', 'any'],
    default: 'any'
  },
  educationLevel: {
    type: String,
    enum: ['bachelors', 'masters', 'phd', 'any'],
    default: 'any'
  },
  salary: {
    type: String,
    default: 'Not Specified',
    trim: true
  },
  applyLink: {
    type: String,
    required: [true, 'Please enter an application link'],
    unique: true,
    index: true,
    trim: true
  },
  isDirectLink: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'Scraped',
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  // When this job was last fetched/refreshed from the external API
  fetchedDate: {
    type: Date,
    default: Date.now
  },
  // Soft-delete flag — false means expired. We never hard-delete jobs.
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index: fast lookups for "show me active Frontend jobs, newest first"
JobSchema.index({ category: 1, isActive: 1, postedDate: -1 });

// Text index: powers the keyword search endpoint (searches title, company, description)
JobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);
