# Foundation REST API

Base URL: `/api` via Next.js proxy, or `http://localhost:4000/api` in development. OpenAPI UI: `/api/docs` when `NODE_ENV` is not `production`.

## Authentication

`GET /auth/csrf` returns a token and sets `nf_csrf`. Send it as `x-csrf-token` with the returned cookie for **every POST, PATCH or DELETE**, including register/login/refresh/logout. The browser client handles this automatically. Access and refresh cookies are HTTP-only; no bearer token is exposed to JavaScript.

| Method | Path | Body / response |
| --- | --- | --- |
| POST | `/auth/register` | `{name,email,password}` → `{user}` and cookies |
| POST | `/auth/login` | `{email,password}` → `{user}` and cookies |
| POST | `/auth/refresh` | Rotates refresh session; returns `{user}` |
| POST | `/auth/logout` | Revokes current session |
| GET | `/auth/me` | Authenticated `{user}` |
| PATCH | `/users/me` | `{name}` → updated `{user}` |
| PATCH | `/users/me/password` | `{currentPassword,newPassword}` → revokes all sessions |

`POST /auth/demo` is available **only** with `DEMO_MODE=true` outside production and after local seeding.

## Workspace and projects

| Method | Path | Permission |
| --- | --- | --- |
| GET/POST | `/workspaces` | List memberships / create owned workspace |
| GET/PATCH | `/workspaces/:id` | Member / owner or admin |
| GET/POST | `/workspaces/:id/members` | Member / owner or admin |
| PATCH/DELETE | `/workspaces/:id/members/:userId` | Owner or admin, subject to role rules |
| GET | `/workspaces/:id/activity` | Member |
| GET/POST | `/projects` | Workspace member / workspace manager |
| GET/PATCH/DELETE | `/projects/:id` | Member / project manager / workspace manager |
| GET/POST | `/projects/:id/members` | Member / project manager |
| PATCH/DELETE | `/projects/:id/members/:userId` | Project manager |
| GET | `/projects/:id/activity` | Member |

Adding a workspace member currently requires an **existing registered email**, not an email invitation. Project role overrides require that same workspace membership. Workspace owners/admins cannot be downgraded by a project override.

## Issues, tasks and dashboard

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/issues` | Issues across accessible workspaces |
| GET/POST | `/projects/:id/issues` | Project member / developer+ |
| GET/PATCH/DELETE | `/issues/:id` | Project member / developer+ / admin+ |
| GET/POST | `/issues/:id/comments` | Project member / developer+ |
| GET | `/tasks` | Tasks assigned to the signed-in user |
| GET/POST | `/projects/:id/tasks` | Project member / developer+ |
| PATCH/DELETE | `/tasks/:id` | Developer+ / admin+ |
| GET | `/dashboard` | Counts and recent work across accessible projects |
| GET | `/health`, `/health/database` | Public foundation health checks |

Issue statuses: `OPEN`, `IN_PROGRESS`, `REVIEW`, `RESOLVED`, `CLOSED`. Priorities: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. Task statuses: `TODO`, `IN_PROGRESS`, `DONE`. DTOs reject unexpected keys and invalid enum values. Lists are currently capped (100 per project, 200 cross-project); cursor pagination is future work.

For unauthorized cross-workspace reads the API responds with **404** instead of revealing whether a project exists. Auth failures are **401**, permission failures **403**, invalid input **400** and duplicate keys **409**.
