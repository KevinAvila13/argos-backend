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

describe('Cases Controller', () => {
  let technicianToken;
  let coordinatorToken;

  beforeAll(() => {
    technicianToken = global.testUtils.generateTestToken();
    coordinatorToken = global.testUtils.generateCoordinatorToken();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to mock auth middleware user lookup
  const mockAuthUser = (role = 'technician') => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        user_id: role === 'coordinator' ? 4 : 1,
        username: role === 'coordinator' ? 'coord01' : 'tech01',
        role: role,
        is_active: true
      }]
    });
  };

  describe('GET /api/cases', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/cases');

      expect(response.status).toBe(401);
    });

    it('should return all cases for authenticated user', async () => {
      mockAuthUser();

      pool.query.mockResolvedValueOnce({
        rows: [
          {
            case_id: 1,
            title: 'Test Case 1',
            status: 'draft',
            technician_name: 'Tech 1'
          },
          {
            case_id: 2,
            title: 'Test Case 2',
            status: 'approved',
            technician_name: 'Tech 2'
          }
        ]
      });

      const response = await request(app)
        .get('/api/cases')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter cases by status', async () => {
      mockAuthUser();

      pool.query.mockResolvedValueOnce({
        rows: [{
          case_id: 1,
          title: 'Draft Case',
          status: 'draft'
        }]
      });

      const response = await request(app)
        .get('/api/cases?status=draft')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(200);
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('GET /api/cases/:id', () => {
    it('should return a single case', async () => {
      mockAuthUser();

      pool.query.mockResolvedValueOnce({
        rows: [{
          case_id: 1,
          title: 'Test Case',
          description: 'Test description',
          status: 'draft',
          evidence_count: 3
        }]
      });

      const response = await request(app)
        .get('/api/cases/1')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.case_id).toBe(1);
    });

    it('should return 404 for non-existent case', async () => {
      mockAuthUser();

      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/cases/999')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/cases', () => {
    it('should return 403 for coordinator trying to create case', async () => {
      mockAuthUser('coordinator');

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          title: 'New Case',
          description: 'Description',
          technician_id: 1
        });

      expect(response.status).toBe(403);
    });

    it('should create a new case for technician', async () => {
      mockAuthUser('technician');

      pool.query.mockResolvedValueOnce({
        rows: [{ case_id: 5 }]
      });

      const response = await request(app)
        .post('/api/cases')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({
          title: 'New Case',
          description: 'Test description',
          technician_id: 1
        });

      expect(response.status).toBe(201);
      expect(response.body.case_id).toBe(5);
    });
  });

  describe('POST /api/cases/submit', () => {
    it('should submit case for review', async () => {
      mockAuthUser('technician');

      pool.query.mockResolvedValueOnce({
        rows: [{ case_id: 1 }]
      });

      const response = await request(app)
        .post('/api/cases/submit')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({ case_id: 1 });

      expect(response.status).toBe(200);
      expect(response.body.case_id).toBe(1);
    });
  });

  describe('POST /api/cases/review', () => {
    it('should return 403 for technician trying to review', async () => {
      mockAuthUser('technician');

      const response = await request(app)
        .post('/api/cases/review')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({
          case_id: 1,
          coordinator_id: 4,
          result: 'approved'
        });

      expect(response.status).toBe(403);
    });

    it('should allow coordinator to review case', async () => {
      mockAuthUser('coordinator');

      pool.query.mockResolvedValueOnce({
        rows: [{ case_id: 1 }]
      });

      const response = await request(app)
        .post('/api/cases/review')
        .set('Authorization', `Bearer ${coordinatorToken}`)
        .send({
          case_id: 1,
          coordinator_id: 4,
          result: 'approved'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/cases/:id', () => {
    it('should update a draft case', async () => {
      mockAuthUser('technician');

      pool.query.mockResolvedValueOnce({
        rows: [{ case_id: 1 }]
      });

      const response = await request(app)
        .put('/api/cases/1')
        .set('Authorization', `Bearer ${technicianToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/cases/:id', () => {
    it('should delete a draft case', async () => {
      mockAuthUser('technician');

      pool.query.mockResolvedValueOnce({
        rows: [{ case_id: 1 }]
      });

      const response = await request(app)
        .delete('/api/cases/1')
        .set('Authorization', `Bearer ${technicianToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
