# Argos API Documentation

Complete API reference for the Argos Evidence Management System.

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

- [Authentication](#authentication-endpoints)
- [Health Check](#health-check)
- [Cases](#cases-endpoints)
- [Evidence](#evidence-endpoints)
- [Reports](#reports-endpoints)
- [Testing Workflow](#testing-workflow)

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

| Role | Permissions |
|------|-------------|
| technician | Create/update/delete cases and evidence, submit cases for review |
| coordinator | View all data, review cases (approve/reject), access reports |
| admin | Full access to all endpoints |

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate user and get JWT token.

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | User's username |
| password | string | Yes | User's password |

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tech01",
    "password": "Password123!"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": 1,
      "username": "tech01",
      "email": "john.tech@argos.com",
      "full_name": "John Technician",
      "role": "technician"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/register

Register a new user.

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Unique username (min 3 chars) |
| email | string | Yes | Valid email address |
| password | string | Yes | Password (min 8 chars) |
| full_name | string | Yes | User's full name |
| role | string | Yes | `technician`, `coordinator`, or `admin` |

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newtech",
    "email": "newtech@argos.com",
    "password": "SecurePass123!",
    "full_name": "New Technician",
    "role": "technician"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "user_id": 7,
      "username": "newtech",
      "email": "newtech@argos.com",
      "full_name": "New Technician",
      "role": "technician"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (409):**
```json
{
  "success": false,
  "error": "Username already exists"
}
```

---

### GET /api/auth/profile

Get current user's profile. **Requires authentication.**

**Example:**

```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "tech01",
    "email": "john.tech@argos.com",
    "full_name": "John Technician",
    "role": "technician",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PUT /api/auth/change-password

Change current user's password. **Requires authentication.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| current_password | string | Yes | Current password |
| new_password | string | Yes | New password (min 8 chars) |

**Example:**

```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "current_password": "Password123!",
    "new_password": "NewSecurePass456!"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

### GET /api/auth/users

Get all users. **Requires admin role.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role | string | No | Filter by role: `technician`, `coordinator`, `admin` |

**Example:**

```bash
# Get all users
curl http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer <admin_token>"

# Get only technicians
curl "http://localhost:3000/api/auth/users?role=technician" \
  -H "Authorization: Bearer <admin_token>"
```

**Response (200):**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "user_id": 1,
      "username": "tech01",
      "email": "john.tech@argos.com",
      "full_name": "John Technician",
      "role": "technician",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "Access denied. Insufficient permissions."
}
```

---

## Health Check

### GET /api/health

Check if the API is running.

```bash
curl http://localhost:3000/api/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Argos API is running",
  "timestamp": "2024-01-26T10:00:00.000Z"
}
```

---

## Cases Endpoints

**All cases endpoints require authentication.**

### GET /api/cases

Get all cases with optional filters. **All authenticated users can access.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `draft`, `in_review`, `approved`, `rejected` |
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Examples:**

```bash
# Get all cases
curl http://localhost:3000/api/cases \
  -H "Authorization: Bearer <your_token>"

# Get only draft cases
curl "http://localhost:3000/api/cases?status=draft" \
  -H "Authorization: Bearer <your_token>"

# Get cases in date range
curl "http://localhost:3000/api/cases?from_date=2024-01-01&to_date=2024-12-31" \
  -H "Authorization: Bearer <your_token>"
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "case_id": 1,
      "title": "Evidence Case #001",
      "description": "Robbery investigation",
      "status": "draft",
      "technician_id": 1,
      "technician_name": "John Technician",
      "coordinator_id": null,
      "coordinator_name": null,
      "review_result": null,
      "rejection_justification": null,
      "created_at": "2024-01-25T10:00:00.000Z",
      "updated_at": "2024-01-25T10:00:00.000Z",
      "submitted_at": null,
      "reviewed_at": null
    }
  ]
}
```

---

### GET /api/cases/:id

Get a single case by ID with full details including evidence count. **All authenticated users can access.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Case ID |

**Example:**

```bash
curl http://localhost:3000/api/cases/1 \
  -H "Authorization: Bearer <your_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "case_id": 1,
    "title": "Evidence Case #001",
    "description": "Robbery investigation at Main Street",
    "status": "draft",
    "technician_id": 1,
    "technician_name": "John Technician",
    "coordinator_id": null,
    "coordinator_name": null,
    "review_result": null,
    "rejection_justification": null,
    "evidence_count": 3,
    "created_at": "2024-01-25T10:00:00.000Z",
    "updated_at": "2024-01-25T10:00:00.000Z",
    "submitted_at": null,
    "reviewed_at": null
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Case with ID 999 does not exist"
}
```

---

### POST /api/cases

Create a new case file. **Requires technician or admin role.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | Yes | Case title |
| description | string | No | Case description |
| technician_id | integer | Yes | ID of the technician creating the case |

**Example:**

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "title": "Evidence Case #001",
    "description": "Robbery investigation at Main Street",
    "technician_id": 1
  }'
```

