import { test, expect } from '@playwright/test';

test.describe('Case Workflow E2E', () => {
  let technicianToken;
  let coordinatorToken;

  test.beforeAll(async ({ request }) => {
    // Login as technician
    const techLogin = await request.post('/api/auth/login', {
      data: { username: 'tech01', password: 'Password123!' }
    });
    const techData = await techLogin.json();
    technicianToken = techData.data.token;

    // Login as coordinator
    const coordLogin = await request.post('/api/auth/login', {
      data: { username: 'coord01', password: 'Password123!' }
    });
    const coordData = await coordLogin.json();
    coordinatorToken = coordData.data.token;
  });

  test.describe('Complete Case Lifecycle', () => {
    let caseId;
    let evidenceId;

    test('Step 1: Technician creates a new case', async ({ request }) => {
      const response = await request.post('/api/cases', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: {
          title: 'E2E Test Case',
          description: 'Created by Playwright E2E test',
          technician_id: 1
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.case_id).toBeDefined();
      caseId = body.case_id;
    });

    test('Step 2: Verify case is in draft status', async ({ request }) => {
      const response = await request.get(`/api/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.data.status).toBe('draft');
    });

    test('Step 3: Technician adds evidence to case', async ({ request }) => {
      const response = await request.post('/api/evidence', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: {
          case_id: caseId,
          technician_id: 1,
          description: 'E2E Test Evidence Item',
          color: 'Blue',
          size: '10cm',
          weight: '100g',
          location: 'Test Location'
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.evidence_id).toBeDefined();
      evidenceId = body.evidence_id;
    });

    test('Step 4: Verify evidence was added', async ({ request }) => {
      const response = await request.get(`/api/evidence/case/${caseId}`, {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.count).toBeGreaterThanOrEqual(1);
    });

    test('Step 5: Technician submits case for review', async ({ request }) => {
      const response = await request.post('/api/cases/submit', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: { case_id: caseId }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.case_id).toBe(caseId);
    });

    test('Step 6: Verify case is now in_review', async ({ request }) => {
      const response = await request.get(`/api/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.data.status).toBe('in_review');
    });

    test('Step 7: Coordinator reviews and approves case', async ({ request }) => {
      const response = await request.post('/api/cases/review', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` },
        data: {
          case_id: caseId,
          coordinator_id: 4,
          result: 'approved'
        }
      });

      expect(response.ok()).toBeTruthy();
    });

    test('Step 8: Verify case is approved', async ({ request }) => {
      const response = await request.get(`/api/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.data.status).toBe('approved');
      expect(body.data.review_result).toBe('approved');
    });
  });

  test.describe('Case Rejection Flow', () => {
    let caseId;

    test('Create and submit a case for rejection test', async ({ request }) => {
      // Create case
      const createResponse = await request.post('/api/cases', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: {
          title: 'E2E Rejection Test Case',
          description: 'This case will be rejected',
          technician_id: 1
        }
      });
      const createBody = await createResponse.json();
      caseId = createBody.case_id;

      // Add evidence
      await request.post('/api/evidence', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: {
          case_id: caseId,
          technician_id: 1,
          description: 'Evidence for rejection test'
        }
      });

      // Submit for review
      await request.post('/api/cases/submit', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: { case_id: caseId }
      });
    });

    test('Coordinator rejects case with justification', async ({ request }) => {
      const response = await request.post('/api/cases/review', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` },
        data: {
          case_id: caseId,
          coordinator_id: 4,
          result: 'rejected',
          justification: 'Incomplete evidence documentation. Please add more details.'
        }
      });

      expect(response.ok()).toBeTruthy();
    });

    test('Verify case is rejected with justification', async ({ request }) => {
      const response = await request.get(`/api/cases/${caseId}`, {
        headers: { 'Authorization': `Bearer ${technicianToken}` }
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.data.status).toBe('rejected');
      expect(body.data.review_result).toBe('rejected');
      expect(body.data.rejection_justification).toContain('Incomplete');
    });
  });

  test.describe('Permission Tests', () => {
    test('Technician cannot review cases', async ({ request }) => {
      const response = await request.post('/api/cases/review', {
        headers: { 'Authorization': `Bearer ${technicianToken}` },
        data: {
          case_id: 1,
          coordinator_id: 4,
          result: 'approved'
        }
      });

      expect(response.status()).toBe(403);
    });

    test('Coordinator cannot create cases', async ({ request }) => {
      const response = await request.post('/api/cases', {
        headers: { 'Authorization': `Bearer ${coordinatorToken}` },
        data: {
          title: 'Should Fail',
          description: 'Coordinator creating case',
          technician_id: 4
        }
      });

      expect(response.status()).toBe(403);
    });
  });
});
