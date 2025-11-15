# Stage 1: Development
FROM node:20-alpine AS development

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install all dependencies using workspace
RUN npm ci

# Copy frontend source code
COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 2: Build
FROM node:20-alpine AS build

WORKDIR /app

# Copy workspace root package files
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install all dependencies
RUN npm ci

# Copy frontend source code
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
