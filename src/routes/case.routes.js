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

const router = Router();

// GET endpoints
router.get('/', getCases);           // Get all cases with filters
router.get('/:id', getCaseById);     // Get single case by ID

// POST endpoints
router.post('/', createCaseFile);            // Create new case
router.post('/submit', submitCaseForReview); // Submit for review
router.post('/review', reviewCase);          // Approve/reject case

// PUT endpoints
router.put('/:id', updateCase);      // Update case (draft only)

// DELETE endpoints
router.delete('/:id', deleteCase);   // Delete case (draft only)

export default router;
