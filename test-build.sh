#!/bin/bash

# Make the script executable
chmod +x scripts/test-build.js

# Run the test build
echo "🚀 Starting test build process..."
npm run test-build

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Build test completed successfully!"
else
  echo "❌ Build test failed. Please check the errors above."
  exit 1
fi

# Try a docker build test if docker is installed
if command -v docker &> /dev/null; then
  echo "🐳 Testing Docker build..."
  echo "👉 This may take a few minutes on the first run..."
  
  # Ensure docker-build.js is executable
  chmod +x scripts/docker-build.js
  
  # Build with --no-cache to ensure a clean build
  if docker build --no-cache -t mcp-grocy-api:test .; then
    echo "✅ Docker build successful!"
    echo ""
    echo "You can test the Docker image with:"
    echo "  docker run --rm -e GROCY_APIKEY_VALUE=\"your-api-key\" -e GROCY_BASE_URL=\"http://your-grocy-server\" mcp-grocy-api:test"
    echo ""
    echo "To clean up: docker rmi mcp-grocy-api:test"
  else
    echo "❌ Docker build failed."
    echo "Check the Dockerfile and make sure all required files are included."
    exit 1
  fi
else
  echo "ℹ️ Docker not found, skipping Docker build test."
fi