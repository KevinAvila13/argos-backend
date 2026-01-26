import { createCaseFileService } from '../services/case.service.js';

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
