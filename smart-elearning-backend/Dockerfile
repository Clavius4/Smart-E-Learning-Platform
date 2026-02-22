FROM node:20-alpine

# Install additional dependencies for PDF generation and system tools
RUN apk add --no-cache \
    tzdata \
    fontconfig \
    ttf-dejavu \
    && cp /usr/share/zoneinfo/Africa/Dar_es_Salaam /etc/localtime \
    && echo "Africa/Dar_es_Salaam" > /etc/timezone

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies 
RUN npm ci --only=production || npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p tmp logs

# Copy environment file
COPY .env ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})" || exit 1

# Start the application
CMD ["sh", "-c", "node scripts/createAdmin.js && node scripts/init-reporting.js && npm start"]