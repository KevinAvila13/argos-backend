-- =============================================
-- Argos Evidence Management System
-- Evidence Items Stored Procedures
-- Description: All stored procedures for evidence item operations
-- Author: Argos Development Team
-- Version: 1.0
-- =============================================

-- =============================================
-- Procedure: sp_add_evidence_item
-- Description: Adds a new evidence item (indicio) to a case
--
-- What it does:
--   1. Validates that the case exists and is in 'draft' status
--   2. Validates that the technician exists and is active
--   3. Creates a new evidence item
--   4. Returns the new evidence_id
--
-- Parameters:
--   p_case_id: ID of the case to add evidence to
--   p_technician_id: ID of the technician adding the evidence
--   p_description: Detailed description of the evidence item
--   p_color: Color of the item (optional)
--   p_size: Size/dimensions of the item (optional)
--   p_weight: Weight of the item (optional)
--   p_location: Where the item was found (optional)
--
-- Returns: INTEGER (new evidence_id)
--
-- Business Rules:
--   - Case must exist and be in 'draft' status
--   - Cannot add evidence to cases that are already in review or closed
--   - Description is mandatory
--
-- Example usage:
--   SELECT sp_add_evidence_item(
--     1,
--     1,
--     'Blue handled kitchen knife',
--     'Blue and silver',
--     '20cm length',
--     '150g',
--     'Kitchen drawer'
--   );
-- =============================================
CREATE OR REPLACE FUNCTION sp_add_evidence_item(
  p_case_id INTEGER,
  p_technician_id INTEGER,
  p_description TEXT,
  p_color VARCHAR(100),
  p_size VARCHAR(100),
  p_weight VARCHAR(100),
  p_location TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_evidence_id INTEGER;
  v_case_status VARCHAR(50);
  v_technician_exists BOOLEAN;
BEGIN
  -- Validate: Check if case exists and get its status
  SELECT status INTO v_case_status
  FROM cases
  WHERE case_id = p_case_id;

  IF v_case_status IS NULL THEN
    RAISE EXCEPTION 'Case with ID % does not exist', p_case_id;
  END IF;

  -- Validate: Case must be in draft status
  IF v_case_status != 'draft' THEN
    RAISE EXCEPTION 'Cannot add evidence to a case that is not in draft status. Current status: %', v_case_status;
  END IF;

  -- Validate: Check if technician exists and is active
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE user_id = p_technician_id
    AND role = 'technician'
    AND is_active = TRUE
  ) INTO v_technician_exists;

  IF NOT v_technician_exists THEN
    RAISE EXCEPTION 'Technician with ID % does not exist or is not active', p_technician_id;
  END IF;

  -- Validate: Description cannot be empty
  IF p_description IS NULL OR TRIM(p_description) = '' THEN
    RAISE EXCEPTION 'Evidence description cannot be empty';
  END IF;

  -- Insert new evidence item
  INSERT INTO evidence_items (
    case_id,
    technician_id,
    description,
    color,
    size,
    weight,
    location
  ) VALUES (
    p_case_id,
    p_technician_id,
    p_description,
    p_color,
    p_size,
    p_weight,
    p_location
  )
  RETURNING evidence_id INTO v_evidence_id;

  -- Return the new evidence ID
  RETURN v_evidence_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding evidence item: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_add_evidence_item IS 'Adds a new evidence item to a case in draft status.';


