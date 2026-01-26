-- =============================================
-- Argos Evidence Management System
-- Report Stored Procedures
-- Description: Stored procedures for generating reports and statistics
-- Author: Argos Development Team
-- Version: 1.0
-- =============================================

-- =============================================
-- Procedure: sp_get_reports_summary
-- Description: Gets a summary of all cases by status with counts
--
-- What it does:
--   1. Counts total cases
--   2. Counts cases by each status (draft, in_review, approved, rejected)
--   3. Counts total evidence items
--   4. Returns summary statistics
--
-- Parameters: None
--
-- Returns: Table with summary statistics
--
-- Example usage:
--   SELECT * FROM sp_get_reports_summary();
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_reports_summary()
RETURNS TABLE (
  total_cases BIGINT,
  draft_cases BIGINT,
  in_review_cases BIGINT,
  approved_cases BIGINT,
  rejected_cases BIGINT,
  total_evidence_items BIGINT,
  total_technicians BIGINT,
  total_coordinators BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM cases)::BIGINT AS total_cases,
    (SELECT COUNT(*) FROM cases WHERE status = 'draft')::BIGINT AS draft_cases,
    (SELECT COUNT(*) FROM cases WHERE status = 'in_review')::BIGINT AS in_review_cases,
    (SELECT COUNT(*) FROM cases WHERE status = 'approved')::BIGINT AS approved_cases,
    (SELECT COUNT(*) FROM cases WHERE status = 'rejected')::BIGINT AS rejected_cases,
    (SELECT COUNT(*) FROM evidence_items)::BIGINT AS total_evidence_items,
    (SELECT COUNT(*) FROM users WHERE role = 'technician' AND is_active = TRUE)::BIGINT AS total_technicians,
    (SELECT COUNT(*) FROM users WHERE role = 'coordinator' AND is_active = TRUE)::BIGINT AS total_coordinators;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_reports_summary IS 'Returns summary statistics of cases and evidence.';


