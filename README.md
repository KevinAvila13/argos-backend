# Argos Evidence Management System - Backend

Backend API for the Argos Forensic Evidence Management System. Built with Node.js, Express, and PostgreSQL.

## Features

- RESTful API for case file management
- Evidence item tracking (indicios)
- Workflow management (draft → review → approval/rejection)
- Role-based access control (technician, coordinator, admin)
- PostgreSQL stored procedures for business logic
- Comprehensive data validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Architecture**: MVC pattern with service layer

## Project Structure

```
argos-backend/
├── database/
│   ├── schema.sql                      # Database tables and structure
│   ├── stored_procedures/              # PostgreSQL stored procedures
│   ├── seed_data.sql                   # Sample test data
│   ├── setup.sh                        # Automated setup script
│   └── README.md                       # Database documentation
├── src/
│   ├── config/
│   │   └── db.js                       # Database connection config
│   ├── controllers/                    # Request handlers
│   ├── routes/                         # API route definitions
│   └── services/                       # Business logic layer
├── docs/
│   ├── CONTEXT.md                      # Project requirements
│   ├── API_EXAMPLES.md                 # API usage examples
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
psql -U postgres -d argos_db -f database/seed_data.sql
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Cases
- `GET /api/cases` - Get all cases (with optional filters)
- `POST /api/cases` - Create a new case
- `POST /api/cases/submit` - Submit case for review
- `POST /api/cases/review` - Review and approve/reject case

### Evidence
- `POST /api/evidence` - Add evidence item to a case

See [docs/API_EXAMPLES.md](docs/API_EXAMPLES.md) for detailed usage examples.

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

## Development

### Running in Development Mode
```bash
npm run dev
```

### Testing the API
Use curl, Postman, or any HTTP client. Examples:

```bash
# Get all cases
curl http://localhost:3000/api/cases

# Create a new case
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Case","description":"Testing","technician_id":1}'
```

## Project Status

This is a portfolio project demonstrating:
- RESTful API design
- PostgreSQL database design with stored procedures
- MVC architecture
- Business logic validation
- Professional code structure and documentation

## Future Enhancements

- [ ] JWT authentication
- [ ] Unit tests (Jest)
- [ ] E2E tests (Playwright)
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
