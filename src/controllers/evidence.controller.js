import {
  addEvidenceItemService,
  getEvidenceByCaseService,
  getEvidenceByIdService,
  updateEvidenceService,
  deleteEvidenceService
} from '../services/evidence.service.js';

export const addEvidenceItem = async (req, res) => {
  try {
    const {
      case_id,
      technician_id,
      description,
      color,
      size,
      weight,
      location
    } = req.body;

    const evidenceId = await addEvidenceItemService({
      case_id,
      technician_id,
      description,
      color,
      size,
      weight,
      location
    });

    res.status(201).json({
      message: 'Evidence item added successfully',
      evidence_id: evidenceId
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all evidence items for a specific case
 * Route: GET /api/evidence/case/:caseId
 */
export const getEvidenceByCase = async (req, res) => {
  try {
    const { caseId } = req.params;

    const evidence = await getEvidenceByCaseService(parseInt(caseId));

    res.status(200).json({
      success: true,
      count: evidence.length,
      data: evidence
    });

  } catch (error) {
    const statusCode = error.message.includes('does not exist') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get a single evidence item by ID
 * Route: GET /api/evidence/:id
 */
export const getEvidenceById = async (req, res) => {
  try {
    const { id } = req.params;

    const evidence = await getEvidenceByIdService(parseInt(id));

    res.status(200).json({
      success: true,
      data: evidence
    });

  } catch (error) {
    const statusCode = error.message.includes('does not exist') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update an evidence item (only for draft cases)
 * Route: PUT /api/evidence/:id
 */
export const updateEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, color, size, weight, location } = req.body;

    const updatedId = await updateEvidenceService(parseInt(id), {
      description,
      color,
      size,
      weight,
      location
    });

    res.status(200).json({
      success: true,
      message: 'Evidence item updated successfully',
      evidence_id: updatedId
    });

  } catch (error) {
    const statusCode = error.message.includes('does not exist') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete an evidence item (only for draft cases)
 * Route: DELETE /api/evidence/:id
 */
export const deleteEvidence = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedId = await deleteEvidenceService(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Evidence item deleted successfully',
      evidence_id: deletedId
    });

  } catch (error) {
    const statusCode = error.message.includes('does not exist') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};
