FROM node:20-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium-browser \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxrandr2 \
    libgbm1 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libatk1.0-0 \
    libc6 \
    libdbus-1-3 \
    libxext6 \
    libxdamage1 \
    libxcomposite1 \
    libxkbcommon0 \
    fonts-liberation \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy built application (assuming build is done before docker)
COPY dist ./dist
COPY server/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/index.js"]
