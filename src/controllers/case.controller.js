import { createCaseFileService, getCasesService } from '../services/case.service.js';

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

