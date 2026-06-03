const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Load environment configurations
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_for_placemate_app_12345';

const runTests = async () => {
  console.log('--- Starting Authentication Test Suite ---');
  
  try {
    // 1. Establish database connection
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connection active.\n');

    // Clean up any residual test data before starting
    const testEmail = 'testrunner@example.com';
    await User.deleteMany({ email: testEmail });

    // 2. Test Registration & Hashing
    console.log('Test 1: User Registration and Hashing...');
    const plainPassword = 'securepassword123';
    const testUserObj = {
      name: 'Auth Test Runner',
      email: testEmail,
      password: plainPassword
    };

    // User.create should trigger the schema pre-save hashing hook
    const user = await User.create(testUserObj);
    console.log('✔ User created successfully in database.');
    
    // Fetch directly from DB including password field to inspect it
    const dbRecord = await User.findById(user._id).select('+password');
    console.log(`  Hashed password: ${dbRecord.password}`);
    
    if (dbRecord.password === plainPassword) {
      throw new Error('❌ Test Failed: Password stored in database is in plain text!');
    }
    console.log('✔ Passwords verified hashed in database.\n');

    // 3. Test Password Comparison
    console.log('Test 2: Password Verification...');
    const isMatchCorrect = await dbRecord.matchPassword(plainPassword);
    console.log(`  Correct password check: ${isMatchCorrect ? 'Match' : 'No Match'}`);
    if (!isMatchCorrect) {
      throw new Error('❌ Test Failed: Correct password failed to match!');
    }

    const isMatchIncorrect = await dbRecord.matchPassword('wrongpassword');
    console.log(`  Incorrect password check: ${isMatchIncorrect ? 'Match' : 'No Match'}`);
    if (isMatchIncorrect) {
      throw new Error('❌ Test Failed: Incorrect password matched!');
    }
    console.log('✔ Password comparison functions verified.\n');

    // 4. Test Token signing and parsing
    console.log('Test 3: Token Signing & Verification...');
    const token = jwt.sign({ id: dbRecord._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`  Signed token: ${token.substring(0, 30)}...`);

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(`  Decoded user ID: ${decoded.id}`);
    
    if (decoded.id !== dbRecord._id.toString()) {
      throw new Error('❌ Test Failed: Decoded ID does not match database user ID!');
    }
    console.log('✔ Token generation and verification successful.\n');

    // 5. Cleanup database records
    console.log('Cleaning up database...');
    await User.findByIdAndDelete(dbRecord._id);
    console.log('✔ Test user document deleted successfully.\n');

    console.log('--- ALL AUTH TESTS COMPLETED SUCCESSFULLY! ---');
  } catch (error) {
    console.error('An error occurred during test execution:\n', error);
  } finally {
    // Disconnect DB connection
    await mongoose.disconnect();
    console.log('Database disconnected.');
  }
};

runTests();
