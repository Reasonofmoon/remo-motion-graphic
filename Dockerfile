# Remotion Cloud Run Renderer
# Based on official Remotion Docker guide

FROM node:20-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-symbola \
    fonts-noto-color-emoji \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path for Puppeteer/Remotion
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROMIUM_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for building)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript (compile render-server.ts)
RUN npx tsc --outDir dist --esModuleInterop --module commonjs --target es2020 render-server.ts remotion-entry.ts

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "dist/render-server.js"]
