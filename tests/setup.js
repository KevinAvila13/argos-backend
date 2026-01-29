// Jest test setup file
// Configure environment for testing

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '1h';

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  generateTestToken: () => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 1, username: 'testuser', role: 'technician' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  generateAdminToken: () => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 6, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  generateCoordinatorToken: () => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId: 4, username: 'coord01', role: 'coordinator' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
};

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
