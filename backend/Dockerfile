FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Expose port
EXPOSE 4000

# Start in development mode
CMD ["npm", "run", "start:dev"]

# Builder stage
FROM base AS builder

# Install all dependencies (needed for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client
RUN npm run prisma:generate

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Start in production mode
CMD ["npm", "run", "start:prod"]
