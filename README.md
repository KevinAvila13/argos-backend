# Argos Evidence Management System - Backend

Backend API for the Argos Forensic Evidence Management System. Built with Node.js, Express, and PostgreSQL.

## Features

- RESTful API for case file management
- Evidence item tracking (indicios)
- Workflow management (draft → review → approval/rejection)
- JWT authentication with role-based access control
- User roles: technician, coordinator, admin
- PostgreSQL stored procedures for business logic
- Comprehensive data validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Architecture**: MVC pattern with service layer

## Project Structure

```
argos-backend/
├── database/
│   ├── schema.sql                      # Database tables and structure
│   ├── stored_procedures/              # PostgreSQL stored procedures
│   │   ├── case_procedures.sql         # Case management procedures
│   │   ├── evidence_procedures.sql     # Evidence management procedures
│   │   ├── report_procedures.sql       # Reports and statistics
│   │   └── auth_procedures.sql         # Authentication procedures
│   ├── seed_data.sql                   # Sample test data with users
│   ├── setup.sh                        # Automated setup script
│   └── README.md                       # Database documentation
├── src/
│   ├── config/
│   │   └── db.js                       # Database connection config
│   ├── controllers/                    # Request handlers
│   ├── middleware/                     # Express middleware
│   │   └── auth.middleware.js          # JWT authentication & authorization
│   ├── routes/                         # API route definitions
│   └── services/                       # Business logic layer
├── docs/
│   ├── CONTEXT.md                      # Project requirements
│   ├── API_EXAMPLES.md                 # Complete API documentation
│   └── DATABASE_SETUP_COMPLETE.md      # Database documentation
├── .env.example                        # Environment variables template
├── index.js                            # Application entry point
└── package.json                        # Dependencies and scripts

```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd argos-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Set up the database:
```bash
# Option 1: Automated setup (Linux/Mac)
chmod +x database/setup.sh
./database/setup.sh

# Option 2: Manual setup (Windows/All platforms)
psql -U postgres -c "CREATE DATABASE argos_db;"
psql -U postgres -d argos_db -f database/schema.sql
psql -U postgres -d argos_db -f database/stored_procedures/case_procedures.sql
psql -U postgres -d argos_db -f database/stored_procedures/evidence_procedures.sql
psql -U postgres -d argos_db -f database/stored_procedures/report_procedures.sql
psql -U postgres -d argos_db -f database/stored_procedures/auth_procedures.sql
psql -U postgres -d argos_db -f database/seed_data.sql
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/users` - List all users (admin only)

### Cases
- `GET /api/cases` - Get all cases (with optional filters)
- `GET /api/cases/:id` - Get case by ID
- `POST /api/cases` - Create a new case (technician)
- `PUT /api/cases/:id` - Update case (draft only)
- `DELETE /api/cases/:id` - Delete case (draft only)
- `POST /api/cases/submit` - Submit case for review (technician)
- `POST /api/cases/review` - Review and approve/reject case (coordinator)

### Evidence
- `GET /api/evidence/case/:caseId` - Get all evidence for a case
- `GET /api/evidence/:id` - Get evidence by ID
- `POST /api/evidence` - Add evidence item (technician)
- `PUT /api/evidence/:id` - Update evidence (draft only)
- `DELETE /api/evidence/:id` - Delete evidence (draft only)

### Reports
- `GET /api/reports/summary` - Overall statistics
- `GET /api/reports/by-status` - Cases grouped by status
- `GET /api/reports/by-date` - Daily activity report
- `GET /api/reports/rejections` - Rejected cases details
- `GET /api/reports/by-technician` - Technician performance

See [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for detailed usage examples with authentication.

## Database

The application uses PostgreSQL with stored procedures for business logic:

- **sp_create_case_file**: Creates new case
- **sp_submit_case_for_review**: Submits case for coordinator review
- **sp_review_case**: Approve or reject cases
- **sp_get_cases**: Retrieve cases with filters
- **sp_add_evidence_item**: Add evidence to cases
- **sp_get_evidence_by_case**: Get evidence for a specific case
- **sp_get_evidence_item**: Get single evidence item

See [database/README.md](database/README.md) for complete database documentation.

## Testing

### Unit Tests (Jest)
```bash
# Run all unit tests
npm run test:unit

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Run E2E tests (requires server running or starts automatically)
npm run test:e2e

# Run all tests
npm test
```

### Test Structure
```
tests/
├── unit/                    # Unit tests with mocked dependencies
│   ├── auth.service.test.js
│   ├── auth.middleware.test.js
│   ├── auth.controller.test.js
│   └── cases.controller.test.js
├── e2e/                     # End-to-end API tests
│   ├── auth.spec.js
│   ├── case-workflow.spec.js
│   └── reports.spec.js
└── setup.js                 # Jest setup configuration
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Manual API Testing
Use curl, Postman, or any HTTP client. Examples:

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tech01","password":"Password123!"}'

# Use the token in subsequent requests
curl http://localhost:3000/api/cases \
  -H "Authorization: Bearer <your_token>"

# Create a new case
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"title":"Test Case","description":"Testing","technician_id":1}'
```

### Test Users (from seed data)
| Username | Password | Role |
|----------|----------|------|
| tech01 | Password123! | technician |
| coord01 | Password123! | coordinator |
| admin | Password123! | admin |

## Project Status

This is a portfolio project demonstrating:
- RESTful API design
- PostgreSQL database design with stored procedures
- MVC architecture with service layer
- JWT authentication with role-based access control
- Business logic validation
- Unit testing with Jest
- E2E testing with Playwright
- Professional code structure and documentation

## Future Enhancements

- [x] JWT authentication
- [x] Role-based access control
- [x] Unit tests (Jest)
- [x] E2E tests (Playwright)
- [ ] Docker containerization
- [ ] Frontend (React)
- [ ] File upload for evidence photos
- [ ] Audit trail logging

## Documentation

- [CONTEXT.md](docs/CONTEXT.md) - Project requirements and specifications
- [API_EXAMPLES.md](docs/API_EXAMPLES.md) - API usage examples
- [DATABASE_SETUP_COMPLETE.md](docs/DATABASE_SETUP_COMPLETE.md) - Database implementation guide
- [database/README.md](database/README.md) - Database setup instructions

## License

This is a portfolio project for educational and demonstration purposes.

## Author

Kevin - [GitHub Profile](https://github.com/yourusername)
