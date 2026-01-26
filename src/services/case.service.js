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

/**
 * Get a single case by ID
 * @param {number} case_id - The case ID to retrieve
 * @returns {Object} Case details with technician/coordinator names and evidence count
 */
export const getCaseByIdService = async (case_id) => {
  const query = `
    SELECT * FROM sp_get_case_by_id($1);
  `;

  const result = await pool.query(query, [case_id]);

  if (result.rows.length === 0) {
    throw new Error(`Case with ID ${case_id} does not exist`);
  }

  return result.rows[0];
};

/**
 * Update a case file (only draft status)
 * @param {number} case_id - The case ID to update
 * @param {string} title - New title (optional)
 * @param {string} description - New description (optional)
 * @returns {number} Updated case ID
 */
export const updateCaseService = async (case_id, title, description) => {
  const query = `
    SELECT sp_update_case($1, $2, $3) AS case_id;
  `;

  const values = [case_id, title || null, description || null];

  const result = await pool.query(query, values);

  return result.rows[0].case_id;
};

/**
 * Delete a case file (only draft status)
 * @param {number} case_id - The case ID to delete
 * @returns {number} Deleted case ID
 */
export const deleteCaseService = async (case_id) => {
  const query = `
    SELECT sp_delete_case($1) AS case_id;
  `;

  const result = await pool.query(query, [case_id]);

  return result.rows[0].case_id;
};
