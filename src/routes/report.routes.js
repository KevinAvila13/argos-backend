import { Router } from 'express';
import {
  getReportsSummary,
  getReportsByStatus,
  getReportsByDate,
  getReportsRejections,
  getReportsByTechnician
} from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All reports require authentication
router.use(authenticate);

// Reports are accessible to coordinators and admins only
router.use(authorize('coordinator', 'admin'));

// GET endpoints - Reports and Statistics
router.get('/summary', getReportsSummary);
router.get('/by-status', getReportsByStatus);
router.get('/by-date', getReportsByDate);
router.get('/rejections', getReportsRejections);
router.get('/by-technician', getReportsByTechnician);

export default router;
