import { addEvidenceItemService } from '../services/evidence.service.js';

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
