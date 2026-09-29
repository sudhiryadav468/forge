# Foundation API image. Build from the monorepo root: docker compose build api
FROM node:22-bookworm-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci
COPY packages/types packages/types
COPY apps/api apps/api
RUN npm run build -w @nexusforge/types && npm run db:generate && npm run build -w @nexusforge/api

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=development PORT=4000
EXPOSE 4000
CMD ["sh", "-c", "npm run db:migrate && npm run start -w @nexusforge/api"]
