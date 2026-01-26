import {
  getReportsSummaryService,
  getReportsByStatusService,
  getReportsByDateService,
  getReportsRejectionsService,
  getReportsByTechnicianService
} from '../services/report.service.js';

/**
 * Get summary statistics of all cases
 * Route: GET /api/reports/summary
 */
export const getReportsSummary = async (req, res) => {
  try {
    const summary = await getReportsSummaryService();

    res.status(200).json({
      success: true,
      data: summary
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get cases grouped by status
 * Route: GET /api/reports/by-status
 * Query params: from_date, to_date (optional)
 */
export const getReportsByStatus = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const report = await getReportsByStatusService(from_date, to_date);

    res.status(200).json({
      success: true,
      filters: { from_date: from_date || null, to_date: to_date || null },
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get daily activity report for a date range
 * Route: GET /api/reports/by-date
 * Query params: from_date (required), to_date (required)
 */
export const getReportsByDate = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    if (!from_date || !to_date) {
      return res.status(400).json({
        success: false,
        error: 'Both from_date and to_date are required'
      });
    }

    const report = await getReportsByDateService(from_date, to_date);

    res.status(200).json({
      success: true,
      filters: { from_date, to_date },
      count: report.length,
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get detailed list of rejected cases
 * Route: GET /api/reports/rejections
 * Query params: from_date, to_date (optional)
 */
export const getReportsRejections = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const rejections = await getReportsRejectionsService(from_date, to_date);

    res.status(200).json({
      success: true,
      filters: { from_date: from_date || null, to_date: to_date || null },
      count: rejections.length,
      data: rejections
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get cases grouped by technician
 * Route: GET /api/reports/by-technician
 * Query params: from_date, to_date (optional)
 */
export const getReportsByTechnician = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    const report = await getReportsByTechnicianService(from_date, to_date);

    res.status(200).json({
      success: true,
      filters: { from_date: from_date || null, to_date: to_date || null },
      count: report.length,
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
