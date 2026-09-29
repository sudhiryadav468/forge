# NexusForge delivery roadmap

**Principle:** finish one reliable layer before adding the next. Do not call a feature shipped because a placeholder screen exists.

## Level 1 — Foundation (this release)

- [x] npm workspaces, Next.js + NestJS + PostgreSQL + Prisma
- [x] Register/login/logout, token rotation and password changes
- [x] Workspaces, projects, registered team members and backend RBAC
- [x] Issues, comments, tasks and a draggable Kanban board
- [x] Real dashboard, audit activity and basic API/database health
- [x] Docker Compose local stack, OpenAPI docs, PostgreSQL integration suite and CI verification
- [ ] Email verification, recovery email and true invitation workflow
- [ ] File attachments and cursor pagination

## Level 2 — Engineering (next)

1. GitHub OAuth/App connection with encrypted secrets and least-privilege scopes.
2. Webhook signature validation, idempotency and event queue.
3. Redis/BullMQ workers for sync, indexing and notifications; in-app notifications.
4. Search across accessible projects/issues/docs and stronger audit coverage.

## Level 3 — AI

1. Safe ingestion of Markdown, TXT, PDF and DOCX. Filter secrets, `.env`, generated output and large binaries.
2. Chunking, embeddings and pgvector retrieval; per-workspace/project isolation.
3. Separate Python FastAPI service for RAG, grounding, file citations and eval tests.
4. Suggestive issue analysis, clearly labeled as suggestions rather than ground truth.

## Level 4 — Cloud / DevOps

1. Automated unit/integration/Playwright E2E suites and release gates.
2. Build/publish container images, deployment jobs, rollback and HTTPS ingress.
3. Service metrics, logs, alerts and deployment history; database/Redis/AI health checks.
4. Production security review, recovery runbooks, backups, monitoring and documentation.

The in-app `/roadmap` page uses the same distinction between available and planned capabilities. CV/portfolio descriptions should be updated only after a milestone has shipped and been tested.
