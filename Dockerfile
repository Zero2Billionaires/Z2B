# Multi-stage Dockerfile for Z2B Platform
# Builds both client and server in optimized containers

# ===========================================
# Stage 1: Build Client (React/Vite)
# ===========================================
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# ===========================================
# Stage 2: Build Server (Node.js/Express)
# ===========================================
FROM node:18-alpine AS server-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# ===========================================
# Stage 3: Production Image
# ===========================================
FROM node:18-alpine

WORKDIR /app

# Install PM2 for process management
RUN npm install -g pm2

# Copy built client from builder
COPY --from=client-builder /app/client/dist ./client/dist

# Copy server from builder
COPY --from=server-builder /app/server ./server

# Copy necessary files
COPY package.json ./
COPY README.md ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server with PM2
CMD ["pm2-runtime", "start", "server/server.js", "--name", "z2b-api"]
