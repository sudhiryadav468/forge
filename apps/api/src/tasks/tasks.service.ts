import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { AuditService } from '../audit/audit.service';
import { publicUserSelect } from '../common/constants';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

export const taskInclude = { assignedTo: { select: publicUserSelect }, createdBy: { select: publicUserSelect } } as const;
function parseDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const parsed = new Date(`${input}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== input)
    throw new BadRequestException('Invalid due date');
  return parsed;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService,
    private readonly audit: AuditService) {}

  async mine(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({ where: { userId }, select: { workspaceId: true } });
    return this.prisma.task.findMany({ where: { assignedToId: userId,
      project: { workspaceId: { in: memberships.map(m => m.workspaceId) } } },
      include: { ...taskInclude, project: { select: { id: true, key: true, name: true } } },
      orderBy: { createdAt: 'desc' }, take: 200 });
  }

  async list(userId: string, projectId: string) {
    await this.access.project(projectId, userId);
    return this.prisma.task.findMany({ where: { projectId }, include: taskInclude,
      orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    const { project } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN', 'DEVELOPER']);
    await this.access.requireAssignable(project.workspaceId, dto.assignedToId);
    const task = await this.prisma.task.create({ data: { projectId, title: dto.title,
      description: dto.description || null, assignedToId: dto.assignedToId || null, createdById: userId,
      dueDate: parseDate(dto.dueDate) }, include: taskInclude });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'task.created', entityType: 'task', entityId: task.id, label: `created task ${task.title}` });
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true } });
    if (!existing) throw new NotFoundException('Task not found');
    const { project } = await this.access.project(existing.projectId, userId, ['OWNER', 'ADMIN', 'DEVELOPER']);
    if (!Object.keys(dto).length) throw new BadRequestException('No changes supplied');
    if (dto.assignedToId !== undefined) await this.access.requireAssignable(project.workspaceId, dto.assignedToId);
    const task = await this.prisma.task.update({ where: { id: taskId }, data: {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.assignedToId !== undefined ? { assignedToId: dto.assignedToId } : {}),
      ...(dto.dueDate !== undefined ? { dueDate: parseDate(dto.dueDate) } : {}),
    }, include: taskInclude });
    await this.audit.record({ workspaceId: project.workspaceId, projectId: existing.projectId, actorId: userId,
      action: 'task.updated', entityType: 'task', entityId: taskId, label: `updated task ${task.title}` });
    return task;
  }

  async remove(userId: string, taskId: string) {
    const existing = await this.prisma.task.findUnique({ where: { id: taskId }, select: { projectId: true, title: true } });
    if (!existing) throw new NotFoundException('Task not found');
    const { project } = await this.access.project(existing.projectId, userId, ['OWNER', 'ADMIN']);
    await this.prisma.task.delete({ where: { id: taskId } });
    await this.audit.record({ workspaceId: project.workspaceId, projectId: existing.projectId, actorId: userId,
      action: 'task.deleted', entityType: 'task', entityId: taskId, label: `deleted task ${existing.title}` });
    return { success: true };
  }
}
