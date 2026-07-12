# Dockerfile
FROM node:22-slim

# Install pnpm and tsx globally
RUN npm install -g pnpm tsx

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build frontend (for production)
RUN pnpm run build

# Expose port
EXPOSE 3004

# Start the server with tsx
CMD ["pnpm", "exec", "tsx", "server.ts"]