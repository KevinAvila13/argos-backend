import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the database pool
jest.unstable_mockModule('../../src/config/db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Import after mocking
const { pool } = await import('../../src/config/db.js');
const {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateUser,
  registerUser
} = await import('../../src/services/auth.service.js');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 10);

      const result = await comparePassword('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 1, username: 'testuser', role: 'technician' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include payload data in token', () => {
      const payload = { userId: 1, username: 'testuser', role: 'technician' };
      const token = generateToken(payload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.role).toBe('technician');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const payload = { userId: 1, username: 'testuser', role: 'technician' };
      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('testuser');
    });

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' }
      );

      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'tech01',
          email: 'tech01@argos.com',
          password_hash: hashedPassword,
          full_name: 'Test Technician',
          role: 'technician',
          is_active: true
        }]
      });

      const result = await authenticateUser('tech01', 'Password123!');

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('tech01');
      expect(result.user.role).toBe('technician');
    });

    it('should throw error for invalid username', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await expect(authenticateUser('nonexistent', 'password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'tech01',
          password_hash: hashedPassword,
          is_active: true
        }]
      });

      await expect(authenticateUser('tech01', 'WrongPassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'tech01',
          password_hash: hashedPassword,
          is_active: false
        }]
      });

      await expect(authenticateUser('tech01', 'Password123!'))
        .rejects.toThrow('Account is disabled');
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ user_id: 7 }]
      });

      const userData = {
        username: 'newuser',
        email: 'newuser@argos.com',
        password: 'SecurePass123!',
        full_name: 'New User',
        role: 'technician'
      };

      const result = await registerUser(userData);

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.user_id).toBe(7);
      expect(result.user.username).toBe('newuser');
    });

    it('should throw error for short password', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@argos.com',
        password: 'short',
        full_name: 'New User',
        role: 'technician'
      };

      await expect(registerUser(userData))
        .rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should throw error for missing password', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@argos.com',
        password: '',
        full_name: 'New User',
        role: 'technician'
      };

      await expect(registerUser(userData))
        .rejects.toThrow('Password must be at least 8 characters long');
    });
  });
});
