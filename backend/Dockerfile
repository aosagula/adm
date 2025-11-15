# Stage 1: Development
FROM node:20-alpine AS development

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install all dependencies using workspace
RUN npm ci

# Copy backend source code
COPY backend ./backend

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install all dependencies
RUN npm ci

# Copy backend source code
COPY backend ./backend

# Generate Prisma client and build
WORKDIR /app/backend
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy backend package files
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/backend/prisma ./backend/prisma

WORKDIR /app/backend

EXPOSE 3001

CMD ["node", "dist/main.js"]
