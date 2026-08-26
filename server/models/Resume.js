const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
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
    default: 'My Resume'
  },
  settings: {
    themeId: { type: String, default: 'modern' },
    fontFamily: { type: String, default: 'Inter' },
    primaryColor: { type: String, default: '#1e293b' },
    secondaryColor: { type: String, default: '#4f46e5' },
    fontSize: { type: Number, default: 10 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', ResumeSchema);
