FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set permissions for scripts
RUN chmod +x scripts/*.js

# Build TypeScript files
RUN node scripts/docker-build.js && npx tsc

# Clean up dev dependencies
RUN npm prune --production

# Set up environment
ENV NODE_ENV=production

# Run the application
CMD ["node", "build/index.js"]