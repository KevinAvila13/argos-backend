import { Router } from 'express';
import { createCaseFile, getCases } from '../controllers/case.controller.js';
import { submitCaseForReview } from '../controllers/case.controller.js';
import { reviewCase } from '../controllers/case.controller.js';

const router = Router();

// GET endpoints
router.get('/', getCases);

// POST endpoints
router.post('/', createCaseFile);
router.post('/submit', submitCaseForReview);
router.post('/review', reviewCase);

export default router;
