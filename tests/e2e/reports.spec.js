import { test, expect } from '@playwright/test';

test.describe('Reports API E2E', () => {
  let coordinatorToken;
  let technicianToken;

  test.beforeAll(async ({ request }) => {
    // Login as coordinator
    const coordLogin = await request.post('/api/auth/login', {
      data: { username: 'coord01', password: 'Password123!' }
    });
    const coordData = await coordLogin.json();
    coordinatorToken = coordData.data.token;

    // Login as technician
    const techLogin = await request.post('/api/auth/login', {
      data: { username: 'tech01', password: 'Password123!' }
    });
    const techData = await techLogin.json();
    technicianToken = techData.data.token;
  });

  test.describe('GET /api/reports/summary', () => {
    test('should return summary statistics for coordinator', async ({ request }) => {
      const response = await request.get('/api/reports/summary', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('total_cases');
      expect(body.data).toHaveProperty('draft_cases');
      expect(body.data).toHaveProperty('approved_cases');
      expect(body.data).toHaveProperty('rejected_cases');
    });

    test('should deny access to technician', async ({ request }) => {
      const response = await request.get('/api/reports/summary', {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.status()).toBe(403);
    });
  });

  test.describe('GET /api/reports/by-status', () => {
    test('should return cases grouped by status', async ({ request }) => {
      const response = await request.get('/api/reports/by-status', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    test('should support date filters', async ({ request }) => {
      const response = await request.get('/api/reports/by-status?from_date=2024-01-01&to_date=2024-12-31', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.filters).toBeDefined();
    });
  });

  test.describe('GET /api/reports/by-date', () => {
    test('should return daily activity report', async ({ request }) => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await request.get(`/api/reports/by-date?from_date=${lastMonth}&to_date=${today}`, {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    test('should require date parameters', async ({ request }) => {
      const response = await request.get('/api/reports/by-date', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('required');
    });
  });

  test.describe('GET /api/reports/rejections', () => {
    test('should return rejected cases with justifications', async ({ request }) => {
      const response = await request.get('/api/reports/rejections', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  test.describe('GET /api/reports/by-technician', () => {
    test('should return technician performance metrics', async ({ request }) => {
      const response = await request.get('/api/reports/by-technician', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);

      if (body.data.length > 0) {
        expect(body.data[0]).toHaveProperty('technician_id');
        expect(body.data[0]).toHaveProperty('technician_name');
        expect(body.data[0]).toHaveProperty('total_cases');
      }
    });
  });
});