**Response (201):**
```json
{
  "message": "Case file created successfully",
  "case_id": 1
}
```

**Response (400):**
```json
{
  "error": "Technician with ID 999 does not exist or is not active"
}
```

---

### PUT /api/cases/:id

Update a case file. **Only works for cases in draft status. Requires technician or admin role.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Case ID |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | string | No | New title |
| description | string | No | New description |

*At least one field must be provided.*

**Example:**

```bash
curl -X PUT http://localhost:3000/api/cases/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "title": "Updated Case Title",
    "description": "Updated description with more details"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Case updated successfully",
  "case_id": 1
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Can only update cases in draft status. Current status: in_review"
}
```

---

### DELETE /api/cases/:id

Delete a case file. **Only works for cases in draft status.** Deletes all associated evidence items. **Requires technician or admin role.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Case ID |

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/cases/1 \
  -H "Authorization: Bearer <technician_token>"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Case deleted successfully",
  "case_id": 1
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Can only delete cases in draft status. Current status: approved"
}
```

---

### POST /api/cases/submit

Submit a case for review. **Requires at least one evidence item. Requires technician or admin role.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| case_id | integer | Yes | Case ID to submit |

**Example:**

```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "case_id": 1
  }'
```

**Response (200):**
```json
{
  "message": "Case file submitted for review successfully",
  "case_id": 1
}
```

**Response (400):**
```json
{
  "error": "Case must have at least one evidence item before submission"
}
```

---

### POST /api/cases/review

Coordinator reviews a case (approve or reject). **Rejection requires justification. Requires coordinator or admin role.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| case_id | integer | Yes | Case ID to review |
| coordinator_id | integer | Yes | Coordinator's user ID |
| result | string | Yes | `approved` or `rejected` |
| justification | string | If rejected | Reason for rejection |

**Example (Approve):**

```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <coordinator_token>" \
  -d '{
    "case_id": 1,
    "coordinator_id": 4,
    "result": "approved",
    "justification": null
  }'
```

**Example (Reject):**

```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <coordinator_token>" \
  -d '{
    "case_id": 1,
    "coordinator_id": 4,
    "result": "rejected",
    "justification": "Missing evidence photos and incomplete documentation"
  }'
