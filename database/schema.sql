-- =============================================
-- Argos Evidence Management System - Database Schema
-- Description: PostgreSQL database schema for forensic evidence management
-- Author: Argos Development Team
-- Version: 1.0
-- =============================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS evidence_items CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- Table: users
-- Description: Stores user information (technicians, coordinators, admins)
-- Purpose: Authentication and role-based access control
-- =============================================
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('technician', 'coordinator', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Add comment to table
COMMENT ON TABLE users IS 'Stores user accounts with role-based access (technician, coordinator, admin)';
COMMENT ON COLUMN users.role IS 'User role: technician (creates cases), coordinator (reviews cases), admin (system management)';

-- =============================================
-- Table: cases
-- Description: Stores case file information
-- Purpose: Main entity for evidence case management
-- Workflow: draft -> in_review -> approved/rejected
-- =============================================
CREATE TABLE cases (
  case_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'rejected')),
  technician_id INTEGER NOT NULL REFERENCES users(user_id),
  coordinator_id INTEGER REFERENCES users(user_id),
  review_result VARCHAR(50) CHECK (review_result IN ('approved', 'rejected')),
  rejection_justification TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_rejection_justification CHECK (
    (review_result = 'rejected' AND rejection_justification IS NOT NULL) OR
    (review_result != 'rejected')
  )
);

-- Add comments to table
COMMENT ON TABLE cases IS 'Stores forensic case files with workflow management';
COMMENT ON COLUMN cases.status IS 'Case status: draft (editing), in_review (submitted), approved (completed), rejected (needs revision)';
COMMENT ON COLUMN cases.rejection_justification IS 'Required when case is rejected, explains why for technician revision';

-- =============================================
-- Table: evidence_items
-- Description: Stores individual evidence items within a case
-- Purpose: Detailed evidence tracking (indicios)
-- =============================================
CREATE TABLE evidence_items (
  evidence_id SERIAL PRIMARY KEY,
  case_id INTEGER NOT NULL REFERENCES cases(case_id) ON DELETE CASCADE,
  technician_id INTEGER NOT NULL REFERENCES users(user_id),
  description TEXT NOT NULL,
  color VARCHAR(100),
  size VARCHAR(100),
  weight VARCHAR(100),
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT chk_description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Add comments to table
COMMENT ON TABLE evidence_items IS 'Stores individual evidence items (indicios) found in cases';
COMMENT ON COLUMN evidence_items.location IS 'Physical location where the evidence was found';

-- =============================================
-- Indexes for performance optimization
-- Purpose: Speed up common queries
-- =============================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;
CREATE INDEX idx_users_email ON users(email);

-- Cases indexes
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_technician ON cases(technician_id);
CREATE INDEX idx_cases_coordinator ON cases(coordinator_id);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_status_created ON cases(status, created_at DESC);

-- Evidence indexes
CREATE INDEX idx_evidence_case ON evidence_items(case_id);
CREATE INDEX idx_evidence_technician ON evidence_items(technician_id);
CREATE INDEX idx_evidence_created_at ON evidence_items(created_at DESC);

-- =============================================
-- Trigger Function: update_updated_at_column
-- Purpose: Automatically update the updated_at timestamp on row updates
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';

-- =============================================
-- Triggers: Auto-update timestamps
-- =============================================
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_updated_at
  BEFORE UPDATE ON evidence_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Success message
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '📊 Tables created: users, cases, evidence_items';
  RAISE NOTICE '🔍 Indexes created for optimal performance';
  RAISE NOTICE '⚡ Triggers configured for automatic timestamp updates';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Run stored procedures: psql -d argos_db -f database/stored_procedures/case_procedures.sql';
  RAISE NOTICE '2. Run stored procedures: psql -d argos_db -f database/stored_procedures/evidence_procedures.sql';
  RAISE NOTICE '3. Insert sample data: psql -d argos_db -f database/seed_data.sql';
END $$;
