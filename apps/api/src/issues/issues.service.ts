import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { AuditService } from '../audit/audit.service';
import { publicUserSelect } from '../common/constants';
import { CreateCommentDto, CreateIssueDto, IssueFilterDto, UpdateIssueDto } from './issues.dto';

export const issueInclude = { createdBy: { select: publicUserSelect }, assignedTo: { select: publicUserSelect },
  _count: { select: { comments: true } } } as const;

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService,
    private readonly audit: AuditService) {}

  async all(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({ where: { userId }, select: { workspaceId: true } });
    return this.prisma.issue.findMany({ where: { project: { workspaceId: { in: memberships.map(m => m.workspaceId) } } },
      include: { ...issueInclude, project: { select: { id: true, key: true, name: true } } },
      orderBy: { updatedAt: 'desc' }, take: 200 });
  }

  async list(userId: string, projectId: string, filter: IssueFilterDto) {
    await this.access.project(projectId, userId);
    return this.prisma.issue.findMany({ where: { projectId,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.priority ? { priority: filter.priority } : {}),
      ...(filter.search ? { OR: [{ title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } }] } : {}),
    }, include: issueInclude, orderBy: { updatedAt: 'desc' }, take: 100 });
  }

  async create(userId: string, projectId: string, dto: CreateIssueDto) {
    const { project } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN', 'DEVELOPER']);
    await this.access.requireAssignable(project.workspaceId, dto.assignedToId);
    const issue = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({ where: { id: projectId },
        data: { nextIssueNumber: { increment: 1 } }, select: { nextIssueNumber: true } });
      return tx.issue.create({ data: { projectId, number: updated.nextIssueNumber - 1,
        title: dto.title, description: dto.description || null, priority: dto.priority || 'MEDIUM',
        assignedToId: dto.assignedToId || null, createdById: userId,
        labels: [...new Set((dto.labels || []).map(s => s.trim()).filter(Boolean))] }, include: issueInclude });
    });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'issue.created', entityType: 'issue', entityId: issue.id,
      label: `created issue ${project.key}-${issue.number}: ${issue.title}` });
    return issue;
  }

  private async accessible(userId: string, issueId: string, editable = false) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId }, select: { projectId: true } });
    if (!issue) throw new NotFoundException('Issue not found');
    const context = await this.access.project(issue.projectId, userId,
      editable ? ['OWNER', 'ADMIN', 'DEVELOPER'] : undefined);
    return { projectId: issue.projectId, ...context };
  }

  async get(userId: string, issueId: string) {
    await this.accessible(userId, issueId);
    return this.prisma.issue.findUniqueOrThrow({ where: { id: issueId }, include: issueInclude });
  }

  async update(userId: string, issueId: string, dto: UpdateIssueDto) {
    const { projectId, project } = await this.accessible(userId, issueId, true);
    if (!Object.keys(dto).length) throw new BadRequestException('No changes supplied');
    if (dto.assignedToId !== undefined) await this.access.requireAssignable(project.workspaceId, dto.assignedToId);
    const issue = await this.prisma.issue.update({ where: { id: issueId }, data: {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.assignedToId !== undefined ? { assignedToId: dto.assignedToId } : {}),
      ...(dto.labels !== undefined ? { labels: [...new Set(dto.labels.map(s => s.trim()).filter(Boolean))] } : {}),
    }, include: issueInclude });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'issue.updated', entityType: 'issue', entityId: issueId,
      label: `updated issue ${project.key}-${issue.number}${dto.status ? ` to ${dto.status.toLowerCase().replace('_', ' ')}` : ''}` });
    return issue;
  }

  async remove(userId: string, issueId: string) {
    const { projectId, project } = await this.accessible(userId, issueId);
    await this.access.project(projectId, userId, ['OWNER', 'ADMIN']);
    const issue = await this.prisma.issue.delete({ where: { id: issueId } });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'issue.deleted', entityType: 'issue', entityId: issueId, label: `deleted issue ${project.key}-${issue.number}` });
    return { success: true };
  }

  async comments(userId: string, issueId: string) {
    await this.accessible(userId, issueId);
    return this.prisma.comment.findMany({ where: { issueId }, orderBy: { createdAt: 'asc' }, take: 200,
      include: { user: { select: publicUserSelect } } });
  }

  async addComment(userId: string, issueId: string, dto: CreateCommentDto) {
    const { projectId, project } = await this.accessible(userId, issueId, true);
    const comment = await this.prisma.comment.create({ data: { issueId, userId, content: dto.content },
      include: { user: { select: publicUserSelect } } });
    const issue = await this.prisma.issue.findUniqueOrThrow({ where: { id: issueId }, select: { number: true } });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'comment.created', entityType: 'issue', entityId: issueId,
      label: `commented on ${project.key}-${issue.number}` });
    return comment;
  }
}
