# Foundation web image. The API proxy target is resolved during the Next.js build.
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci
COPY packages/types packages/types
COPY apps/web apps/web
ARG API_INTERNAL_URL=http://api:4000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run build -w @nexusforge/types && npm run build -w @nexusforge/web

FROM node:22-bookworm-slim
WORKDIR /app
COPY --from=builder /app /app
ENV NODE_ENV=production PORT=3000 API_INTERNAL_URL=http://api:4000
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "@nexusforge/web"]
