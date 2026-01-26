import { Router } from 'express';
import { addEvidenceItem } from '../controllers/evidence.controller.js';

const router = Router();

router.post('/', addEvidenceItem);

export default router;
