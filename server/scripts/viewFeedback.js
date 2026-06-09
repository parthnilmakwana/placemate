const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Load env configurations
dotenv.config();

const viewFeedback = async () => {
  try {
    // Connect to database (fallbacks to local database if MONGO_URI is missing)
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/placemate';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully!\n');

    // Fetch all feedback and join user details using populate()
    const feedbackList = await Feedback.find().populate('userId', 'name email');
    
    if (feedbackList.length === 0) {
      console.log('----------------------------------------------------');
      console.log('No feedback records found in the database yet.');
      console.log('Submit feedback through the PlaceMate web UI to see records here.');
      console.log('----------------------------------------------------');
    } else {
      console.log('====================================================');
      console.log(`   FOUND ${feedbackList.length} FEEDBACK SUBMISSIONS`);
      console.log('====================================================\n');
      
      feedbackList.forEach((fb, idx) => {
        console.log(`[Submission #${idx + 1}]`);
        console.log(`- Date:     ${fb.createdAt}`);
        console.log(`- Category: ${fb.category}`);
        console.log(`- Rating:   ${fb.rating} / 5`);
        console.log(`- User:     ${fb.userId ? fb.userId.name : 'Unknown User'} (${fb.userId ? fb.userId.email : 'N/A'})`);
        console.log(`- Message:  "${fb.text}"`);
        console.log('----------------------------------------------------');
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from database.');
  } catch (err) {
    console.error('Error connecting to database or querying feedback:', err.message);
    process.exit(1);
  }
};

viewFeedback();
