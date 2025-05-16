FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies but skip the prepare script which runs build
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Set permissions for scripts
RUN chmod +x scripts/*.js

# Build TypeScript files
RUN node scripts/docker-build.js && \
    npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy build output from builder stage
COPY --from=builder /app/build ./build

# Set up environment
ENV NODE_ENV=production

# Add metadata
LABEL org.opencontainers.image.source=https://github.com/saya6k/mcp-grocy-api
LABEL org.opencontainers.image.description="Grocy API integration for Model Context Protocol"
LABEL org.opencontainers.image.licenses=MIT

# Run the application
CMD ["node", "build/index.js"]