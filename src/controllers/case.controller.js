import {
  createCaseFileService,
  getCasesService,
  getCaseByIdService,
  updateCaseService,
  deleteCaseService
} from '../services/case.service.js';

/**
 * Get all cases with optional filters
 * Query params: status (draft, in_review, approved, rejected), from_date, to_date
 */
export const getCases = async (req, res) => {
  try {
    const { status, from_date, to_date } = req.query;

    const cases = await getCasesService({ status, from_date, to_date });

    res.status(200).json({
      success: true,
      count: cases.length,
      data: cases
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createCaseFile = async (req, res) => {
  try {
    const { title, description, technician_id } = req.body;

    const caseId = await createCaseFileService(title, description, technician_id);

    res.status(201).json({
      message: 'Case file created successfully',
      case_id: caseId
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

import { submitCaseForReviewService } from '../services/case.service.js';

export const submitCaseForReview = async (req, res) => {
  try {
    const { case_id } = req.body;

    const result = await submitCaseForReviewService(case_id);

    res.status(200).json({
      message: 'Case file submitted for review successfully',
      case_id: result
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

import { reviewCaseService } from '../services/case.service.js';

export const reviewCase = async (req, res) => {
  try {
    const { case_id, coordinator_id, result, justification } = req.body;

    const updatedCaseId = await reviewCaseService({
      case_id,
      coordinator_id,
      result,
      justification
    });

    res.status(200).json({
      message: `Case file ${result} successfully`,
      case_id: updatedCaseId
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get a single case by ID
 * Route: GET /api/cases/:id
 */
export const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseData = await getCaseByIdService(parseInt(id));

    res.status(200).json({
      success: true,
      data: caseData
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
 * Update a case file (only draft status)
 * Route: PUT /api/cases/:id
 */
export const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const updatedCaseId = await updateCaseService(parseInt(id), title, description);

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      case_id: updatedCaseId
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
 * Delete a case file (only draft status)
 * Route: DELETE /api/cases/:id
 */
export const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCaseId = await deleteCaseService(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully',
      case_id: deletedCaseId
    });

  } catch (error) {
    const statusCode = error.message.includes('does not exist') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
};

