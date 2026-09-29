# Local Compose deployment (Foundation)

This is a **development stack**, not an Internet-facing production recipe. Only web, API and PostgreSQL are containerized in the Foundation. Redis, workers, the Python AI service and an HTTPS reverse proxy are future milestones.

1. Copy root `.env.example` to `.env`. Replace `POSTGRES_PASSWORD` with a long **URL-safe** password (it is interpolated into the Prisma URL), and replace both token secrets with different random values. Do not commit the file.
2. `docker compose up --build` starts PostgreSQL, waits for it, applies Prisma migrations, starts NestJS, waits for database health, then starts Next.js.
3. Visit `http://localhost:3000`. The API's Swagger page is `http://localhost:4000/api/docs` while the API is in development mode.
4. Optional sample data: set `DEMO_MODE=true` in root `.env`, restart the `api` service, then run `docker compose exec api npm run db:seed`.
5. To reset the **local** database: stop Compose and remove its named volume only if you explicitly intend to discard all local project data.

`API_INTERNAL_URL=http://api:4000` is baked into the Next.js rewrite at image build time. Browser code only calls relative `/api/*` routes. PostgreSQL and API ports are bound to the host loopback interface in Compose; only the web port is exposed to the network. The API uses `TRUST_PROXY=true` here solely because Next.js is the trusted single-hop proxy, so rate limits apply per browser IP. Do not enable it if the API can be reached directly from untrusted networks.

For production, additionally require TLS, managed secrets, backup/restore drills, narrow network policies, observability, migration/rollback procedure, disabled demo mode, email verification/recovery and a separate production Compose/Kubernetes configuration. None of that is claimed to be done here.