```

**Response (200):**
```json
{
  "message": "Case file approved successfully",
  "case_id": 1
}
```

**Response (400):**
```json
{
  "error": "Rejection justification is required when rejecting a case"
}
```

---

## Evidence Endpoints

**All evidence endpoints require authentication.**

### GET /api/evidence/case/:caseId

Get all evidence items for a specific case. **All authenticated users can access.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| caseId | integer | Yes | Case ID |

**Example:**

```bash
curl http://localhost:3000/api/evidence/case/1 \
  -H "Authorization: Bearer <your_token>"
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "evidence_id": 1,
      "case_id": 1,
      "technician_id": 1,
      "technician_name": "John Technician",
      "description": "Blue handled kitchen knife",
      "color": "Blue and silver",
      "size": "20cm length",
      "weight": "150g",
      "location": "Kitchen drawer",
      "created_at": "2024-01-25T10:05:00.000Z",
      "updated_at": "2024-01-25T10:05:00.000Z"
    },
    {
      "evidence_id": 2,
      "case_id": 1,
      "technician_id": 1,
      "technician_name": "John Technician",
      "description": "Broken window glass fragments",
      "color": "Transparent",
      "size": "Various sizes",
      "weight": "50g total",
      "location": "Living room floor",
      "created_at": "2024-01-25T10:10:00.000Z",
      "updated_at": "2024-01-25T10:10:00.000Z"
    }
  ]
}
```

---

### GET /api/evidence/:id

Get a single evidence item by ID. **All authenticated users can access.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Evidence ID |

**Example:**

```bash
curl http://localhost:3000/api/evidence/1 \
  -H "Authorization: Bearer <your_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "evidence_id": 1,
    "case_id": 1,
    "technician_id": 1,
    "technician_name": "John Technician",
    "description": "Blue handled kitchen knife",
    "color": "Blue and silver",
    "size": "20cm length",
    "weight": "150g",
    "location": "Kitchen drawer",
    "created_at": "2024-01-25T10:05:00.000Z",
    "updated_at": "2024-01-25T10:05:00.000Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Evidence item with ID 999 does not exist"
}
```

---

### POST /api/evidence

Add a new evidence item to a case. **Only works for cases in draft status. Requires technician or admin role.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| case_id | integer | Yes | Case ID to add evidence to |
| technician_id | integer | Yes | Technician's user ID |
| description | string | Yes | Evidence description |
| color | string | No | Color of the item |
| size | string | No | Size/dimensions |
| weight | string | No | Weight of the item |
| location | string | No | Where it was found |

**Example:**

```bash
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "case_id": 1,
    "technician_id": 1,
    "description": "Blue handled kitchen knife with blood stains",
    "color": "Blue handle, silver blade",
    "size": "20cm length, 3cm blade width",
    "weight": "150g",
    "location": "Kitchen drawer, second from top"
  }'
```

**Response (201):**
```json
{
  "message": "Evidence item added successfully",
  "evidence_id": 1
}
```

**Response (400):**
```json
{
  "error": "Cannot add evidence to a case that is not in draft status. Current status: in_review"
}
```

---

### PUT /api/evidence/:id

Update an evidence item. **Only works for cases in draft status. Requires technician or admin role.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Evidence ID |

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| description | string | No | New description |
| color | string | No | New color |
| size | string | No | New size |
| weight | string | No | New weight |
| location | string | No | New location |

**Example:**

```bash
curl -X PUT http://localhost:3000/api/evidence/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "description": "Updated description with more details",
    "weight": "155g"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "message": "Evidence item updated successfully",
  "evidence_id": 1
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Cannot update evidence for a case that is not in draft status. Current status: approved"
}
```

---

### DELETE /api/evidence/:id

Delete an evidence item. **Only works for cases in draft status. Requires technician or admin role.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Evidence ID |

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/evidence/1 \
  -H "Authorization: Bearer <technician_token>"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Evidence item deleted successfully",
  "evidence_id": 1
}
```

---

## Reports Endpoints

**All reports endpoints require authentication and coordinator or admin role.**

### GET /api/reports/summary

Get overall statistics summary. **Requires coordinator or admin role.**

**Example:**

```bash
curl http://localhost:3000/api/reports/summary \
  -H "Authorization: Bearer <coordinator_token>"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_cases": 15,
    "draft_cases": 5,
    "in_review_cases": 3,
    "approved_cases": 6,
    "rejected_cases": 1,
    "total_evidence_items": 45,
    "total_technicians": 3,
    "total_coordinators": 2
  }
}
```

---

### GET /api/reports/by-status

Get cases grouped by status with evidence counts. **Requires coordinator or admin role.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
# All time
curl http://localhost:3000/api/reports/by-status \
  -H "Authorization: Bearer <coordinator_token>"

