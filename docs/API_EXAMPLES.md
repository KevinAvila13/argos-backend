# Argos API Examples

This document contains examples of how to test all API endpoints.

## 🚀 Base URL

```
http://localhost:3000/api
```

## 📋 Cases Endpoints

### 1. GET /api/cases - Get all cases

**Description:** Retrieves all cases with optional filters

**Method:** `GET`

**Query Parameters:**
- `status` (optional): Filter by status (draft, in_review, approved, rejected)
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)

**Examples:**

#### Get all cases
```bash
curl http://localhost:3000/api/cases
```

#### Get cases with status filter
```bash
curl "http://localhost:3000/api/cases?status=draft"
```

#### Get cases in date range
```bash
curl "http://localhost:3000/api/cases?from_date=2024-01-01&to_date=2024-12-31"
```

#### Get approved cases from specific date
```bash
curl "http://localhost:3000/api/cases?status=approved&from_date=2024-01-01"
```

**Success Response (200):**
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

**Error Response (500):**
```json
{
  "success": false,
  "error": "Database connection error"
}
```

---

### 2. POST /api/cases - Create a new case

**Description:** Creates a new case file

**Method:** `POST`

**Body (JSON):**
```json
{
  "title": "Evidence Case #001",
  "description": "Robbery investigation on Main Street",
  "technician_id": 1
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Evidence Case #001",
    "description": "Robbery investigation",
    "technician_id": 1
  }'
```

**Success Response (201):**
```json
{
  "message": "Case file created successfully",
  "case_id": 1
}
```

---

### 3. POST /api/cases/submit - Submit case for review

**Description:** Submits a case to in_review status

**Method:** `POST`

**Body (JSON):**
```json
{
  "case_id": 1
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1
  }'
```

**Success Response (200):**
```json
{
  "message": "Case file submitted for review successfully",
  "case_id": 1
}
```

---

### 4. POST /api/cases/review - Review a case

**Description:** Coordinator approves or rejects a case

**Method:** `POST`

**Body (JSON):**
```json
{
  "case_id": 1,
  "coordinator_id": 2,
  "result": "approved",
  "justification": null
}
```

**Example (Approve):**
```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "coordinator_id": 2,
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
    "coordinator_id": 2,
    "result": "rejected",
    "justification": "Missing evidence documentation"
  }'
```

---

## 🔬 Evidence Endpoints

### 1. POST /api/evidence - Add evidence item

**Description:** Adds an evidence item to a case

**Method:** `POST`

**Body (JSON):**
```json
{
  "case_id": 1,
  "technician_id": 1,
  "description": "Blue handled knife",
  "color": "Blue and silver",
  "size": "20cm length",
  "weight": "150g",
  "location": "Kitchen drawer"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": 1,
    "technician_id": 1,
    "description": "Blue handled knife",
    "color": "Blue and silver",
    "size": "20cm length",
    "weight": "150g",
    "location": "Kitchen drawer"
  }'
```

**Success Response (201):**
```json
{
  "message": "Evidence item added successfully",
  "evidence_id": 1
}
```

---

## 🧪 Testing Workflow

### Complete Case Workflow Example

1. **Create a case**
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{"title": "Case #001", "description": "Test case", "technician_id": 1}'
```

2. **Add evidence items**
```bash
curl -X POST http://localhost:3000/api/evidence \
  -H "Content-Type: application/json" \
  -d '{"case_id": 1, "technician_id": 1, "description": "Knife", "color": "Blue"}'
```

3. **Get all cases**
```bash
curl http://localhost:3000/api/cases
```

4. **Submit for review**
```bash
curl -X POST http://localhost:3000/api/cases/submit \
  -H "Content-Type: application/json" \
  -d '{"case_id": 1}'
```

5. **Review and approve**
```bash
curl -X POST http://localhost:3000/api/cases/review \
  -H "Content-Type: application/json" \
  -d '{"case_id": 1, "coordinator_id": 2, "result": "approved"}'
```

---

## 🔧 Postman Collection

You can import these examples into Postman by creating a new collection and adding each request manually, or use the Postman Collection file (coming soon).

## 📝 Notes

- Replace `localhost:3000` with your actual server URL
- Make sure the database is set up and the server is running
- User IDs (technician_id, coordinator_id) must exist in the users table
