import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  test.describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          username: 'tech01',
          password: 'Password123!'
        }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.token).toBeDefined();
      expect(body.data.user.username).toBe('tech01');
      expect(body.data.user.role).toBe('technician');
    });

    test('should fail with invalid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          username: 'tech01',
          password: 'WrongPassword'
        }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid credentials');
    });

    test('should fail with missing credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          username: 'tech01'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });

  test.describe('GET /api/auth/profile', () => {
    test('should return profile with valid token', async ({ request }) => {
      // First login to get token
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          username: 'tech01',
          password: 'Password123!'
        }
      });
      const { data: { token } } = await loginResponse.json();

      // Get profile
      const response = await request.get('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.username).toBe('tech01');
    });

    test('should fail without token', async ({ request }) => {
      const response = await request.get('/api/auth/profile');

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.error).toContain('No token provided');
    });

    test('should fail with invalid token', async ({ request }) => {
      const response = await request.get('/api/auth/profile', {
        headers: {
          'Authorization': 'Bearer invalid-token-here'
        }
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Role-based access', () => {
    test('technician should not access admin endpoints', async ({ request }) => {
      // Login as technician
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          username: 'tech01',
          password: 'Password123!'
        }
      });
      const { data: { token } } = await loginResponse.json();

      // Try to access admin-only endpoint
      const response = await request.get('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(403);
      const body = await response.json();
      expect(body.error).toContain('Insufficient permissions');
    });

    test('admin should access admin endpoints', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          username: 'admin',
          password: 'Password123!'
        }
      });
      const { data: { token } } = await loginResponse.json();

      // Access admin-only endpoint
      const response = await request.get('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
