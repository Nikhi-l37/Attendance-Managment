# ----------------------------------------------------
# Stage 1: Build the React 19 / Vite Frontend
# ----------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install root/frontend dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source files
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Server Runner
# ----------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Return to /app and copy server codebase
WORKDIR /app
COPY server/ ./server/

# Copy built frontend from Stage 1 into /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Render assigns a dynamic port via the PORT environment variable
EXPOSE 5000

# Start the unified Express server (serves both /api and React frontend)
CMD ["node", "server/server.js"]
