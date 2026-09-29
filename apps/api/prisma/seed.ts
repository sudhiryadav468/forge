/** Optional local-only sample data. Never run in production. */
import 'dotenv/config';
import { PrismaClient, IssuePriority, IssueStatus, TaskStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import argon2 from 'argon2';

if (process.env.NODE_ENV === 'production' || process.env.DEMO_MODE !== 'true') {
  throw new Error('Seeding demo data requires DEMO_MODE=true outside production.');
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const names = [
  ['Alex Morgan', 'demo@nexusforge.dev'],
  ['Maya Chen', 'maya@nexusforge.dev'],
  ['Jordan Lee', 'jordan@nexusforge.dev'],
  ['Sam Rivera', 'sam@nexusforge.dev'],
] as const;

async function main() {
  const passwordHash = await argon2.hash('Demo123456!', { type: argon2.argon2id });
  const users = await Promise.all(names.map(async ([name, email]) => prisma.user.upsert({ where: { email },
    create: { name, email, passwordHash }, update: {} })));
  const [alex, maya, jordan, sam] = users;
  if (await prisma.workspace.findUnique({ where: { slug: 'northstar-labs-demo' } })) {
    console.log('Demo workspace already exists; nothing to seed.'); return;
  }
  const workspace = await prisma.workspace.create({ data: { name: 'Northstar Labs', slug: 'northstar-labs-demo', ownerId: alex.id } });
  await prisma.workspaceMember.createMany({ data: [
    { workspaceId: workspace.id, userId: alex.id, role: 'OWNER' },
    { workspaceId: workspace.id, userId: maya.id, role: 'ADMIN' },
    { workspaceId: workspace.id, userId: jordan.id, role: 'DEVELOPER' },
    { workspaceId: workspace.id, userId: sam.id, role: 'VIEWER' },
  ] });
  const commerce = await prisma.project.create({ data: { workspaceId: workspace.id, name: 'Commerce API',
    key: 'COM', description: 'The backend powering checkout, payments, and customer accounts.' } });
  const atlas = await prisma.project.create({ data: { workspaceId: workspace.id, name: 'Atlas Dashboard',
    key: 'ATL', description: 'A clear view of product analytics and operational insights.' } });
  const infra = await prisma.project.create({ data: { workspaceId: workspace.id, name: 'Cloud Infrastructure',
    key: 'CLD', description: 'Shared environments, configuration, and release readiness.' } });
  await prisma.projectMember.create({ data: { projectId: commerce.id, userId: jordan.id, role: 'DEVELOPER' } });

  const samples: Array<[typeof commerce, string, string, IssueStatus, IssuePriority, string, string[]]> = [
    [commerce, 'Refresh token expires before the session does', 'Customers are unexpectedly signed out during checkout. Investigate token rotation and cookie expiry.', 'IN_PROGRESS', 'HIGH', jordan.id, ['auth', 'bug']],
    [commerce, 'Add idempotency keys to payment requests', 'Duplicate charges can occur on client retries. Introduce request-level idempotency.', 'OPEN', 'CRITICAL', maya.id, ['payments', 'backend']],
    [commerce, 'Improve validation errors on checkout', 'Return field-level errors so the storefront can show actionable guidance.', 'REVIEW', 'MEDIUM', jordan.id, ['api', 'ux']],
    [commerce, 'Document the authentication flow', 'Capture the login, refresh, and logout lifecycle for new engineers.', 'OPEN', 'LOW', alex.id, ['docs']],
    [commerce, 'Fix intermittent cart total mismatch', 'Tax calculations differ between preview and final checkout in some regions.', 'OPEN', 'HIGH', jordan.id, ['bug', 'checkout']],
    [commerce, 'Add pagination to order history', 'Order history currently returns all records for long-standing customers.', 'RESOLVED', 'MEDIUM', jordan.id, ['performance']],
    [atlas, 'Create weekly conversion overview', 'Add a concise chart for new customer conversion across channels.', 'IN_PROGRESS', 'MEDIUM', maya.id, ['analytics', 'frontend']],
    [atlas, 'Fix date range picker on mobile', 'The calendar overflows the viewport below 375px.', 'OPEN', 'HIGH', jordan.id, ['bug', 'mobile']],
    [atlas, 'Add keyboard shortcuts to reports', 'Make frequently used report actions accessible from the keyboard.', 'REVIEW', 'LOW', maya.id, ['accessibility']],
    [atlas, 'Align empty states with design system', 'Unify illustrations and copy across the reporting views.', 'CLOSED', 'LOW', sam.id, ['design']],
    [infra, 'Review staging environment variables', 'Audit the staging configuration before the next release.', 'OPEN', 'HIGH', alex.id, ['security']],
    [infra, 'Set up database backup schedule', 'Define backup frequency and recovery objectives for PostgreSQL.', 'OPEN', 'CRITICAL', maya.id, ['database']],
    [infra, 'Reduce image build time', 'Review Docker layer ordering and dependency caching.', 'IN_PROGRESS', 'MEDIUM', jordan.id, ['devops']],
  ];
  const counts = new Map<string, number>();
  for (const [project, title, description, status, priority, assignedToId, labels] of samples) {
    const number = (counts.get(project.id) || 0) + 1; counts.set(project.id, number);
    await prisma.issue.create({ data: { projectId: project.id, number, title, description, status, priority,
      labels, assignedToId, createdById: alex.id } });
  }
  for (const [id, number] of counts) await prisma.project.update({ where: { id }, data: { nextIssueNumber: number + 1 } });
  const tasks: Array<[typeof commerce, string, TaskStatus, string, number]> = [
    [commerce, 'Review auth middleware edge cases', 'TODO', jordan.id, 2],
    [commerce, 'Write checkout API contract', 'IN_PROGRESS', alex.id, 4],
    [commerce, 'Update payment integration tests', 'TODO', maya.id, 7],
    [commerce, 'Draft onboarding checklist', 'DONE', alex.id, -2],
    [atlas, 'Polish analytics card states', 'IN_PROGRESS', maya.id, 3],
    [atlas, 'Verify responsive report layout', 'TODO', jordan.id, 5],
    [atlas, 'Add chart accessibility labels', 'DONE', jordan.id, -1],
    [infra, 'Rotate staging credentials', 'TODO', alex.id, 1],
    [infra, 'Audit dependency updates', 'TODO', jordan.id, 6],
  ];
  for (const [project, title, status, assignedToId, offset] of tasks) {
    const due = new Date(); due.setUTCDate(due.getUTCDate() + offset); due.setUTCHours(0, 0, 0, 0);
    await prisma.task.create({ data: { projectId: project.id, title, status, assignedToId, createdById: alex.id, dueDate: due } });
  }
  const first = await prisma.issue.findUnique({ where: { projectId_number: { projectId: commerce.id, number: 1 } } });
  if (first) await prisma.comment.create({ data: { issueId: first.id, userId: maya.id,
    content: 'I can reproduce this when the access token expires during an active checkout. Let’s trace the refresh path.' } });
  const events = [
    [infra, 'project.created', 'created project Cloud Infrastructure'],
    [atlas, 'project.created', 'created project Atlas Dashboard'],
    [commerce, 'project.created', 'created project Commerce API'],
    [commerce, 'issue.created', 'created issue COM-2: Add idempotency keys to payment requests'],
    [atlas, 'issue.updated', 'moved ATL-3 to review'],
    [commerce, 'comment.created', 'commented on COM-1'],
    [infra, 'task.created', 'created task Rotate staging credentials'],
  ] as const;
  for (let index = 0; index < events.length; index++) {
    const [project, action, label] = events[index];
    await prisma.auditLog.create({ data: { workspaceId: workspace.id, projectId: project.id,
      actorId: index % 2 ? maya.id : alex.id, action, entityType: action.split('.')[0], entityId: project.id,
      label, createdAt: new Date(Date.now() - (events.length - index) * 12 * 60_000) } });
  }
  console.log('Seeded Northstar Labs, 3 projects, 13 issues, 9 tasks and 4 members.');
  console.log('Demo login: demo@nexusforge.dev / Demo123456! (local development only)');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
