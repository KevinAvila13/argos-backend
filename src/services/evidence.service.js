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
