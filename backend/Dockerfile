FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Expose port
EXPOSE 4000

# Start in development mode
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Generate Prisma Client
RUN npm run prisma:generate

# Expose port
EXPOSE 4000

# Start in production mode
CMD ["npm", "run", "start:prod"]
