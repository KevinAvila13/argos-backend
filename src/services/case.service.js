import { pool } from '../config/db.js';

/**
 * Get all cases with optional filters
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Case status (draft, in_review, approved, rejected)
 * @param {string} filters.from_date - Start date filter
 * @param {string} filters.to_date - End date filter
 * @returns {Array} List of cases
 */
export const getCasesService = async ({ status, from_date, to_date }) => {
  const query = `
    SELECT * FROM sp_get_cases($1, $2, $3);
  `;

  const values = [
    status || null,
    from_date || null,
    to_date || null
  ];

  const result = await pool.query(query, values);

  return result.rows;
};

export const createCaseFileService = async (title, description, technician_id) => {
  const query = `
    SELECT sp_create_case_file($1, $2, $3) AS case_id;
  `;

  const values = [title, description, technician_id];

  const result = await pool.query(query, values);

  return result.rows[0].case_id;
};

export const submitCaseForReviewService = async (case_id) => {
  const query = `
    SELECT sp_submit_case_for_review($1) AS case_id;
  `;

  const values = [case_id];

  const result = await pool.query(query, values);

  return result.rows[0].case_id;
};

export const reviewCaseService = async ({
  case_id,
  coordinator_id,
  result,
  justification
}) => {

  const query = `
    SELECT sp_review_case($1, $2, $3, $4) AS case_id;
  `;

  const values = [case_id, coordinator_id, result, justification];

  const resultQuery = await pool.query(query, values);

  return resultQuery.rows[0].case_id;
};
