#!/bin/bash

# =============================================
# Argos Database Complete Setup Script
# Description: Automated setup for Argos database
# Usage: ./database/setup.sh
# =============================================

echo "🚀 Argos Database Setup"
echo "======================="
echo ""

# Configuration
DB_NAME="argos_db"
DB_USER="postgres"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if PostgreSQL is installed
echo -e "${BLUE}Step 1: Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed or not in PATH${NC}"
    echo "Please install PostgreSQL first: https://www.postgresql.org/download/"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
echo ""

# Step 2: Check if database exists
echo -e "${BLUE}Step 2: Checking if database exists...${NC}"
DB_EXISTS=$(psql -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ $DB_EXISTS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to DROP and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U $DB_USER -c "DROP DATABASE $DB_NAME;"
        echo -e "${GREEN}✅ Database dropped${NC}"
    else
        echo "Skipping database creation..."
    fi
fi

# Create database if it doesn't exist
if [ $DB_EXISTS -eq 0 ] || [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Creating database '$DB_NAME'..."
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Database created${NC}"
fi
echo ""

# Step 3: Create schema
echo -e "${BLUE}Step 3: Creating database schema (tables, indexes, triggers)...${NC}"
psql -U $DB_USER -d $DB_NAME -f database/schema.sql
echo -e "${GREEN}✅ Schema created${NC}"
echo ""

# Step 4: Create case stored procedures
echo -e "${BLUE}Step 4: Creating case management stored procedures...${NC}"
psql -U $DB_USER -d $DB_NAME -f database/stored_procedures/case_procedures.sql
echo -e "${GREEN}✅ Case procedures created${NC}"
echo ""

# Step 5: Create evidence stored procedures
echo -e "${BLUE}Step 5: Creating evidence management stored procedures...${NC}"
psql -U $DB_USER -d $DB_NAME -f database/stored_procedures/evidence_procedures.sql
echo -e "${GREEN}✅ Evidence procedures created${NC}"
echo ""

# Step 6: Insert seed data (optional)
echo -e "${BLUE}Step 6: Inserting sample data...${NC}"
read -p "Do you want to insert sample test data? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    psql -U $DB_USER -d $DB_NAME -f database/seed_data.sql
    echo -e "${GREEN}✅ Sample data inserted${NC}"
else
    echo "Skipping sample data insertion..."
fi
echo ""

# Step 7: Verify installation
echo -e "${BLUE}Step 7: Verifying installation...${NC}"
echo "Tables:"
psql -U $DB_USER -d $DB_NAME -c "\dt"
echo ""
echo "Stored Procedures:"
psql -U $DB_USER -d $DB_NAME -c "\df" | grep sp_
echo ""

# Final message
echo ""
echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with database credentials"
echo "2. Start the backend server: npm run dev"
echo "3. Test the API endpoints"
echo ""
echo "📚 Documentation:"
echo "- Database README: database/README.md"
echo "- API Examples: docs/API_EXAMPLES.md"
echo ""
echo "🔑 Test credentials (if you inserted sample data):"
echo "   Technician: tech01 / Password123!"
echo "   Coordinator: coord01 / Password123!"
echo ""
