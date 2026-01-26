# Argos API Documentation

Complete API reference for the Argos Evidence Management System.

## Base URL

```
http://localhost:3000/api
```

## Table of Contents

- [Health Check](#health-check)
- [Cases](#cases-endpoints)
- [Evidence](#evidence-endpoints)
- [Reports](#reports-endpoints)
- [Testing Workflow](#testing-workflow)

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

### GET /api/cases

Get all cases with optional filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status: `draft`, `in_review`, `approved`, `rejected` |
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Examples:**

```bash
# Get all cases
curl http://localhost:3000/api/cases

# Get only draft cases
curl "http://localhost:3000/api/cases?status=draft"

# Get cases in date range
curl "http://localhost:3000/api/cases?from_date=2024-01-01&to_date=2024-12-31"

# Combined filters
curl "http://localhost:3000/api/cases?status=approved&from_date=2024-01-01"
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

Get a single case by ID with full details including evidence count.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Case ID |

**Example:**

```bash
curl http://localhost:3000/api/cases/1
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

Create a new case file.

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

Update a case file. **Only works for cases in draft status.**

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

Delete a case file. **Only works for cases in draft status.** Deletes all associated evidence items.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Case ID |

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/cases/1
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

Submit a case for review. **Requires at least one evidence item.**

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| case_id | integer | Yes | Case ID to submit |

**Example:**

```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
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

Coordinator reviews a case (approve or reject). **Rejection requires justification.**

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

### GET /api/evidence/case/:caseId

Get all evidence items for a specific case.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| caseId | integer | Yes | Case ID |

**Example:**

```bash
curl http://localhost:3000/api/evidence/case/1
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

Get a single evidence item by ID.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Evidence ID |

**Example:**

```bash
curl http://localhost:3000/api/evidence/1
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

Add a new evidence item to a case. **Only works for cases in draft status.**

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

Update an evidence item. **Only works for cases in draft status.**

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

Delete an evidence item. **Only works for cases in draft status.**

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Evidence ID |

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/evidence/1
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

### GET /api/reports/summary

Get overall statistics summary.

**Example:**

```bash
curl http://localhost:3000/api/reports/summary
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

Get cases grouped by status with evidence counts.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
# All time
curl http://localhost:3000/api/reports/by-status

# With date filter
curl "http://localhost:3000/api/reports/by-status?from_date=2024-01-01&to_date=2024-12-31"
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

Get daily activity report for a date range. **Both dates are required.**

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | Yes | Start date (YYYY-MM-DD) |
| to_date | string | Yes | End date (YYYY-MM-DD) |

**Example:**

```bash
curl "http://localhost:3000/api/reports/by-date?from_date=2024-01-01&to_date=2024-01-07"
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

Get detailed list of rejected cases with justifications.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
curl http://localhost:3000/api/reports/rejections
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

Get cases grouped by technician with performance metrics.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from_date | string | No | Start date (YYYY-MM-DD) |
| to_date | string | No | End date (YYYY-MM-DD) |

**Example:**

```bash
curl http://localhost:3000/api/reports/by-technician
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

Follow these steps to test the complete workflow:

#### 1. Check API Health

```bash
curl http://localhost:3000/api/health
```

#### 2. Create a Case

```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Robbery Case #001",
    "description": "Armed robbery at convenience store on Main Street",
    "technician_id": 1
  }'
```
*Save the returned `case_id` (e.g., 1)*

#### 3. Add Evidence Items

```bash
# First evidence item
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
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
  -d '{
    "case_id": 1,
    "technician_id": 1,
    "description": "Fingerprints lifted from door handle",
    "color": "N/A",
    "size": "N/A",
    "weight": "N/A",
    "location": "Front entrance door"
  }'
```

#### 4. View Case with Evidence

```bash
# Get case details
curl http://localhost:3000/api/cases/1

# Get all evidence for the case
curl http://localhost:3000/api/evidence/case/1
```

#### 5. Update Evidence (if needed)

```bash
curl -X PUT http://localhost:3000/api/evidence/1 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated: Security camera footage - 4 hours of recording"
  }'
```

#### 6. Submit Case for Review

```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
  -d '{"case_id": 1}'
```

#### 7. Review and Approve (as Coordinator)

```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "coordinator_id": 4,
    "result": "approved"
  }'
```

#### 8. Check Reports

```bash
# Overall summary
curl http://localhost:3000/api/reports/summary

# Cases by status
curl http://localhost:3000/api/reports/by-status

# Technician performance
curl http://localhost:3000/api/reports/by-technician
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
| 404 | Resource not found |
| 500 | Internal server error |

---

## Notes

- Replace `localhost:3000` with your actual server URL
- Make sure PostgreSQL is running with the database set up
- User IDs must exist in the users table with appropriate roles
- technician_id must have role = 'technician'
- coordinator_id must have role = 'coordinator'

## Postman Collection

You can import these examples into Postman by creating a new collection. A Postman collection JSON file will be available soon.
