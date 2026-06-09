const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Feedback must be associated with a user']
  },
  category: {
    type: String,
    enum: ['Bug Report', 'Suggestion', 'Feature Request', 'Other'],
    required: [true, 'Please select a feedback category']
  },
  rating: {
    type: Number,
    required: [true, 'Please rate your experience'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  text: {
    type: String,
    required: [true, 'Please provide feedback details'],
    minlength: [10, 'Feedback description must be at least 10 characters long']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