# With date filter
curl "http://localhost:3000/api/reports/by-status?from_date=2024-01-01&to_date=2024-12-31" \
  -H "Authorization: Bearer <coordinator_token>"
```

**Response (200):**
```json
{
  "success": true,
  "filters": {
    "from_date": null,
    "to_date": null
  },
  "data": [
    {
      "status": "draft",
      "case_count": 5,
      "evidence_count": 12,
      "avg_evidence_per_case": 2.40
    },
    {
      "status": "in_review",
      "case_count": 3,
      "evidence_count": 9,
      "avg_evidence_per_case": 3.00
    },
    {
      "status": "approved",
      "case_count": 6,
      "evidence_count": 20,
      "avg_evidence_per_case": 3.33
    },
    {
      "status": "rejected",
      "case_count": 1,
      "evidence_count": 4,
      "avg_evidence_per_case": 4.00
    }
  ]
}
```

---

### GET /api/reports/by-date

Get daily activity report for a date range. **Both dates are required. Requires coordinator or admin role.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | Yes | Start date (YYYY-MM-DD) |
| to_date | string | Yes | End date (YYYY-MM-DD) |

**Example:**

```bash
curl "http://localhost:3000/api/reports/by-date?from_date=2024-01-01&to_date=2024-01-07" \
  -H "Authorization: Bearer <coordinator_token>"
```

**Response (200):**
```json
{
  "success": true,
  "filters": {
    "from_date": "2024-01-01",
    "to_date": "2024-01-07"
  },
  "count": 7,
  "data": [
    {
      "report_date": "2024-01-01",
      "cases_created": 2,
      "cases_submitted": 1,
      "cases_approved": 0,
      "cases_rejected": 0,
      "evidence_added": 5
    },
    {
      "report_date": "2024-01-02",
      "cases_created": 1,
      "cases_submitted": 2,
      "cases_approved": 1,
      "cases_rejected": 0,
      "evidence_added": 3
    }
  ]
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Both from_date and to_date are required"
}
```

---

### GET /api/reports/rejections

Get detailed list of rejected cases with justifications. **Requires coordinator or admin role.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
curl http://localhost:3000/api/reports/rejections \
  -H "Authorization: Bearer <coordinator_token>"
```

**Response (200):**
```json
{
  "success": true,
  "filters": {
    "from_date": null,
    "to_date": null
  },
  "count": 2,
  "data": [
    {
      "case_id": 3,
      "title": "Evidence Case #003",
      "technician_name": "John Technician",
      "coordinator_name": "Jane Coordinator",
      "rejection_justification": "Incomplete evidence documentation and missing photos",
      "created_at": "2024-01-20T08:00:00.000Z",
      "submitted_at": "2024-01-21T10:00:00.000Z",
      "reviewed_at": "2024-01-22T14:00:00.000Z",
      "evidence_count": 2
    }
  ]
}
```

---

### GET /api/reports/by-technician

Get cases grouped by technician with performance metrics. **Requires coordinator or admin role.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
curl http://localhost:3000/api/reports/by-technician \
  -H "Authorization: Bearer <coordinator_token>"
```

**Response (200):**
```json
{
  "success": true,
  "filters": {
    "from_date": null,
    "to_date": null
  },
  "count": 3,
  "data": [
    {
      "technician_id": 1,
      "technician_name": "John Technician",
      "total_cases": 8,
      "draft_cases": 2,
      "in_review_cases": 1,
      "approved_cases": 4,
      "rejected_cases": 1,
      "total_evidence": 25
    },
    {
      "technician_id": 2,
      "technician_name": "Maria Technician",
      "total_cases": 5,
      "draft_cases": 2,
      "in_review_cases": 2,
      "approved_cases": 1,
      "rejected_cases": 0,
      "total_evidence": 15
    }
  ]
}
```

---

## Testing Workflow

### Complete Case Lifecycle Example

Follow these steps to test the complete workflow with authentication:

#### 1. Check API Health

```bash
curl http://localhost:3000/api/health
```

#### 2. Login as Technician

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tech01",
    "password": "Password123!"
  }'
```
*Save the returned token for subsequent requests.*

