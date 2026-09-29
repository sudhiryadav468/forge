import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppModule } from '../src/app.module';

/** Real HTTP + PostgreSQL integration flow. DATABASE_URL must point at a disposable test DB in CI. */
describe('Foundation API (HTTP + PostgreSQL)', () => {
  let app: INestApplication;
  let owner: ReturnType<typeof request.agent>;
  let viewer: ReturnType<typeof request.agent>;
  let outsider: ReturnType<typeof request.agent>;
  let db: PrismaClient;
  let csrfOwner: string; let csrfViewer: string; let csrfOutsider: string;
  let workspaceId: string; let projectId: string; let issueId: string; let viewerId: string;
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  const ownerEmail = `owner-${suffix}@example.test`;
  const viewerEmail = `viewer-${suffix}@example.test`;
  const outsiderEmail = `outsider-${suffix}@example.test`;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api'); app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
    owner = request.agent(app.getHttpServer()); viewer = request.agent(app.getHttpServer()); outsider = request.agent(app.getHttpServer());
    csrfOwner = (await owner.get('/api/auth/csrf').expect(200)).body.csrfToken;
    csrfViewer = (await viewer.get('/api/auth/csrf').expect(200)).body.csrfToken;
    csrfOutsider = (await outsider.get('/api/auth/csrf').expect(200)).body.csrfToken;
  });
  afterAll(async () => {
    if (workspaceId) await db.workspace.delete({ where: { id: workspaceId } }).catch(() => {});
    await db.user.deleteMany({ where: { email: { in: [ownerEmail, viewerEmail, outsiderEmail] } } }).catch(() => {});
    await db.$disconnect(); await app.close();
  });

  it('rejects mutations without a matching CSRF token', async () => {
    await owner.post('/api/auth/register').send({ name: 'Owner Test', email: ownerEmail, password: 'StrongPass123!' }).expect(403);
    await owner.post('/api/auth/register').set('x-csrf-token', 'x'.repeat(64))
      .send({ name: 'Owner Test', email: ownerEmail, password: 'StrongPass123!' }).expect(403);
    await owner.post('/api/auth/register').set('x-csrf-token', 'é'.repeat(64))
      .send({ name: 'Owner Test', email: ownerEmail, password: 'StrongPass123!' }).expect(403);
  });

  it('registers with hashed password and HTTP-only session cookies', async () => {
    const res = await owner.post('/api/auth/register').set('x-csrf-token', csrfOwner)
      .send({ name: 'Owner Test', email: ownerEmail, password: 'StrongPass123!' }).expect(201);
    expect(res.body.user.email).toBe(ownerEmail);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some(c => c.startsWith('nf_access=') && c.includes('HttpOnly'))).toBe(true);
    expect(cookies.some(c => c.startsWith('nf_refresh=') && c.includes('HttpOnly'))).toBe(true);
    const stored = await db.user.findUniqueOrThrow({ where: { email: ownerEmail } });
    expect(stored.passwordHash).not.toBe('StrongPass123!');
    expect(stored.passwordHash).toMatch(/^\$argon2id\$/);
    await owner.get('/api/auth/me').expect(200);
  });

  it('creates a workspace and a project; validates inputs', async () => {
    await owner.post('/api/workspaces').set('x-csrf-token', csrfOwner).send({ name: '' }).expect(400);
    const ws = await owner.post('/api/workspaces').set('x-csrf-token', csrfOwner)
      .send({ name: 'Test Workspace' }).expect(201);
    workspaceId = ws.body.id;
    expect(ws.body.role).toBe('OWNER');
    const project = await owner.post('/api/projects').set('x-csrf-token', csrfOwner)
      .send({ workspaceId, name: 'Test API', key: 'TST', description: 'Integration test project' }).expect(201);
    projectId = project.body.id;
    expect(project.body.key).toBe('TST');
    await owner.post('/api/projects').set('x-csrf-token', csrfOwner)
      .send({ workspaceId, name: 'Other Project', key: 'TST' }).expect(409);
  });

  it('keeps non-members out, even when they know the project ID', async () => {
    await outsider.post('/api/auth/register').set('x-csrf-token', csrfOutsider)
      .send({ name: 'Outsider Test', email: outsiderEmail, password: 'StrongPass123!' }).expect(201);
    await outsider.get(`/api/projects/${projectId}`).expect(404);
    await outsider.get(`/api/projects/${projectId}/issues`).expect(404);
    await outsider.post(`/api/projects/${projectId}/tasks`).set('x-csrf-token', csrfOutsider)
      .send({ title: 'Not allowed' }).expect(404);
  });

  it('adds an existing user as viewer and enforces read-only access server-side', async () => {
    const joined = await viewer.post('/api/auth/register').set('x-csrf-token', csrfViewer)
      .send({ name: 'Viewer Test', email: viewerEmail, password: 'StrongPass123!' }).expect(201);
    viewerId = joined.body.user.id;
    await owner.post(`/api/workspaces/${workspaceId}/members`).set('x-csrf-token', csrfOwner)
      .send({ email: viewerEmail, role: 'VIEWER' }).expect(201);
    const project = await viewer.get(`/api/projects/${projectId}`).expect(200);
    expect(project.body.role).toBe('VIEWER');
    await viewer.post(`/api/projects/${projectId}/issues`).set('x-csrf-token', csrfViewer)
      .send({ title: 'Viewer should not create' }).expect(403);
    await viewer.post(`/api/projects/${projectId}/tasks`).set('x-csrf-token', csrfViewer)
      .send({ title: 'Viewer should not create' }).expect(403);
    await viewer.post(`/api/workspaces/${workspaceId}/members`).set('x-csrf-token', csrfViewer)
      .send({ email: outsiderEmail, role: 'ADMIN' }).expect(403);
  });

  it('creates, updates and comments on issues; numbers stay unique', async () => {
    const a = await owner.post(`/api/projects/${projectId}/issues`).set('x-csrf-token', csrfOwner)
      .send({ title: 'Investigate session expiry', priority: 'HIGH', assignedToId: viewerId, labels: ['auth'] }).expect(201);
    issueId = a.body.id;
    expect(a.body.number).toBe(1);
    const [b, c] = await Promise.all([owner.post(`/api/projects/${projectId}/issues`).set('x-csrf-token', csrfOwner).send({ title: 'Second issue' }),
      owner.post(`/api/projects/${projectId}/issues`).set('x-csrf-token', csrfOwner).send({ title: 'Third issue' })]);
    expect([b.status, c.status]).toEqual([201, 201]);
    expect(new Set([a.body.number, b.body.number, c.body.number]).size).toBe(3);
    await owner.patch(`/api/issues/${issueId}`).set('x-csrf-token', csrfOwner)
      .send({ status: 'IN_PROGRESS' }).expect(200);
    await owner.post(`/api/issues/${issueId}/comments`).set('x-csrf-token', csrfOwner)
      .send({ content: 'Reproduced locally.' }).expect(201);
    const comments = await viewer.get(`/api/issues/${issueId}/comments`).expect(200);
    expect(comments.body).toHaveLength(1);
    expect(comments.body[0].user.passwordHash).toBeUndefined();
    await viewer.patch(`/api/issues/${issueId}`).set('x-csrf-token', csrfViewer).send({ status: 'CLOSED' }).expect(403);
  });

  it('applies project-specific roles without letting admins escalate ownership', async () => {
    await owner.post(`/api/projects/${projectId}/members`).set('x-csrf-token', csrfOwner)
      .send({ userId: viewerId, role: 'DEVELOPER' }).expect(201);
    await viewer.post(`/api/projects/${projectId}/issues`).set('x-csrf-token', csrfViewer)
      .send({ title: 'Now allowed to contribute' }).expect(201);
    await viewer.post(`/api/projects/${projectId}/members`).set('x-csrf-token', csrfViewer)
      .send({ userId: viewerId, role: 'ADMIN' }).expect(403);
    await owner.patch(`/api/workspaces/${workspaceId}/members/${viewerId}`).set('x-csrf-token', csrfOwner)
      .send({ role: 'ADMIN' }).expect(200);
    await viewer.post(`/api/projects/${projectId}/members`).set('x-csrf-token', csrfViewer)
      .send({ userId: viewerId, role: 'OWNER' }).expect(403);
    await viewer.delete(`/api/workspaces/${workspaceId}/members/${(await db.workspace.findUniqueOrThrow({ where: { id: workspaceId } })).ownerId}`)
      .set('x-csrf-token', csrfViewer).expect(403);
  });

  it('creates and completes tasks; dashboard reflects real data', async () => {
    const task = await owner.post(`/api/projects/${projectId}/tasks`).set('x-csrf-token', csrfOwner)
      .send({ title: 'Write migration tests', assignedToId: viewerId }).expect(201);
    await viewer.patch(`/api/tasks/${task.body.id}`).set('x-csrf-token', csrfViewer).send({ status: 'DONE' }).expect(200);
    const dashboard = await owner.get('/api/dashboard').expect(200);
    expect(dashboard.body.stats.projects).toBeGreaterThanOrEqual(1);
    expect(dashboard.body.stats.completedTasks).toBeGreaterThanOrEqual(1);
    expect(dashboard.body.activity.length).toBeGreaterThan(0);
    const mine = await viewer.get('/api/tasks').expect(200);
    expect(mine.body.some((t: { id: string }) => t.id === task.body.id)).toBe(true);
  });

  it('rotates refresh sessions and revokes access on logout', async () => {
    await owner.post('/api/auth/refresh').set('x-csrf-token', csrfOwner).expect(201);
    await owner.get('/api/auth/me').expect(200);
    await owner.post('/api/auth/logout').set('x-csrf-token', csrfOwner).expect(201);
    await owner.get('/api/auth/me').expect(401);
    await owner.post('/api/auth/login').set('x-csrf-token', csrfOwner)
      .send({ email: ownerEmail, password: 'wrong-password' }).expect(401);
  });

  it('updates the profile and invalidates every session after a password change', async () => {
    await owner.post('/api/auth/login').set('x-csrf-token', csrfOwner)
      .send({ email: ownerEmail, password: 'StrongPass123!' }).expect(201);
    const profile = await owner.patch('/api/users/me').set('x-csrf-token', csrfOwner)
      .send({ name: 'Renamed Owner' }).expect(200);
    expect(profile.body.user.name).toBe('Renamed Owner');
    await owner.patch('/api/users/me/password').set('x-csrf-token', csrfOwner)
      .send({ currentPassword: 'wrong', newPassword: 'DifferentStrong123!' }).expect(401);
    await owner.patch('/api/users/me/password').set('x-csrf-token', csrfOwner)
      .send({ currentPassword: 'StrongPass123!', newPassword: 'DifferentStrong123!' }).expect(200);
    await owner.get('/api/auth/me').expect(401);
    await owner.post('/api/auth/login').set('x-csrf-token', csrfOwner)
      .send({ email: ownerEmail, password: 'StrongPass123!' }).expect(401);
    await owner.post('/api/auth/login').set('x-csrf-token', csrfOwner)
      .send({ email: ownerEmail, password: 'DifferentStrong123!' }).expect(201);
  });
});
