# ---- Builder Stage ----
# This stage installs all dependencies and builds the TypeScript code
FROM node:20-slim AS builder
WORKDIR /app
RUN npm install -g pnpm

# Copy all package manifests and the lockfile
COPY package.json pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
# If api depended on other workspace packages, you would copy their package.json here too

# Install ALL dependencies needed for the build
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Run Prisma generate and the build command for the 'api' package
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

# ---- Production Pruner Stage ----
# This stage will remove all devDependencies
FROM builder AS pruner
WORKDIR /app
RUN pnpm prune --prod

# ---- Final Production Runner Stage ----
FROM node:20-slim AS runner
WORKDIR /app

# Copy the pruned, production-only node_modules from the 'pruner' stage
COPY --from=pruner /app/node_modules ./node_modules

# Copy the built application and necessary runtime files
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
COPY --from=builder /app/gcloud-credentials.json ./gcloud-credentials.json

EXPOSE 3000

# The command to run the application
CMD ["node", "packages/api/dist/main.js"]
