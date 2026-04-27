# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source and build
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy custom nginx config for SSL and SPA routing
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
