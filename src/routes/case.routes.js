import { Router } from 'express';
import {
  createCaseFile,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  submitCaseForReview,
  reviewCase
} from '../controllers/case.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET endpoints - All authenticated users can view
router.get('/', getCases);
router.get('/:id', getCaseById);

// POST endpoints - Technicians and admins can create/submit
router.post('/', authorize('technician', 'admin'), createCaseFile);
router.post('/submit', authorize('technician', 'admin'), submitCaseForReview);

// Coordinators and admins can review
router.post('/review', authorize('coordinator', 'admin'), reviewCase);

// PUT/DELETE - Technicians and admins can modify draft cases
router.put('/:id', authorize('technician', 'admin'), updateCase);
router.delete('/:id', authorize('technician', 'admin'), deleteCase);

export default router;
