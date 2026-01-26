-- =============================================
-- Argos Evidence Management System
-- Seed Data (Sample/Test Data)
-- Description: Initial data for testing the application
-- Author: Argos Development Team
-- Version: 1.0
-- =============================================

-- =============================================
-- Clear existing data (be careful in production!)
-- =============================================
TRUNCATE TABLE evidence_items CASCADE;
TRUNCATE TABLE cases CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE cases_case_id_seq RESTART WITH 1;
ALTER SEQUENCE evidence_items_evidence_id_seq RESTART WITH 1;

-- =============================================
-- Insert Users (technicians and coordinators)
-- Password for all test users: "Password123!"
-- Hash generated with bcrypt (cost factor: 10)
-- =============================================

INSERT INTO users (username, email, password_hash, full_name, role, is_active) VALUES
  -- Technicians (Password: Password123!)
  ('tech01', 'john.tech@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'John Technician', 'technician', TRUE),
  ('tech02', 'maria.tech@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'Maria Rodriguez', 'technician', TRUE),
  ('tech03', 'carlos.tech@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'Carlos Martinez', 'technician', TRUE),

  -- Coordinators (Password: Password123!)
  ('coord01', 'jane.coord@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'Jane Coordinator', 'coordinator', TRUE),
  ('coord02', 'robert.coord@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'Robert Johnson', 'coordinator', TRUE),

  -- Admin (Password: Password123!)
  ('admin', 'admin@argos.com', '$2b$10$ABhpyPOrgQpbmSETjWyLnOvY38W1tmgxyL3.ZuLMMri/T/t6OmOv.', 'System Administrator', 'admin', TRUE);

-- =============================================
-- Insert Sample Cases
-- =============================================

-- Case 1: Draft status (ready to add evidence)
INSERT INTO cases (title, description, technician_id, status) VALUES
  ('Evidence Case #001', 'Robbery investigation at Main Street convenience store. Multiple items collected at the scene.', 1, 'draft');

-- Case 2: In review status (submitted, waiting for coordinator)
INSERT INTO cases (title, description, technician_id, status, submitted_at) VALUES
  ('Evidence Case #002', 'Burglary at residential property. Tools and personal items found.', 2, 'in_review', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Case 3: Approved case
INSERT INTO cases (title, description, technician_id, coordinator_id, status, review_result, submitted_at, reviewed_at) VALUES
  ('Evidence Case #003', 'Assault investigation. Weapon and clothing evidence collected.', 1, 4, 'approved', 'approved', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Case 4: Rejected case (needs revision)
INSERT INTO cases (title, description, technician_id, coordinator_id, status, review_result, rejection_justification, submitted_at, reviewed_at) VALUES
  ('Evidence Case #004', 'Vandalism case with photographic evidence.', 3, 4, 'rejected', 'rejected', 'Missing chain of custody documentation and evidence photos need better labeling.', CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '2 days');

-- =============================================
-- Insert Sample Evidence Items
-- =============================================

-- Evidence for Case 1 (Draft)
INSERT INTO evidence_items (case_id, technician_id, description, color, size, weight, location) VALUES
  (1, 1, 'Kitchen knife with blue handle', 'Blue handle, silver blade', '20cm length', '150g', 'Found in kitchen drawer'),
  (1, 1, 'Black leather wallet', 'Black', '10cm x 8cm', '50g', 'Found on floor near cash register');

-- Evidence for Case 2 (In Review)
INSERT INTO evidence_items (case_id, technician_id, description, color, size, weight, location) VALUES
  (2, 2, 'Crowbar with red handle', 'Red and black', '60cm length', '1.2kg', 'Found at entry point'),
  (2, 2, 'Blue backpack containing tools', 'Navy blue', '40cm x 30cm', '2.5kg', 'Found in backyard'),
  (2, 2, 'Flashlight', 'Black', '15cm length', '200g', 'Inside blue backpack');

-- Evidence for Case 3 (Approved)
INSERT INTO evidence_items (case_id, technician_id, description, color, size, weight, location) VALUES
  (3, 1, 'Baseball bat with blood traces', 'Wood colored, dark stains', '80cm length', '800g', 'Found at scene near victim'),
  (3, 1, 'Torn white t-shirt', 'White with red stains', 'Size L', '100g', 'Worn by suspect during arrest');

-- Evidence for Case 4 (Rejected - needs revision)
INSERT INTO evidence_items (case_id, technician_id, description, color, size, weight, location) VALUES
  (4, 3, 'Spray paint can - red', 'Red', 'Standard 400ml can', '350g', 'Found near graffiti site'),
  (4, 3, 'Spray paint can - black', 'Black', 'Standard 400ml can', '350g', 'Found in suspect vehicle');

-- =============================================
-- Display summary of inserted data
-- =============================================
DO $$
DECLARE
  v_user_count INTEGER;
  v_case_count INTEGER;
  v_evidence_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_user_count FROM users;
  SELECT COUNT(*) INTO v_case_count FROM cases;
  SELECT COUNT(*) INTO v_evidence_count FROM evidence_items;

  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   Users created: %', v_user_count;
  RAISE NOTICE '   - 3 Technicians';
  RAISE NOTICE '   - 2 Coordinators';
  RAISE NOTICE '   - 1 Administrator';
  RAISE NOTICE '';
  RAISE NOTICE '   Cases created: %', v_case_count;
  RAISE NOTICE '   - 1 Draft case';
  RAISE NOTICE '   - 1 In Review case';
  RAISE NOTICE '   - 1 Approved case';
  RAISE NOTICE '   - 1 Rejected case';
  RAISE NOTICE '';
  RAISE NOTICE '   Evidence items: %', v_evidence_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Test User Credentials:';
  RAISE NOTICE '   Technician: tech01 / Password123!';
  RAISE NOTICE '   Coordinator: coord01 / Password123!';
  RAISE NOTICE '   Admin: admin / Password123!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Password hashes generated with bcrypt (cost factor: 10)';
END $$;
