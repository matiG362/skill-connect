# ---------------------------------------------------------------------------- #
#                          Stage 1: Install dependencies                       #
# ---------------------------------------------------------------------------- #
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm turbo

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Copy only the package.json files for dependency installation
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/
COPY packages/mobile/package.json ./packages/mobile/
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------- #
#                            Stage 2: Build the app                            #
# ---------------------------------------------------------------------------- #
FROM base AS builder
WORKDIR /app
# Copy the pruned node_modules
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the source code
COPY . .
# Generate prisma client and build the API
RUN turbo run db:generate --filter=api
RUN turbo run build --filter=api

# ---------------------------------------------------------------------------- #
#                              Stage 3: Final image                            #
# ---------------------------------------------------------------------------- #
FROM base
WORKDIR /app
# Copy only the necessary files for the API to run
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/gcloud-credentials.json ./gcloud-credentials.json

# Tell Prisma where to find the schema at runtime
ENV PRISMA_SCHEMA_PATH=./packages/api/prisma/schema.prisma

WORKDIR /app/packages/api

CMD ["node", "dist/main.js"]
