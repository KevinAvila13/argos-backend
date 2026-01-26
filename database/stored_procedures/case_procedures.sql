-- =============================================
-- Argos Evidence Management System
-- Case Management Stored Procedures
-- Description: All stored procedures for case file operations
-- Author: Argos Development Team
-- Version: 1.0
-- =============================================

-- =============================================
-- Procedure: sp_create_case_file
-- Description: Creates a new case file in draft status
--
-- What it does:
--   1. Validates that the technician exists and is active
--   2. Creates a new case with 'draft' status
--   3. Returns the new case_id
--
-- Parameters:
--   p_title: Case title (required)
--   p_description: Detailed case description
--   p_technician_id: ID of the technician creating the case
--
-- Returns: INTEGER (new case_id)
--
-- Example usage:
--   SELECT sp_create_case_file('Evidence Case #001', 'Robbery investigation', 1);
-- =============================================
CREATE OR REPLACE FUNCTION sp_create_case_file(
  p_title VARCHAR(255),
  p_description TEXT,
  p_technician_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_case_id INTEGER;
  v_technician_exists BOOLEAN;
BEGIN
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

  -- Validate: Title cannot be empty
  IF p_title IS NULL OR TRIM(p_title) = '' THEN
    RAISE EXCEPTION 'Case title cannot be empty';
  END IF;

  -- Insert new case
  INSERT INTO cases (
    title,
    description,
    technician_id,
    status
  ) VALUES (
    p_title,
    p_description,
    p_technician_id,
    'draft'
  )
  RETURNING case_id INTO v_case_id;

  -- Return the new case ID
  RETURN v_case_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating case file: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_create_case_file IS 'Creates a new case file in draft status. Validates technician exists before creating.';


-- =============================================
-- Procedure: sp_submit_case_for_review
-- Description: Submits a case from 'draft' to 'in_review' status
--
-- What it does:
--   1. Validates the case exists and is in 'draft' status
--   2. Checks that the case has at least one evidence item
--   3. Updates status to 'in_review'
--   4. Sets submitted_at timestamp
--   5. Returns the case_id
--
-- Parameters:
--   p_case_id: ID of the case to submit
--
-- Returns: INTEGER (case_id)
--
-- Business Rules:
--   - Case must be in 'draft' status
--   - Case must have at least 1 evidence item before submission
--
-- Example usage:
--   SELECT sp_submit_case_for_review(1);
-- =============================================
CREATE OR REPLACE FUNCTION sp_submit_case_for_review(
  p_case_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_current_status VARCHAR(50);
  v_evidence_count INTEGER;
BEGIN
  -- Validate: Check if case exists and get current status
  SELECT status INTO v_current_status
  FROM cases
  WHERE case_id = p_case_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Case with ID % does not exist', p_case_id;
  END IF;

  -- Validate: Case must be in draft status
  IF v_current_status != 'draft' THEN
    RAISE EXCEPTION 'Case must be in draft status to submit for review. Current status: %', v_current_status;
  END IF;

  -- Validate: Check if case has at least one evidence item
  SELECT COUNT(*) INTO v_evidence_count
  FROM evidence_items
  WHERE case_id = p_case_id;

  IF v_evidence_count = 0 THEN
    RAISE EXCEPTION 'Case must have at least one evidence item before submission';
  END IF;

  -- Update case status to in_review
  UPDATE cases
  SET
    status = 'in_review',
    submitted_at = CURRENT_TIMESTAMP
  WHERE case_id = p_case_id;

  -- Return the case ID
  RETURN p_case_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error submitting case for review: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_submit_case_for_review IS 'Submits a case for coordinator review. Requires at least one evidence item.';


-- =============================================
-- Procedure: sp_review_case
-- Description: Coordinator reviews a case (approve or reject)
--
-- What it does:
--   1. Validates the case is in 'in_review' status
--   2. Validates the coordinator exists and has proper role
--   3. If rejected, requires justification
--   4. Updates case with review result
--   5. Sets reviewed_at timestamp
--   6. Returns the case_id
--
-- Parameters:
--   p_case_id: ID of the case to review
--   p_coordinator_id: ID of the coordinator reviewing
--   p_result: Review result ('approved' or 'rejected')
--   p_justification: Required if rejected, explains why
--
-- Returns: INTEGER (case_id)
--
-- Business Rules:
--   - Case must be in 'in_review' status
--   - Coordinator must have 'coordinator' role
--   - Rejection requires justification
--   - Approval finalizes the case
--
-- Example usage (approve):
--   SELECT sp_review_case(1, 2, 'approved', NULL);
--
-- Example usage (reject):
--   SELECT sp_review_case(1, 2, 'rejected', 'Missing evidence photos');
-- =============================================
CREATE OR REPLACE FUNCTION sp_review_case(
  p_case_id INTEGER,
  p_coordinator_id INTEGER,
  p_result VARCHAR(50),
  p_justification TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_current_status VARCHAR(50);
  v_coordinator_exists BOOLEAN;
BEGIN
  -- Validate: Check if case exists and get current status
  SELECT status INTO v_current_status
  FROM cases
  WHERE case_id = p_case_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Case with ID % does not exist', p_case_id;
  END IF;

  -- Validate: Case must be in in_review status
  IF v_current_status != 'in_review' THEN
    RAISE EXCEPTION 'Case must be in review status. Current status: %', v_current_status;
  END IF;

  -- Validate: Check if coordinator exists and has coordinator role
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE user_id = p_coordinator_id
    AND role = 'coordinator'
    AND is_active = TRUE
  ) INTO v_coordinator_exists;

  IF NOT v_coordinator_exists THEN
    RAISE EXCEPTION 'Coordinator with ID % does not exist or is not active', p_coordinator_id;
  END IF;

  -- Validate: Result must be 'approved' or 'rejected'
  IF p_result NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Review result must be either approved or rejected. Got: %', p_result;
  END IF;

  -- Validate: If rejected, justification is required
  IF p_result = 'rejected' AND (p_justification IS NULL OR TRIM(p_justification) = '') THEN
    RAISE EXCEPTION 'Rejection justification is required when rejecting a case';
  END IF;

  -- Update case with review result
  UPDATE cases
  SET
    status = p_result,
    coordinator_id = p_coordinator_id,
    review_result = p_result,
    rejection_justification = p_justification,
    reviewed_at = CURRENT_TIMESTAMP
  WHERE case_id = p_case_id;

  -- Return the case ID
  RETURN p_case_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error reviewing case: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_review_case IS 'Coordinator reviews and approves/rejects a case. Rejection requires justification.';


-- =============================================
-- Procedure: sp_get_cases
-- Description: Retrieves all cases with optional filters
--
-- What it does:
--   1. Fetches cases from the database
--   2. Joins with users table to get technician and coordinator names
--   3. Applies optional filters (status, date range)
--   4. Returns sorted by creation date (newest first)
--
-- Parameters:
--   p_status: Filter by case status (optional)
--   p_from_date: Filter from date (optional)
--   p_to_date: Filter to date (optional)
--
-- Returns: Table with complete case information
--
-- Example usage:
--   -- Get all cases
--   SELECT * FROM sp_get_cases(NULL, NULL, NULL);
--
--   -- Get only draft cases
--   SELECT * FROM sp_get_cases('draft', NULL, NULL);
--
--   -- Get cases in date range
--   SELECT * FROM sp_get_cases(NULL, '2024-01-01', '2024-12-31');
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_cases(
  p_status VARCHAR(50) DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  case_id INTEGER,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50),
  technician_id INTEGER,
  technician_name VARCHAR(255),
  coordinator_id INTEGER,
  coordinator_name VARCHAR(255),
  review_result VARCHAR(50),
  rejection_justification TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.case_id,
    c.title,
    c.description,
    c.status,
    c.technician_id,
    t.full_name AS technician_name,
    c.coordinator_id,
    coord.full_name AS coordinator_name,
    c.review_result,
    c.rejection_justification,
    c.created_at,
    c.updated_at,
    c.submitted_at,
    c.reviewed_at
  FROM
    cases c
  LEFT JOIN
    users t ON c.technician_id = t.user_id
  LEFT JOIN
    users coord ON c.coordinator_id = coord.user_id
  WHERE
    (p_status IS NULL OR c.status = p_status)
    AND (p_from_date IS NULL OR c.created_at >= p_from_date)
    AND (p_to_date IS NULL OR c.created_at <= p_to_date)
  ORDER BY
    c.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_cases IS 'Retrieves all cases with optional filters for status and date range.';


-- =============================================
-- Success message
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Case stored procedures created successfully!';
  RAISE NOTICE '📦 Procedures created:';
  RAISE NOTICE '   - sp_create_case_file';
  RAISE NOTICE '   - sp_submit_case_for_review';
  RAISE NOTICE '   - sp_review_case';
  RAISE NOTICE '   - sp_get_cases';
END $$;
