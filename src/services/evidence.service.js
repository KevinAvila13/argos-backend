import { pool } from '../config/db.js';

export const addEvidenceItemService = async ({
  case_id,
  technician_id,
  description,
  color,
  size,
  weight,
  location
}) => {

  const query = `
    SELECT sp_add_evidence_item(
      $1, $2, $3, $4, $5, $6, $7
    ) AS evidence_id;
  `;

  const values = [
    case_id,
    technician_id,
    description,
    color,
    size,
    weight,
    location
  ];

  const result = await pool.query(query, values);

  return result.rows[0].evidence_id;
};

/**
 * Get all evidence items for a specific case
 * @param {number} case_id - The case ID
 * @returns {Array} List of evidence items
 */
export const getEvidenceByCaseService = async (case_id) => {
  const query = `
    SELECT * FROM sp_get_evidence_by_case($1);
  `;

  const result = await pool.query(query, [case_id]);

  return result.rows;
};

/**
 * Get a single evidence item by ID
 * @param {number} evidence_id - The evidence ID
 * @returns {Object} Evidence item details
 */
export const getEvidenceByIdService = async (evidence_id) => {
  const query = `
    SELECT * FROM sp_get_evidence_item($1);
  `;

  const result = await pool.query(query, [evidence_id]);

  if (result.rows.length === 0) {
    throw new Error(`Evidence item with ID ${evidence_id} does not exist`);
  }

  return result.rows[0];
};

/**
 * Update an evidence item (only for draft cases)
 * @param {number} evidence_id - The evidence ID to update
 * @param {Object} data - Fields to update
 * @returns {number} Updated evidence ID
 */
export const updateEvidenceService = async (evidence_id, { description, color, size, weight, location }) => {
  const query = `
    SELECT sp_update_evidence_item($1, $2, $3, $4, $5, $6) AS evidence_id;
  `;

  const values = [
    evidence_id,
    description || null,
    color || null,
    size || null,
    weight || null,
    location || null
  ];

  const result = await pool.query(query, values);

  return result.rows[0].evidence_id;
};

/**
 * Delete an evidence item (only for draft cases)
 * @param {number} evidence_id - The evidence ID to delete
 * @returns {number} Deleted evidence ID
 */
export const deleteEvidenceService = async (evidence_id) => {
  const query = `
    SELECT sp_delete_evidence_item($1) AS evidence_id;
  `;

  const result = await pool.query(query, [evidence_id]);

  return result.rows[0].evidence_id;
};