-- =============================================
-- Procedure: sp_get_evidence_by_case
-- Description: Retrieves all evidence items for a specific case
--
-- What it does:
--   1. Fetches all evidence items for a given case
--   2. Joins with users table to get technician name
--   3. Returns sorted by creation date (oldest first)
--
-- Parameters:
--   p_case_id: ID of the case to get evidence for
--
-- Returns: Table with evidence item information
--
-- Example usage:
--   SELECT * FROM sp_get_evidence_by_case(1);
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_evidence_by_case(
  p_case_id INTEGER
)
RETURNS TABLE (
  evidence_id INTEGER,
  case_id INTEGER,
  technician_id INTEGER,
  technician_name VARCHAR(255),
  description TEXT,
  color VARCHAR(100),
  size VARCHAR(100),
  weight VARCHAR(100),
  location TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  -- Validate: Check if case exists
  IF NOT EXISTS(SELECT 1 FROM cases WHERE cases.case_id = p_case_id) THEN
    RAISE EXCEPTION 'Case with ID % does not exist', p_case_id;
  END IF;

  RETURN QUERY
  SELECT
    e.evidence_id,
    e.case_id,
    e.technician_id,
    u.full_name AS technician_name,
    e.description,
    e.color,
    e.size,
    e.weight,
    e.location,
    e.created_at,
    e.updated_at
  FROM
    evidence_items e
  LEFT JOIN
    users u ON e.technician_id = u.user_id
  WHERE
    e.case_id = p_case_id
  ORDER BY
    e.created_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_evidence_by_case IS 'Retrieves all evidence items for a specific case.';


-- =============================================
-- Procedure: sp_get_evidence_item
-- Description: Retrieves a single evidence item by ID
--
-- What it does:
--   1. Fetches a specific evidence item
--   2. Joins with users table to get technician name
--   3. Returns the evidence item details
--
-- Parameters:
--   p_evidence_id: ID of the evidence item to retrieve
--
-- Returns: Table with single evidence item information
--
-- Example usage:
--   SELECT * FROM sp_get_evidence_item(1);
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_evidence_item(
  p_evidence_id INTEGER
)
RETURNS TABLE (
  evidence_id INTEGER,
  case_id INTEGER,
  technician_id INTEGER,
  technician_name VARCHAR(255),
  description TEXT,
  color VARCHAR(100),
  size VARCHAR(100),
  weight VARCHAR(100),
  location TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.evidence_id,
    e.case_id,
    e.technician_id,
    u.full_name AS technician_name,
    e.description,
    e.color,
    e.size,
    e.weight,
    e.location,
    e.created_at,
    e.updated_at
  FROM
    evidence_items e
  LEFT JOIN
    users u ON e.technician_id = u.user_id
  WHERE
    e.evidence_id = p_evidence_id;

  -- Check if evidence was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evidence item with ID % does not exist', p_evidence_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_evidence_item IS 'Retrieves a single evidence item by ID.';


-- =============================================
-- Procedure: sp_update_evidence_item
-- Description: Updates an evidence item (only if case is in draft status)
--
-- What it does:
--   1. Validates the evidence item exists
--   2. Validates the associated case is in 'draft' status
--   3. Updates the provided fields
--   4. Returns the evidence_id
--
-- Parameters:
--   p_evidence_id: ID of the evidence item to update
--   p_description: New description (optional)
--   p_color: New color (optional)
--   p_size: New size (optional)
--   p_weight: New weight (optional)
--   p_location: New location (optional)
--
-- Returns: INTEGER (evidence_id)
--
-- Business Rules:
--   - Can only update evidence for cases in 'draft' status
--   - At least one field must be provided
--
-- Example usage:
--   SELECT sp_update_evidence_item(1, 'Updated description', 'Red', NULL, NULL, NULL);
-- =============================================
CREATE OR REPLACE FUNCTION sp_update_evidence_item(
  p_evidence_id INTEGER,
  p_description TEXT,
  p_color VARCHAR(100),
  p_size VARCHAR(100),
  p_weight VARCHAR(100),
  p_location TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_case_id INTEGER;
  v_case_status VARCHAR(50);
BEGIN
  -- Get the case_id for this evidence item
  SELECT case_id INTO v_case_id
  FROM evidence_items
  WHERE evidence_id = p_evidence_id;

  IF v_case_id IS NULL THEN
    RAISE EXCEPTION 'Evidence item with ID % does not exist', p_evidence_id;
  END IF;

  -- Check if the case is in draft status
  SELECT status INTO v_case_status
  FROM cases
  WHERE case_id = v_case_id;

  IF v_case_status != 'draft' THEN
    RAISE EXCEPTION 'Cannot update evidence for a case that is not in draft status. Current status: %', v_case_status;
  END IF;

  -- Validate: Description cannot be empty if provided
  IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
    RAISE EXCEPTION 'Evidence description cannot be empty';
  END IF;

  -- Update evidence item (only update fields that are not NULL)
  UPDATE evidence_items
  SET
    description = COALESCE(p_description, description),
    color = COALESCE(p_color, color),
    size = COALESCE(p_size, size),
    weight = COALESCE(p_weight, weight),
    location = COALESCE(p_location, location),
    updated_at = CURRENT_TIMESTAMP
  WHERE evidence_id = p_evidence_id;

  RETURN p_evidence_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating evidence item: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_update_evidence_item IS 'Updates an evidence item. Only works for cases in draft status.';


-- =============================================
-- Procedure: sp_delete_evidence_item
-- Description: Deletes an evidence item (only if case is in draft status)
--
-- What it does:
--   1. Validates the evidence item exists
--   2. Validates the associated case is in 'draft' status
--   3. Deletes the evidence item
--   4. Returns the deleted evidence_id
--
-- Parameters:
--   p_evidence_id: ID of the evidence item to delete
--
-- Returns: INTEGER (deleted evidence_id)
--
-- Business Rules:
--   - Can only delete evidence for cases in 'draft' status
--   - Once a case is submitted, evidence cannot be deleted
--
-- Example usage:
--   SELECT sp_delete_evidence_item(1);
-- =============================================
CREATE OR REPLACE FUNCTION sp_delete_evidence_item(
  p_evidence_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_case_id INTEGER;
  v_case_status VARCHAR(50);
BEGIN
  -- Get the case_id for this evidence item
  SELECT case_id INTO v_case_id
  FROM evidence_items
  WHERE evidence_id = p_evidence_id;

  IF v_case_id IS NULL THEN
    RAISE EXCEPTION 'Evidence item with ID % does not exist', p_evidence_id;
  END IF;

  -- Check if the case is in draft status
  SELECT status INTO v_case_status
  FROM cases
  WHERE case_id = v_case_id;

  IF v_case_status != 'draft' THEN
    RAISE EXCEPTION 'Cannot delete evidence for a case that is not in draft status. Current status: %', v_case_status;
  END IF;

  -- Delete evidence item
  DELETE FROM evidence_items WHERE evidence_id = p_evidence_id;

  RETURN p_evidence_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error deleting evidence item: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_delete_evidence_item IS 'Deletes an evidence item. Only works for cases in draft status.';


-- =============================================
-- Success message
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Evidence stored procedures created successfully!';
  RAISE NOTICE '📦 Procedures created:';
  RAISE NOTICE '   - sp_add_evidence_item';
  RAISE NOTICE '   - sp_get_evidence_by_case';
  RAISE NOTICE '   - sp_get_evidence_item';
  RAISE NOTICE '   - sp_update_evidence_item';
  RAISE NOTICE '   - sp_delete_evidence_item';
END $$;
