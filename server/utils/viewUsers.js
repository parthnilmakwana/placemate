const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const viewUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate';
  console.log(`Connecting to database at ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Successfully connected to MongoDB.\n');

    // Query all user documents from the collection
    const users = await User.find({});
    console.log(`=== REGISTERED USERS LIST (Count: ${users.length}) ===\n`);

    if (users.length === 0) {
      console.log('No users found in the database yet. Go register one in the browser!');
    } else {
      users.forEach((user, index) => {
        console.log(`[User #${index + 1}]`);
        console.log(`  ID:         ${user._id}`);
        console.log(`  Name:       ${user.name}`);
        console.log(`  Email:      ${user.email}`);
        console.log(`  Role:       ${user.role}`);
        console.log(`  Plan:       ${user.plan}`);
        console.log(`  Registered: ${user.createdAt.toLocaleString()}`);
        console.log('------------------------------------------------');
      });
    }
  } catch (error) {
    console.error('Error querying MongoDB:', error.message);
  } finally {
    // Terminate DB connection
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
};

viewUsers();
