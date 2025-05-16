# Use the base image defined in build.yaml for Home Assistant addon compatibility
ARG BUILD_FROM=alpine:3.21
FROM ${BUILD_FROM} AS builder

# Install Node.js and npm (only in the builder stage)
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files and scripts folder first
COPY package.json ./
COPY scripts ./scripts/

# Install dependencies with production flag and skip prepare script
RUN npm config set ignore-scripts true && \
    npm install --omit=dev && \
    npm install --no-save typescript && \
    npm cache clean --force

# Copy all files to the working directory
COPY . .

# Build TypeScript files directly (bypassing the prepare script)
RUN chmod +x scripts/docker-build.js && \
    node scripts/docker-build.js && \
    npx --no tsc

# No need for a separate stage - we can optimize this single stage
# Remove development files
RUN rm -rf src/ tsconfig.json .eslintrc.js node_modules/.cache

# Environment configuration for runtime (configured externally)
# Note: Sensitive values like API keys should be provided at runtime, not in the Dockerfile
ENV GROCY_BASE_URL=""
ENV GROCY_ENABLE_SSL_VERIFY="true"
ENV REST_RESPONSE_SIZE_LIMIT="10000"
# The API key should be provided at runtime:
# docker run -e GROCY_APIKEY_VALUE="your-api-key" ...

# Command to run the server
ENTRYPOINT ["node", "build/index.js"]