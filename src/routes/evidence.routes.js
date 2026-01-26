import { Router } from 'express';
import {
  addEvidenceItem,
  getEvidenceByCase,
  getEvidenceById,
  updateEvidence,
  deleteEvidence
} from '../controllers/evidence.controller.js';

const router = Router();

// GET endpoints
router.get('/case/:caseId', getEvidenceByCase);  // Get all evidence for a case
router.get('/:id', getEvidenceById);              // Get single evidence by ID

// POST endpoints
router.post('/', addEvidenceItem);                // Add new evidence item

// PUT endpoints
router.put('/:id', updateEvidence);               // Update evidence (draft only)

// DELETE endpoints
router.delete('/:id', deleteEvidence);            // Delete evidence (draft only)

export default router;
