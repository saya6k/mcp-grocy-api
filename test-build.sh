#!/bin/bash
# Test build script for mcp-grocy-api

# Make script executable
chmod +x "$0"

# Set colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting test build process...${NC}"

# Run the test-build script
echo -e "${YELLOW}Preparing test build environment...${NC}"
node scripts/test-build.js
if [ $? -ne 0 ]; then
  echo -e "${RED}Test build preparation failed${NC}"
  exit 1
fi

# Run the TypeScript compiler
echo -e "${YELLOW}Compiling TypeScript...${NC}"
npx tsc
if [ $? -ne 0 ]; then
  echo -e "${RED}TypeScript compilation failed${NC}"
  exit 1
fi

echo -e "${GREEN}Test build completed successfully!${NC}"

# Try a docker build test if docker is installed
if command -v docker &> /dev/null; then
  echo -e "${YELLOW}Testing Docker build...${NC}"
  echo -e "${YELLOW}This may take a few minutes on the first run...${NC}"
  
  # Ensure docker-build.js is executable
  chmod +x scripts/docker-build.js
  
  # Build with --no-cache to ensure a clean build
  if docker build --no-cache -t mcp-grocy-api:test .; then
    echo -e "${GREEN}Docker build successful!${NC}"
    echo ""
    echo "You can test the Docker image with:"
    echo "  docker run --rm -e GROCY_APIKEY_VALUE=\"your-api-key\" -e GROCY_BASE_URL=\"http://your-grocy-server\" mcp-grocy-api:test"
    echo ""
    echo "To clean up: docker rmi mcp-grocy-api:test"
  else
    echo -e "${RED}Docker build failed.${NC}"
    echo "Check the Dockerfile and make sure all required files are included."
    exit 1
  fi
else
  echo -e "${YELLOW}Docker not found, skipping Docker build test.${NC}"
fi