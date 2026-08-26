const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Portfolio'
  },
  slug: {
    type: String,
    required: true,
    unique: true, // the /:slug URL for the public portfolio
    lowercase: true,
    trim: true
  },
  theme: {
    type: String,
    default: 'minimal'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
