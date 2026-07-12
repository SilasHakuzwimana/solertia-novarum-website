# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and npm config
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies (will use .npmrc for config)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-slim AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy .npmrc
COPY .npmrc ./

# Copy built assets and dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the server
CMD ["pnpm", "start"]
