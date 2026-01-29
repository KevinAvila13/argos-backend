import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock the auth service
jest.unstable_mockModule('../../src/services/auth.service.js', () => ({
  verifyToken: jest.fn(),
  getUserById: jest.fn()
}));

const { verifyToken, getUserById } = await import('../../src/services/auth.service.js');
const { authenticate, authorize } = await import('../../src/middleware/auth.middleware.js');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. No token provided.'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token123';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token format. Use: Bearer <token>'
      });
    });

    it('should return 401 for invalid token', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';
      verifyToken.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token'
      });
    });

    it('should return 401 for expired token', async () => {
      mockReq.headers.authorization = 'Bearer expired-token';
      verifyToken.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token expired. Please login again.'
      });
    });

    it('should return 401 if user not found', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      verifyToken.mockReturnValue({ userId: 1, username: 'test', role: 'technician' });
      getUserById.mockResolvedValue(null);

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found or account disabled'
      });
    });

    it('should call next() for valid token and user', async () => {
      mockReq.headers.authorization = 'Bearer valid-token';
      verifyToken.mockReturnValue({ userId: 1, username: 'tech01', role: 'technician' });
      getUserById.mockResolvedValue({
        user_id: 1,
        username: 'tech01',
        role: 'technician',
        is_active: true
      });

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        userId: 1,
        username: 'tech01',
        role: 'technician'
      });
    });
  });

  describe('authorize', () => {
    it('should return 401 if no user in request', () => {
      const middleware = authorize('technician');
      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });

    it('should return 403 if user role not allowed', () => {
      mockReq.user = { userId: 1, username: 'tech01', role: 'technician' };
      const middleware = authorize('coordinator', 'admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    });

    it('should call next() if user role is allowed', () => {
      mockReq.user = { userId: 1, username: 'tech01', role: 'technician' };
      const middleware = authorize('technician', 'admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow admin for any role requirement', () => {
      mockReq.user = { userId: 6, username: 'admin', role: 'admin' };
      const middleware = authorize('coordinator');

      middleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should allow multiple roles', () => {
      mockReq.user = { userId: 4, username: 'coord01', role: 'coordinator' };
      const middleware = authorize('technician', 'coordinator', 'admin');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
