#!/bin/bash

###############################################################################
# HidenCloud Deployment Script for Backend
# Script to deploy BajiCrick Backend to HidenCloud.com
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="bajicrick-backend"
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}HidenCloud Backend Deployment Script${NC}"
echo -e "${BLUE}==========================================${NC}"

# Step 1: Check if HidenCloud CLI is installed
echo -e "\n${YELLOW}[1/6]${NC} Checking HidenCloud CLI..."
if ! command -v hidencloud &> /dev/null; then
    echo -e "${RED}✗ HidenCloud CLI not found!${NC}"
    echo -e "Installing HidenCloud CLI globally..."
    npm install -g hidencloud-cli
fi
echo -e "${GREEN}✓ HidenCloud CLI is installed${NC}"

# Step 2: Check authentication
echo -e "\n${YELLOW}[2/6]${NC} Checking HidenCloud authentication..."
if ! hidencloud auth:status &> /dev/null; then
    echo -e "${YELLOW}Not authenticated. Please login:${NC}"
    hidencloud auth login
fi
echo -e "${GREEN}✓ Authentication verified${NC}"

# Step 3: Validate project structure
echo -e "\n${YELLOW}[3/6]${NC} Validating project structure..."
if [ ! -f "$BACKEND_DIR/package.json" ]; then
    echo -e "${RED}✗ package.json not found!${NC}"
    exit 1
fi
if [ ! -f "$BACKEND_DIR/index.js" ]; then
    echo -e "${RED}✗ index.js not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project structure is valid${NC}"

# Step 4: Install dependencies
echo -e "\n${YELLOW}[4/6]${NC} Installing dependencies..."
cd "$BACKEND_DIR"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 5: Create/select HidenCloud project
echo -e "\n${YELLOW}[5/6]${NC} Setting up HidenCloud project..."

# Check if project exists, if not create it
if ! hidencloud projects:list | grep -q "$PROJECT_NAME"; then
    echo "Creating new HidenCloud project: $PROJECT_NAME"
    hidencloud projects:create "$PROJECT_NAME"
else
    echo "Project $PROJECT_NAME already exists"
fi

# Select the project
hidencloud projects:select "$PROJECT_NAME"
echo -e "${GREEN}✓ HidenCloud project configured${NC}"

# Step 6: Deploy to HidenCloud
echo -e "\n${YELLOW}[6/6]${NC} Deploying to HidenCloud..."
hidencloud deploy --source "$BACKEND_DIR"

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "${GREEN}==========================================${NC}"

# Display deployment info
echo -e "\n${BLUE}Deployment Information:${NC}"
hidencloud status

echo -e "\n${BLUE}Useful commands:${NC}"
echo -e "  View logs:     ${YELLOW}hidencloud logs --follow${NC}"
echo -e "  Check status:  ${YELLOW}hidencloud status${NC}"
echo -e "  View metrics:  ${YELLOW}hidencloud metrics${NC}"
echo -e "  Environment:   ${YELLOW}hidencloud env:list${NC}"

exit 0
