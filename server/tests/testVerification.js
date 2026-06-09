const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load configurations
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const SentJob = require('../models/SentJob');
const { loginUser } = require('../controllers/authController');
const { getJobsHistory } = require('../controllers/jobController');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/placemate';

async function runVerification() {
  console.log('=== Starting Phase 2 Verification Checks ===');
  console.log(`Connecting to database: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const testEmail = 'lockout-test@example.com';
  const testPassword = 'SecurePass123!';

  // Clean up any residual test records
  await User.deleteMany({ email: testEmail });

  try {
    // 1. Create a fresh test user
    console.log('\n[1/3] Creating test user for lockout simulation...');
    const user = await User.create({
      name: 'Lockout Tester',
      email: testEmail,
      password: testPassword,
      username: 'lockouttester',
      hasCompletedOnboarding: true
    });
    console.log('✔ User created.');

    // Mock Express request / response objects
    const makeLoginRequest = async (email, password) => {
      let statusValue = 200;
      let jsonPayload = null;

      const req = {
        body: { email, password }
      };
      const res = {
        status: (code) => {
          statusValue = code;
          return res;
        },
        json: (data) => {
          jsonPayload = data;
          return res;
        }
      };

      await loginUser(req, res, (err) => {
        if (err) throw err;
      });

      return { status: statusValue, data: jsonPayload };
    };

    // 2. Perform 4 failed logins (should NOT lock out yet)
    console.log('\n[2/3] Simulating 4 failed login attempts (should return Invalid credentials)...');
    for (let i = 1; i <= 4; i++) {
      const response = await makeLoginRequest(testEmail, 'WrongPassword123!');
      console.log(`  Attempt ${i}: Status=${response.status}, Message="${response.data?.message}"`);
    }

    // Check attempts in DB
    let dbUser = await User.findOne({ email: testEmail }).select('+loginAttempts +lockUntil');
    console.log(`  Current database loginAttempts: ${dbUser.loginAttempts}, lockUntil: ${dbUser.lockUntil}`);

    if (dbUser.loginAttempts !== 4 || dbUser.lockUntil) {
      throw new Error('Verification Failed: Login attempts counter or lockout state is incorrect!');
    }

    // 3. Perform 5th failed login (should trigger LOCKOUT)
    console.log('\nSimulating 5th failed login attempt (should trigger lockout)...');
    const response5 = await makeLoginRequest(testEmail, 'WrongPassword123!');
    console.log(`  Attempt 5: Status=${response5.status}, Message="${response5.data?.message}"`);

    dbUser = await User.findOne({ email: testEmail }).select('+loginAttempts +lockUntil');
    console.log(`  Current database loginAttempts: ${dbUser.loginAttempts}, lockUntil: ${dbUser.lockUntil ? new Date(dbUser.lockUntil).toLocaleTimeString() : 'none'}`);

    if (dbUser.loginAttempts < 5 || !dbUser.lockUntil) {
      throw new Error('Verification Failed: Account failed to lock after 5 attempts!');
    }

    // 4. Try 6th login while locked (should immediately reject with lockout message)
    console.log('\nSimulating 6th attempt while locked (should return locked message)...');
    const response6 = await makeLoginRequest(testEmail, 'WrongPassword123!');
    console.log(`  Attempt 6: Status=${response6.status}, Message="${response6.data?.message}"`);

    if (response6.status !== 401 || !response6.data?.message.includes('locked')) {
      throw new Error('Verification Failed: Account lockout response not returned!');
    }
    console.log('✔ Brute force lockout verification successful!');

    // 5. Verify search filters on jobs history
    console.log('\n[3/3] Verifying server-side search and status filters...');
    
    // Clear existing SentJobs for this user
    await SentJob.deleteMany({ userId: user._id });

    // Seed two jobs
    console.log('  Seeding test matched jobs...');
    const job1 = await SentJob.create({
      userId: user._id,
      title: 'Senior Frontend Developer',
      company: 'AlphaCorp Tech Solutions',
      location: 'Remote',
      score: 85,
      status: 'matched',
      applyLink: 'https://alphacorp.com/apply',
      isDirectLink: true
    });

    const job2 = await SentJob.create({
      userId: user._id,
      title: 'Junior React Dev',
      company: 'BetaInc Systems',
      location: 'India',
      score: 90,
      status: 'applied',
      applyLink: 'https://betainc.com/apply'
    });
    console.log('  Seeded 2 jobs.');

    // Helper to request history list
    const queryHistory = async (queryParams) => {
      let statusValue = 200;
      let jsonPayload = null;

      const req = {
        user: { _id: user._id },
        query: queryParams
      };
      const res = {
        status: (code) => {
          statusValue = code;
          return res;
        },
        json: (data) => {
          jsonPayload = data;
          return res;
        }
      };

      await getJobsHistory(req, res, (err) => {
        if (err) throw err;
      });

      return { status: statusValue, data: jsonPayload };
    };

    // Filter A: Search for "Alpha"
    console.log('\n  Querying: search="Alpha" (expected 1 result: AlphaCorp)...');
    const resA = await queryHistory({ search: 'Alpha' });
    console.log(`  Result Count: ${resA.data?.count}, Matching Item Company: "${resA.data?.data?.[0]?.company}"`);
    console.log(`  isDirectLink value for AlphaCorp: ${resA.data?.data?.[0]?.isDirectLink} (Expected: true)`);
    if (resA.data?.count !== 1 || resA.data?.data?.[0]?.company !== 'AlphaCorp Tech Solutions' || resA.data?.data?.[0]?.isDirectLink !== true) {
      throw new Error('Verification Failed: Search filter or isDirectLink mapping is incorrect!');
    }

    // Filter B: Search for status "applied"
    console.log('\n  Querying: status="applied" (expected 1 result: BetaInc)...');
    const resB = await queryHistory({ status: 'applied' });
    console.log(`  Result Count: ${resB.data?.count}, Matching Item Company: "${resB.data?.data?.[0]?.company}"`);
    if (resB.data?.count !== 1 || resB.data?.data?.[0]?.company !== 'BetaInc Systems') {
      throw new Error('Verification Failed: Status filter did not return correct results!');
    }

    // Filter C: Search for "Developer" and status "matched"
    console.log('\n  Querying: search="Developer", status="matched" (expected 1 result: AlphaCorp)...');
    const resC = await queryHistory({ search: 'Developer', status: 'matched' });
    console.log(`  Result Count: ${resC.data?.count}, Matching Item: "${resC.data?.data?.[0]?.title}"`);
    if (resC.data?.count !== 1 || resC.data?.data?.[0]?.title !== 'Senior Frontend Developer') {
      throw new Error('Verification Failed: Combined filter did not return correct results!');
    }
    console.log('✔ Search and status filters verified successfully!');

    // Cleanup seeded records
    console.log('\nCleaning up seeded test verification data...');
    await User.findByIdAndDelete(user._id);
    await SentJob.deleteMany({ userId: user._id });
    console.log('✔ Cleaned.');

  } catch (err) {
    console.error('❌ Verification check failed with error:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase closed. Verification done.');
  }
}

runVerification();
