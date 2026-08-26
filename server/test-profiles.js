const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne();
  if (!user) {
    console.log("No users found");
    process.exit(1);
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  try {
    const res = await fetch('http://localhost:5000/api/profiles', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", text);
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
  process.exit(0);
}

run();
