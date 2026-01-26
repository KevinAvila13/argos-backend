import { Router } from 'express';
import {
  login,
  register,
  getProfile,
  updatePassword,
  listUsers
} from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/change-password', authenticate, updatePassword);

// Admin only routes
router.get('/users', authenticate, authorize('admin'), listUsers);

export default router;
