# Frontend Dockerfile for Next.js Development
FROM node:20-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy source code and change ownership
COPY --chown=nextjs:nodejs . .

# Create .next directory with proper permissions
RUN mkdir -p .next && chown -R nextjs:nodejs .next

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["pnpm", "run", "dev"]