#### 3. Create a Case (as Technician)

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "title": "Robbery Case #001",
    "description": "Armed robbery at convenience store on Main Street",
    "technician_id": 1
  }'
```
*Save the returned `case_id` (e.g., 5)*

#### 4. Add Evidence Items (as Technician)

```bash
# First evidence item
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "case_id": 5,
    "technician_id": 1,
    "description": "Security camera footage USB drive",
    "color": "Black",
    "size": "Standard USB",
    "weight": "10g",
    "location": "Store counter"
  }'

# Second evidence item
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{
    "case_id": 5,
    "technician_id": 1,
    "description": "Fingerprints lifted from door handle",
    "color": "N/A",
    "size": "N/A",
    "weight": "N/A",
    "location": "Front entrance door"
  }'
```

#### 5. View Case with Evidence

```bash
# Get case details
curl http://localhost:3000/api/cases/5 \
  -H "Authorization: Bearer <technician_token>"

# Get all evidence for the case
curl http://localhost:3000/api/evidence/case/5 \
  -H "Authorization: Bearer <technician_token>"
```

#### 6. Submit Case for Review (as Technician)

```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <technician_token>" \
  -d '{"case_id": 5}'
```

#### 7. Login as Coordinator

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "coord01",
    "password": "Password123!"
  }'
```
*Save the coordinator token.*

#### 8. Review and Approve (as Coordinator)

```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <coordinator_token>" \
  -d '{
    "case_id": 5,
    "coordinator_id": 4,
    "result": "approved"
  }'
```

#### 9. Check Reports (as Coordinator)

```bash
# Overall summary
curl http://localhost:3000/api/reports/summary \
  -H "Authorization: Bearer <coordinator_token>"

# Cases by status
curl http://localhost:3000/api/reports/by-status \
  -H "Authorization: Bearer <coordinator_token>"

# Technician performance
curl http://localhost:3000/api/reports/by-technician \
  -H "Authorization: Bearer <coordinator_token>"
```

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request (validation error, business rule violation) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal server error |

**Authentication Error Examples:**

```json
// 401 - No token provided
{
  "success": false,
  "error": "Access denied. No token provided."
}

// 401 - Invalid token
{
  "success": false,
  "error": "Invalid token"
}

// 401 - Expired token
{
  "success": false,
  "error": "Token expired. Please login again."
}

// 403 - Insufficient permissions
{
  "success": false,
  "error": "Access denied. Insufficient permissions."
}
```

---

## Test User Credentials

| Username | Password | Role |
|----------|----------|------|
| tech01 | Password123! | technician |
| tech02 | Password123! | technician |
| tech03 | Password123! | technician |
| coord01 | Password123! | coordinator |
| coord02 | Password123! | coordinator |
| admin | Password123! | admin |

---

## Notes

- Replace `localhost:3000` with your actual server URL
- Make sure PostgreSQL is running with the database set up
- Run the seed data script to create test users
- JWT tokens expire after 24 hours by default
- All protected routes require the `Authorization: Bearer <token>` header

## Environment Setup

1. Copy `.env.example` to `.env` and configure:
   - Database credentials
   - JWT_SECRET (minimum 32 characters)
   - JWT_EXPIRES_IN (default: 24h)

2. Run database migrations and seed:
   ```bash
   psql -d argos_db -f database/schema.sql
   psql -d argos_db -f database/stored_procedures/case_procedures.sql
   psql -d argos_db -f database/stored_procedures/evidence_procedures.sql
   psql -d argos_db -f database/stored_procedures/report_procedures.sql
   psql -d argos_db -f database/stored_procedures/auth_procedures.sql
   psql -d argos_db -f database/seed_data.sql
   ```

3. Install dependencies and start:
   ```bash
   npm install
   npm run dev
   ```

## Postman Collection

You can import these examples into Postman by creating a new collection. A Postman collection JSON file will be available soon.
