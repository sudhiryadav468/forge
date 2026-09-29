import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { AuditService } from '../audit/audit.service';
import { publicUserSelect } from '../common/constants';
import { AddWorkspaceMemberDto, CreateWorkspaceDto, UpdateWorkspaceDto, UpdateWorkspaceMemberDto } from './workspaces.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService,
    private readonly audit: AuditService) {}

  private shape(workspace: { id: string; name: string; slug: string; ownerId: string; createdAt: Date;
    updatedAt: Date; _count: { projects: number; members: number } }, role: Role) {
    return { id: workspace.id, name: workspace.name, slug: workspace.slug,
      ownerId: workspace.ownerId, createdAt: workspace.createdAt, updatedAt: workspace.updatedAt,
      role, projectCount: workspace._count.projects, memberCount: workspace._count.members };
  }

  async list(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({ where: { userId },
      include: { workspace: { include: { _count: { select: { projects: true, members: true } } } } },
      orderBy: { workspace: { updatedAt: 'desc' } } });
    return memberships.map(({ workspace, role }) => this.shape(workspace, role));
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = `${dto.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'workspace'}-${randomBytes(3).toString('hex')}`;
    const workspace = await this.prisma.$transaction(async (tx) => {
      const item = await tx.workspace.create({ data: { name: dto.name, slug, ownerId: userId } });
      await tx.workspaceMember.create({ data: { workspaceId: item.id, userId, role: 'OWNER' } });
      return item;
    });
    await this.audit.record({ workspaceId: workspace.id, actorId: userId, action: 'workspace.created',
      entityType: 'workspace', entityId: workspace.id, label: `created workspace ${workspace.name}` });
    return this.get(userId, workspace.id);
  }

  async get(userId: string, workspaceId: string) {
    const { role } = await this.access.workspace(workspaceId, userId);
    const workspace = await this.prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId },
      include: { _count: { select: { projects: true, members: true } } } });
    return this.shape(workspace, role);
  }

  async update(userId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    await this.access.workspace(workspaceId, userId, ['OWNER', 'ADMIN']);
    if (!dto.name) throw new BadRequestException('Workspace name is required');
    await this.prisma.workspace.update({ where: { id: workspaceId }, data: { name: dto.name } });
    await this.audit.record({ workspaceId, actorId: userId, action: 'workspace.updated',
      entityType: 'workspace', entityId: workspaceId, label: `renamed workspace to ${dto.name}` });
    return this.get(userId, workspaceId);
  }

  async members(userId: string, workspaceId: string) {
    await this.access.workspace(workspaceId, userId);
    return this.prisma.workspaceMember.findMany({ where: { workspaceId },
      include: { user: { select: publicUserSelect } }, orderBy: { createdAt: 'asc' } });
  }

  async addMember(userId: string, workspaceId: string, dto: AddWorkspaceMemberDto) {
    const { role } = await this.access.workspace(workspaceId, userId, ['OWNER', 'ADMIN']);
    this.access.assertCanGrant(role, dto.role);
    const invited = await this.prisma.user.findUnique({ where: { email: dto.email }, select: publicUserSelect });
    if (!invited) throw new NotFoundException('No registered user with that email. Ask them to sign up first.');
    const existing = await this.prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId: invited.id } } });
    if (existing) throw new ConflictException('User is already in this workspace');
    try {
      const member = await this.prisma.workspaceMember.create({ data: { workspaceId, userId: invited.id, role: dto.role },
        include: { user: { select: publicUserSelect } } });
      await this.audit.record({ workspaceId, actorId: userId, action: 'member.added',
        entityType: 'member', entityId: invited.id, label: `added ${invited.name} as ${dto.role.toLowerCase()}` });
      return member;
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('User is already in this workspace');
      throw error;
    }
  }

  async updateMember(userId: string, workspaceId: string, targetId: string, dto: UpdateWorkspaceMemberDto) {
    const { workspace, role } = await this.access.workspace(workspaceId, userId, ['OWNER', 'ADMIN']);
    const member = await this.prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId: targetId } } });
    if (!member) throw new NotFoundException('Member not found');
    if (targetId === workspace.ownerId || member.role === 'OWNER') throw new ForbiddenException('Cannot change workspace owner');
    if (role === 'ADMIN' && member.role === 'ADMIN') throw new ForbiddenException('Only the owner can change an admin role');
    this.access.assertCanGrant(role, dto.role);
    const updated = await this.prisma.workspaceMember.update({ where: { id: member.id }, data: { role: dto.role },
      include: { user: { select: publicUserSelect } } });
    await this.audit.record({ workspaceId, actorId: userId, action: 'member.updated',
      entityType: 'member', entityId: targetId, label: `changed ${updated.user.name}'s role to ${dto.role.toLowerCase()}` });
    return updated;
  }

  async removeMember(userId: string, workspaceId: string, targetId: string) {
    const { workspace, role } = await this.access.workspace(workspaceId, userId, ['OWNER', 'ADMIN']);
    const member = await this.prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId: targetId } },
      include: { user: { select: publicUserSelect } } });
    if (!member) throw new NotFoundException('Member not found');
    if (targetId === workspace.ownerId) throw new ForbiddenException('Cannot remove workspace owner');
    if (role === 'ADMIN' && member.role === 'ADMIN') throw new ForbiddenException('Only the owner can remove an admin');
    await this.prisma.$transaction(async (tx) => {
      const projects = await tx.project.findMany({ where: { workspaceId }, select: { id: true } });
      await tx.projectMember.deleteMany({ where: { userId: targetId, projectId: { in: projects.map(p => p.id) } } });
      await tx.workspaceMember.delete({ where: { id: member.id } });
    });
    await this.audit.record({ workspaceId, actorId: userId, action: 'member.removed',
      entityType: 'member', entityId: targetId, label: `removed ${member.user.name} from the workspace` });
    return { success: true };
  }

  async activity(userId: string, workspaceId: string) {
    await this.access.workspace(workspaceId, userId);
    return this.audit.workspaceActivity(workspaceId);
  }
}
