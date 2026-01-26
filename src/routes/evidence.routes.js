import { Router } from 'express';
import {
  addEvidenceItem,
  getEvidenceByCase,
  getEvidenceById,
  updateEvidence,
  deleteEvidence
} from '../controllers/evidence.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET endpoints - All authenticated users can view
router.get('/case/:caseId', getEvidenceByCase);
router.get('/:id', getEvidenceById);

// POST/PUT/DELETE - Technicians and admins only
router.post('/', authorize('technician', 'admin'), addEvidenceItem);
router.put('/:id', authorize('technician', 'admin'), updateEvidence);
router.delete('/:id', authorize('technician', 'admin'), deleteEvidence);

export default router;
