# ---- Base Stage ----
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm

# ---- Dependencies Stage ----
FROM base AS deps
WORKDIR /app
# Copy all package.json files and the lockfile
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/api/package.json ./packages/api/
# You would add other packages here if they were dependencies of the api
# COPY packages/common/package.json ./packages/common/

# Install ONLY production dependencies for the entire workspace
RUN pnpm install --prod --frozen-lockfile

# ---- Builder Stage ----
FROM base AS builder
WORKDIR /app
# Copy all package.json files and the lockfile again
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY packages/api/package.json ./packages/api/

# Install ALL dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY . .

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate
# Build the API
RUN pnpm --filter api build

# ---- Production Runner Stage ----
FROM base AS runner
WORKDIR /app

# Copy the production node_modules from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules

# Copy the built application from the 'builder' stage
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

EXPOSE 3000

# Run the application
CMD ["node", "packages/api/dist/main.js"]
