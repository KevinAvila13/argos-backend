import { Router } from 'express';
import {
  getReportsSummary,
  getReportsByStatus,
  getReportsByDate,
  getReportsRejections,
  getReportsByTechnician
} from '../controllers/report.controller.js';

const router = Router();

// GET endpoints - Reports and Statistics
router.get('/summary', getReportsSummary);              // Overall summary statistics
router.get('/by-status', getReportsByStatus);           // Cases grouped by status
router.get('/by-date', getReportsByDate);               // Daily activity report
router.get('/rejections', getReportsRejections);        // Rejected cases details
router.get('/by-technician', getReportsByTechnician);   // Cases by technician

export default router;
