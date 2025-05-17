# Default base image for docker builds. For addons, this is overridden by build.yaml.
ARG BUILD_FROM=alpine:3.21


FROM $BUILD_FROM AS base
ARG NODE_VERSION=20 # Default Node.js version for addon OS setup
ARG BUILD_FROM # Re-declare ARG to make it available in this stage
WORKDIR /app

# Arguments for pre-installed packages, primarily for docker builds.

# --- OS Level Setup ---
# This section handles OS package installations.
# It differentiates between addon builds and docker builds.

# Common packages needed by the application or build process
RUN if echo "$BUILD_FROM" | grep -q "home-assistant"; then \
    # Home Assistant base already has curl and jq
    echo "Installing Node.js v${NODE_VERSION} for Home Assistant addon..." && \
    apk add --no-cache nodejs~=${NODE_VERSION} npm && \
    rm -rf /tmp/* /var/tmp/*; \
else \
    # Regular Alpine needs all dependencies
    echo "Installing Node.js v${NODE_VERSION} for docker build..." && \
    apk add --no-cache nodejs~=${NODE_VERSION} npm tini && \
    rm -rf /tmp/* /var/tmp/*; \
fi

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies but skip the prepare script which runs build
RUN npm install --ignore-scripts

# COPY . . should come before conditional rootfs copy if rootfs might overlay app files,
# or after if app files might overlay rootfs defaults.
# Assuming app files are primary, then addon specifics overlay.
COPY . .

# --- Addon Specific: Copy rootfs for S6-Overlay and other addon specific files ---
RUN if echo "$BUILD_FROM" | grep -q "home-assistant"; then \
    echo "Addon build: Copying rootfs contents..." && \
    # Ensure rootfs directory exists in the build context
    if [ -d "rootfs" ]; then \
      cp -r rootfs/. / ; \
    else \
      echo "Warning: rootfs directory not found, skipping copy."; \
    fi; \
  else \
    echo "docker build: Skipping rootfs copy."; \
  fi

RUN npm run build

# --- Environment Variables ---
# Port for the SSE server (and Admin UI if enabled)
ENV GROCY_BASE_URL=
ENV GROCY_APIKEY_VALUE=
ENV GROCY_ENABLE_SSL_VERIFY=
ENV REST_RESPONSE_SIZE_LIMIT=

# --- Volumes ---

# --- Expose Port ---

# --- Entrypoint & Command ---
# For Home Assistant addon builds, the entrypoint is /init (from S6-Overlay in the base image).
# CMD is also typically handled by S6 services defined in rootfs.
# By not specifying ENTRYPOINT or CMD here, we rely on the base image's defaults when built as an addon.