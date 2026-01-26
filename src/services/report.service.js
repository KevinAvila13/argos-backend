import { pool } from '../config/db.js';

/**
 * Get summary statistics of all cases
 * @returns {Object} Summary with total counts by status
 */
export const getReportsSummaryService = async () => {
  const query = `
    SELECT * FROM sp_get_reports_summary();
  `;

  const result = await pool.query(query);

  return result.rows[0];
};

/**
 * Get cases grouped by status with optional date filters
 * @param {Date} from_date - Start date filter (optional)
 * @param {Date} to_date - End date filter (optional)
 * @returns {Array} Cases grouped by status
 */
export const getReportsByStatusService = async (from_date, to_date) => {
  const query = `
    SELECT * FROM sp_get_reports_by_status($1, $2);
  `;

  const result = await pool.query(query, [from_date || null, to_date || null]);

  return result.rows;
};

/**
 * Get daily activity report for a date range
 * @param {Date} from_date - Start date (required)
 * @param {Date} to_date - End date (required)
 * @returns {Array} Daily activity breakdown
 */
export const getReportsByDateService = async (from_date, to_date) => {
  if (!from_date || !to_date) {
    throw new Error('Both from_date and to_date are required for date reports');
  }

  const query = `
    SELECT * FROM sp_get_reports_by_date($1, $2);
  `;

  const result = await pool.query(query, [from_date, to_date]);

  return result.rows;
};

/**
 * Get detailed list of rejected cases
 * @param {Date} from_date - Start date filter (optional)
 * @param {Date} to_date - End date filter (optional)
 * @returns {Array} Rejected cases with justifications
 */
export const getReportsRejectionsService = async (from_date, to_date) => {
  const query = `
    SELECT * FROM sp_get_reports_rejections($1, $2);
  `;

  const result = await pool.query(query, [from_date || null, to_date || null]);

  return result.rows;
};

/**
 * Get cases grouped by technician
 * @param {Date} from_date - Start date filter (optional)
 * @param {Date} to_date - End date filter (optional)
 * @returns {Array} Cases grouped by technician
 */
export const getReportsByTechnicianService = async (from_date, to_date) => {
  const query = `
    SELECT * FROM sp_get_reports_by_technician($1, $2);
  `;

  const result = await pool.query(query, [from_date || null, to_date || null]);

  return result.rows;
};
