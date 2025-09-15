# ---- Base Stage ----
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY tsconfig.json ./
RUN pnpm fetch

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN pnpm install --frozen-lockfile
# Generate Prisma Client
RUN pnpm --filter api exec prisma generate
# Build the API
RUN pnpm --filter api build

# ---- Production Runner Stage ----
FROM base AS runner
WORKDIR /app

# Copy only the necessary production files from the builder stage
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
# Copy root package.json for runtime dependencies
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# The command needs to run from the context of the specific package
CMD ["node", "packages/api/dist/main.js"]
