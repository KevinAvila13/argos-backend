# Argos Database Setup Guide

This folder contains all database-related SQL scripts for the **Argos Evidence Management System**.

## 📁 Directory Structure

```
database/
├── schema.sql                           # Database tables and structure
├── stored_procedures/
│   ├── case_procedures.sql             # Case management stored procedures
│   └── evidence_procedures.sql         # Evidence management stored procedures
├── seed_data.sql                       # Sample test data
└── README.md                           # This file
```

---

## 🚀 Complete Setup Instructions

Follow these steps in order to set up the complete database.

### Step 1: Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create the database
CREATE DATABASE argos_db;

# Exit psql
\q
```

### Step 2: Run Schema (Create Tables)

Create all tables, indexes, and triggers:

```bash
psql -U postgres -d argos_db -f database/schema.sql
```

**What this creates:**
- ✅ `users` table - Stores technicians, coordinators, and admins
- ✅ `cases` table - Stores case files with workflow management
- ✅ `evidence_items` table - Stores evidence items (indicios)
- ✅ Indexes for performance
- ✅ Automatic timestamp update triggers

### Step 3: Run Case Stored Procedures

Create all case management procedures:

```bash
psql -U postgres -d argos_db -f database/stored_procedures/case_procedures.sql
```

**What this creates:**
- ✅ `sp_create_case_file` - Creates new case
- ✅ `sp_submit_case_for_review` - Submits case to coordinator
- ✅ `sp_review_case` - Approve/reject case
- ✅ `sp_get_cases` - List cases with filters

### Step 4: Run Evidence Stored Procedures

Create all evidence management procedures:

```bash
psql -U postgres -d argos_db -f database/stored_procedures/evidence_procedures.sql
```

**What this creates:**
- ✅ `sp_add_evidence_item` - Adds evidence to case
- ✅ `sp_get_evidence_by_case` - Lists evidence for a case
- ✅ `sp_get_evidence_item` - Gets single evidence item

### Step 5: Insert Sample Data (Optional but Recommended)

Insert test data to try the application:

```bash
psql -U postgres -d argos_db -f database/seed_data.sql
```

**What this creates:**
- ✅ 6 test users (3 technicians, 2 coordinators, 1 admin)
- ✅ 4 sample cases in different states
- ✅ 9 evidence items

---

## 🔍 Verify Installation

### Check Tables

```sql
psql -U postgres -d argos_db

-- List all tables
\dt

-- Expected output:
--  public | cases          | table | postgres
--  public | evidence_items | table | postgres
--  public | users          | table | postgres
```

### Check Stored Procedures

```sql
-- List all stored procedures
\df

-- Test a specific procedure
SELECT * FROM sp_get_cases(NULL, NULL, NULL);
```

### Check Sample Data

```sql
-- Count users
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Count cases by status
SELECT status, COUNT(*) FROM cases GROUP BY status;

-- Count evidence items
SELECT COUNT(*) FROM evidence_items;
```

---

## 📊 Database Schema Overview

### Table: `users`
Stores user accounts with role-based access control.

**Roles:**
- `technician` - Creates cases and adds evidence
- `coordinator` - Reviews and approves/rejects cases
- `admin` - System administration

**Key Fields:**
- `user_id` (Primary Key)
- `username`, `email` (Unique)
- `password_hash`
- `full_name`
- `role`
- `is_active`

### Table: `cases`
Stores forensic case files with workflow management.

**Workflow:** `draft` → `in_review` → `approved`/`rejected`

**Key Fields:**
- `case_id` (Primary Key)
- `title`, `description`
- `status` (draft, in_review, approved, rejected)
- `technician_id` (Foreign Key to users)
- `coordinator_id` (Foreign Key to users)
- `review_result`
- `rejection_justification` (Required if rejected)
- Timestamps: `created_at`, `submitted_at`, `reviewed_at`

### Table: `evidence_items`
Stores individual evidence items (indicios) within cases.

**Key Fields:**
- `evidence_id` (Primary Key)
- `case_id` (Foreign Key to cases)
- `technician_id` (Foreign Key to users)
- `description` (Required)
- `color`, `size`, `weight`, `location` (Optional)
- Timestamps: `created_at`, `updated_at`

---

## 🔧 Environment Configuration

Update your `.env` file with database credentials:

```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=argos_db
DB_PASSWORD=your_password_here
DB_PORT=5432

# Server Configuration
PORT=3000
```

---

## 🧪 Testing Stored Procedures

### Case Procedures

```sql
-- 1. Create a new case
SELECT sp_create_case_file(
  'Test Case #001',
  'Testing case creation',
  1  -- technician_id
);

-- 2. Add evidence to the case
SELECT sp_add_evidence_item(
  1,    -- case_id
  1,    -- technician_id
  'Test evidence item',
  'Blue',
  '10cm',
  '100g',
  'Test location'
);

-- 3. Submit case for review
SELECT sp_submit_case_for_review(1);

-- 4. Review and approve case
SELECT sp_review_case(
  1,         -- case_id
  4,         -- coordinator_id
  'approved',
  NULL       -- justification (only needed for rejection)
);

-- 5. Get all cases
SELECT * FROM sp_get_cases(NULL, NULL, NULL);
```

### Evidence Procedures

```sql
-- Get all evidence for a case
SELECT * FROM sp_get_evidence_by_case(1);

-- Get specific evidence item
SELECT * FROM sp_get_evidence_item(1);
```

---

## 🔄 Reset Database

If you need to start fresh:

```bash
# Drop and recreate database
psql -U postgres

DROP DATABASE argos_db;
CREATE DATABASE argos_db;
\q

# Re-run all setup scripts
psql -U postgres -d argos_db -f database/schema.sql
psql -U postgres -d argos_db -f database/stored_procedures/case_procedures.sql
psql -U postgres -d argos_db -f database/stored_procedures/evidence_procedures.sql
psql -U postgres -d argos_db -f database/seed_data.sql
```

---

## 📝 Test Credentials (from seed_data.sql)

**Note:** These are placeholder passwords. In production, implement proper bcrypt hashing.

| Username | Email | Role | Password |
|----------|-------|------|----------|
| tech01 | john.tech@argos.com | technician | Password123! |
| tech02 | maria.tech@argos.com | technician | Password123! |
| coord01 | jane.coord@argos.com | coordinator | Password123! |
| admin | admin@argos.com | admin | Password123! |

---

## ❓ Troubleshooting

### Connection Error
```
psql: error: connection to server failed
```
**Solution:** Make sure PostgreSQL service is running:
```bash
# Windows
net start postgresql

# Linux/Mac
sudo systemctl start postgresql
```

### Permission Denied
```
ERROR: permission denied for database argos_db
```
**Solution:** Make sure you're using a user with proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE argos_db TO your_user;
```

### Stored Procedure Not Found
```
ERROR: function sp_get_cases does not exist
```
**Solution:** Re-run the stored procedures scripts:
```bash
psql -U postgres -d argos_db -f database/stored_procedures/case_procedures.sql
```

---

## 📚 Next Steps

After setting up the database:

1. ✅ Start the backend server: `npm run dev`
2. ✅ Test endpoints with the examples in `docs/API_EXAMPLES.md`
3. ✅ Use Postman to test the complete workflow
4. ✅ Build the frontend to interact with the API

Happy coding! 🚀
