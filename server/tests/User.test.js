const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Mock bcrypt so we don't actually do heavy crypto in our simple test
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn()
}));

describe('User Model Unit Tests', () => {
  
  // We use this to clean up the mocked functions after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('matchPassword method', () => {
    
    it('should return true if the entered password matches the hashed password', async () => {
      // 1. Arrange (Setup our test data)
      // Create a dummy user in memory (this does NOT save to the database)
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_dummy_password'
      });

      // Tell our mock bcrypt to pretend the passwords match
      bcrypt.compare.mockResolvedValue(true);

      // 2. Act (Execute the function we are testing)
      const isMatch = await user.matchPassword('plain_password');

      // 3. Assert (Check if the results are what we expect)
      expect(isMatch).toBe(true);
      // Verify bcrypt was called with the correct arguments
      expect(bcrypt.compare).toHaveBeenCalledWith('plain_password', 'hashed_dummy_password');
    });

    it('should return false if the passwords do not match', async () => {
      // 1. Arrange
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_dummy_password'
      });

      // Tell our mock bcrypt to pretend the passwords DO NOT match
      bcrypt.compare.mockResolvedValue(false);

      // 2. Act
      const isMatch = await user.matchPassword('wrong_password');

      // 3. Assert
      expect(isMatch).toBe(false);
    });

  });
});
