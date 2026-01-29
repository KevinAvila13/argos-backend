import { jest } from '@jest/globals';
import request from 'supertest';

// Mock the database before importing app
jest.unstable_mockModule('../../src/config/db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = await import('../../src/config/db.js');
const { default: app } = await import('../../src/app.js');
const bcrypt = await import('bcryptjs');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123!' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should return 400 if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'tech01' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid credentials', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 200 with token for valid credentials', async () => {
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

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'tech01', password: 'Password123!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe('tech01');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 201 for successful registration', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ user_id: 7 }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@argos.com',
          password: 'SecurePass123!',
          full_name: 'New User',
          role: 'technician'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.username).toBe('newuser');
    });

    it('should return 409 for duplicate username', async () => {
      pool.query.mockRejectedValueOnce(new Error('Username already exists'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@argos.com',
          password: 'SecurePass123!',
          full_name: 'Existing User',
          role: 'technician'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 200 with user profile for valid token', async () => {
      // Mock getUserById for token verification
      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'tech01',
          email: 'tech01@argos.com',
          full_name: 'Test Technician',
          role: 'technician',
          is_active: true
        }]
      });

      // Mock getUserById for profile
      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'tech01',
          email: 'tech01@argos.com',
          full_name: 'Test Technician',
          role: 'technician',
          is_active: true,
          created_at: new Date()
        }]
      });

      const token = global.testUtils.generateTestToken();

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
