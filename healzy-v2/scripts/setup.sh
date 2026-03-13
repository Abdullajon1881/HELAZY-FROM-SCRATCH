#!/usr/bin/env bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Healzy V2 — Setup Script     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
check_cmd() { command -v "$1" >/dev/null 2>&1 || { echo "  ✗ $1 not found — please install it first"; exit 1; }; }
echo -e "${YELLOW}Checking prerequisites...${NC}"
check_cmd node
check_cmd npm
check_cmd docker
check_cmd docker-compose
echo -e "${GREEN}  ✓ All prerequisites satisfied${NC}"
echo ""

# Copy env
echo -e "${YELLOW}Setting up environment...${NC}"
[ ! -f backend/.env ] && cp .env.example backend/.env && echo "  ✓ Created backend/.env (fill in API keys!)"
[ ! -f frontend/.env.local ] && cat .env.example | grep NEXT_PUBLIC > frontend/.env.local && echo "  ✓ Created frontend/.env.local"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
echo -e "${GREEN}  ✓ Dependencies installed${NC}"
echo ""

# Start DB
echo -e "${YELLOW}Starting PostgreSQL & Redis...${NC}"
docker-compose up -d postgres redis
sleep 5

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd backend && npx prisma migrate dev --name init && cd ..
echo -e "${GREEN}  ✓ Database ready${NC}"
echo ""

echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup complete! Run:                        ║${NC}"
echo -e "${GREEN}║    npm run dev  — start both servers         ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  Frontend: http://localhost:3000             ║${NC}"
echo -e "${GREEN}║  Backend:  http://localhost:3001             ║${NC}"
echo -e "${GREEN}║  Swagger:  http://localhost:3001/docs        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠  Remember to add your API keys to backend/.env:${NC}"
echo "   ANTHROPIC_API_KEY, GEMINI_API_KEY, GOOGLE_CLIENT_ID"