-- =============================================
-- Procedure: sp_get_reports_by_status
-- Description: Gets detailed report of cases grouped by status
--
-- What it does:
--   1. Groups cases by status
--   2. Counts cases and evidence per status
--   3. Returns breakdown by status
--
-- Parameters:
--   p_from_date: Start date filter (optional)
--   p_to_date: End date filter (optional)
--
-- Returns: Table with cases grouped by status
--
-- Example usage:
--   SELECT * FROM sp_get_reports_by_status(NULL, NULL);
--   SELECT * FROM sp_get_reports_by_status('2024-01-01', '2024-12-31');
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_reports_by_status(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  status VARCHAR(50),
  case_count BIGINT,
  evidence_count BIGINT,
  avg_evidence_per_case NUMERIC(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.status,
    COUNT(DISTINCT c.case_id)::BIGINT AS case_count,
    COUNT(e.evidence_id)::BIGINT AS evidence_count,
    ROUND(COUNT(e.evidence_id)::NUMERIC / NULLIF(COUNT(DISTINCT c.case_id), 0), 2) AS avg_evidence_per_case
  FROM
    cases c
  LEFT JOIN
    evidence_items e ON c.case_id = e.case_id
  WHERE
    (p_from_date IS NULL OR c.created_at >= p_from_date)
    AND (p_to_date IS NULL OR c.created_at <= p_to_date + INTERVAL '1 day')
  GROUP BY
    c.status
  ORDER BY
    CASE c.status
      WHEN 'draft' THEN 1
      WHEN 'in_review' THEN 2
      WHEN 'approved' THEN 3
      WHEN 'rejected' THEN 4
    END;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_reports_by_status IS 'Returns cases grouped by status with evidence counts.';


-- =============================================
-- Procedure: sp_get_reports_by_date
-- Description: Gets daily report of case activity
--
-- What it does:
--   1. Groups cases by creation date
--   2. Shows daily activity (cases created, submitted, reviewed)
--   3. Filters by date range
--
-- Parameters:
--   p_from_date: Start date (required)
--   p_to_date: End date (required)
--
-- Returns: Table with daily activity
--
-- Example usage:
--   SELECT * FROM sp_get_reports_by_date('2024-01-01', '2024-01-31');
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_reports_by_date(
  p_from_date DATE,
  p_to_date DATE
)
RETURNS TABLE (
  report_date DATE,
  cases_created BIGINT,
  cases_submitted BIGINT,
  cases_approved BIGINT,
  cases_rejected BIGINT,
  evidence_added BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_from_date, p_to_date, '1 day'::interval)::DATE AS report_date
  )
  SELECT
    ds.report_date,
    COALESCE(COUNT(DISTINCT CASE WHEN c.created_at::DATE = ds.report_date THEN c.case_id END), 0)::BIGINT AS cases_created,
    COALESCE(COUNT(DISTINCT CASE WHEN c.submitted_at::DATE = ds.report_date THEN c.case_id END), 0)::BIGINT AS cases_submitted,
    COALESCE(COUNT(DISTINCT CASE WHEN c.reviewed_at::DATE = ds.report_date AND c.review_result = 'approved' THEN c.case_id END), 0)::BIGINT AS cases_approved,
    COALESCE(COUNT(DISTINCT CASE WHEN c.reviewed_at::DATE = ds.report_date AND c.review_result = 'rejected' THEN c.case_id END), 0)::BIGINT AS cases_rejected,
    COALESCE(COUNT(DISTINCT CASE WHEN e.created_at::DATE = ds.report_date THEN e.evidence_id END), 0)::BIGINT AS evidence_added
  FROM
    date_series ds
  LEFT JOIN
    cases c ON c.created_at::DATE <= ds.report_date
  LEFT JOIN
    evidence_items e ON e.created_at::DATE = ds.report_date
  GROUP BY
    ds.report_date
  ORDER BY
    ds.report_date;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_reports_by_date IS 'Returns daily activity report for a date range.';


-- =============================================
-- Procedure: sp_get_reports_rejections
-- Description: Gets detailed report of rejected cases
--
-- What it does:
--   1. Lists all rejected cases
--   2. Includes rejection justification
--   3. Shows who rejected and when
--
-- Parameters:
--   p_from_date: Start date filter (optional)
--   p_to_date: End date filter (optional)
--
-- Returns: Table with rejected cases details
--
-- Example usage:
--   SELECT * FROM sp_get_reports_rejections(NULL, NULL);
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_reports_rejections(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  case_id INTEGER,
  title VARCHAR(255),
  technician_name VARCHAR(255),
  coordinator_name VARCHAR(255),
  rejection_justification TEXT,
  created_at TIMESTAMP,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  evidence_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.case_id,
    c.title,
    t.full_name AS technician_name,
    coord.full_name AS coordinator_name,
    c.rejection_justification,
    c.created_at,
    c.submitted_at,
    c.reviewed_at,
    (SELECT COUNT(*) FROM evidence_items e WHERE e.case_id = c.case_id)::BIGINT AS evidence_count
  FROM
    cases c
  LEFT JOIN
    users t ON c.technician_id = t.user_id
  LEFT JOIN
    users coord ON c.coordinator_id = coord.user_id
  WHERE
    c.status = 'rejected'
    AND (p_from_date IS NULL OR c.reviewed_at >= p_from_date)
    AND (p_to_date IS NULL OR c.reviewed_at <= p_to_date + INTERVAL '1 day')
  ORDER BY
    c.reviewed_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_reports_rejections IS 'Returns detailed list of rejected cases with justifications.';


-- =============================================
-- Procedure: sp_get_reports_by_technician
-- Description: Gets report of cases grouped by technician
--
-- What it does:
--   1. Groups cases by technician
--   2. Shows case counts and status breakdown per technician
--   3. Useful for workload analysis
--
-- Parameters:
--   p_from_date: Start date filter (optional)
--   p_to_date: End date filter (optional)
--
-- Returns: Table with technician performance
--
-- Example usage:
--   SELECT * FROM sp_get_reports_by_technician(NULL, NULL);
-- =============================================
CREATE OR REPLACE FUNCTION sp_get_reports_by_technician(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  technician_id INTEGER,
  technician_name VARCHAR(255),
  total_cases BIGINT,
  draft_cases BIGINT,
  in_review_cases BIGINT,
  approved_cases BIGINT,
  rejected_cases BIGINT,
  total_evidence BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.user_id AS technician_id,
    u.full_name AS technician_name,
    COUNT(DISTINCT c.case_id)::BIGINT AS total_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'draft' THEN c.case_id END)::BIGINT AS draft_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'in_review' THEN c.case_id END)::BIGINT AS in_review_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'approved' THEN c.case_id END)::BIGINT AS approved_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'rejected' THEN c.case_id END)::BIGINT AS rejected_cases,
    COUNT(e.evidence_id)::BIGINT AS total_evidence
  FROM
    users u
  LEFT JOIN
    cases c ON u.user_id = c.technician_id
    AND (p_from_date IS NULL OR c.created_at >= p_from_date)
    AND (p_to_date IS NULL OR c.created_at <= p_to_date + INTERVAL '1 day')
  LEFT JOIN
    evidence_items e ON c.case_id = e.case_id
  WHERE
    u.role = 'technician'
    AND u.is_active = TRUE
  GROUP BY
    u.user_id, u.full_name
  ORDER BY
    total_cases DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sp_get_reports_by_technician IS 'Returns case statistics grouped by technician.';


-- =============================================
-- Success message
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Report stored procedures created successfully!';
  RAISE NOTICE '📦 Procedures created:';
  RAISE NOTICE '   - sp_get_reports_summary';
  RAISE NOTICE '   - sp_get_reports_by_status';
  RAISE NOTICE '   - sp_get_reports_by_date';
  RAISE NOTICE '   - sp_get_reports_rejections';
  RAISE NOTICE '   - sp_get_reports_by_technician';
END $$;
