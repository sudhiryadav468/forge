import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AccessService } from '../common/access.service';
import { AuditService } from '../audit/audit.service';
import { publicUserSelect } from '../common/constants';
import { CreateProjectDto, SetProjectMemberDto, UpdateProjectDto, UpdateProjectMemberDto } from './projects.dto';

const projectInclude = { workspace: { select: { id: true, name: true, slug: true } },
  _count: { select: { issues: true, tasks: true, members: true } } } as const;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService, private readonly access: AccessService,
    private readonly audit: AuditService) {}

  private shape(p: { id: string; workspaceId: string; name: string; key: string; description: string | null;
    status: string; repositoryUrl: string | null; createdAt: Date; updatedAt: Date;
    workspace: { id: string; name: string; slug: string }; _count: { issues: number; tasks: number; members: number } },
    role: Role, openIssueCount: number) {
    return { id: p.id, workspaceId: p.workspaceId, workspace: p.workspace, name: p.name,
      key: p.key, description: p.description, status: p.status, repositoryUrl: p.repositoryUrl,
      role, issueCount: p._count.issues, openIssueCount, taskCount: p._count.tasks,
      memberCount: p._count.members, createdAt: p.createdAt, updatedAt: p.updatedAt };
  }

  async list(userId: string, workspaceId?: string) {
    if (workspaceId) await this.access.workspace(workspaceId, userId);
    const memberships = await this.prisma.workspaceMember.findMany({ where: { userId,
      ...(workspaceId ? { workspaceId } : {}) }, select: { workspaceId: true, role: true } });
    if (!memberships.length) return [];
    const projects = await this.prisma.project.findMany({ where: { workspaceId: { in: memberships.map(m => m.workspaceId) } },
      include: projectInclude, orderBy: { updatedAt: 'desc' }, take: 100 });
    if (!projects.length) return [];
    const [overrides, counts] = await Promise.all([
      this.prisma.projectMember.findMany({ where: { userId, projectId: { in: projects.map(p => p.id) } },
        select: { projectId: true, role: true } }),
      this.prisma.issue.groupBy({ by: ['projectId'], where: { projectId: { in: projects.map(p => p.id) },
        status: { in: ['OPEN', 'IN_PROGRESS', 'REVIEW'] } }, _count: { _all: true } }),
    ]);
    const roles = new Map(memberships.map(m => [m.workspaceId, m.role]));
    const projectRoles = new Map(overrides.map(m => [m.projectId, m.role]));
    const openCounts = new Map(counts.map(c => [c.projectId, c._count._all]));
    return projects.map(p => {
      const workspaceRole = roles.get(p.workspaceId)!;
      const role = ['OWNER', 'ADMIN'].includes(workspaceRole) ? workspaceRole : (projectRoles.get(p.id) || workspaceRole);
      return this.shape(p, role, openCounts.get(p.id) || 0);
    });
  }

  async get(userId: string, projectId: string) {
    const { role } = await this.access.project(projectId, userId);
    const [p, openCount] = await Promise.all([
      this.prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: projectInclude }),
      this.prisma.issue.count({ where: { projectId, status: { in: ['OPEN', 'IN_PROGRESS', 'REVIEW'] } } }),
    ]);
    return this.shape(p, role, openCount);
  }

  async create(userId: string, dto: CreateProjectDto) {
    await this.access.workspace(dto.workspaceId, userId, ['OWNER', 'ADMIN']);
    const key = dto.key || dto.name.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^[^A-Z]*/, '').slice(0, 8);
    if (!/^[A-Z][A-Z0-9]{1,11}$/.test(key)) throw new BadRequestException('Provide a project key of 2–12 letters/numbers');
    try {
      const p = await this.prisma.project.create({ data: { workspaceId: dto.workspaceId, name: dto.name,
        key, description: dto.description || null } });
      await this.audit.record({ workspaceId: dto.workspaceId, projectId: p.id, actorId: userId,
        action: 'project.created', entityType: 'project', entityId: p.id, label: `created project ${p.name}` });
      return this.get(userId, p.id);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('That project key is already used in this workspace');
      throw error;
    }
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const { project } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN']);
    if (!Object.keys(dto).length) throw new BadRequestException('No changes supplied');
    const p = await this.prisma.project.update({ where: { id: projectId }, data: dto });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'project.updated', entityType: 'project', entityId: projectId, label: `updated project ${p.name}` });
    return this.get(userId, projectId);
  }

  async remove(userId: string, projectId: string) {
    const { project, workspaceRole } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN']);
    if (!['OWNER', 'ADMIN'].includes(workspaceRole)) throw new ForbiddenException('Only workspace managers can delete projects');
    await this.audit.record({ workspaceId: project.workspaceId, actorId: userId,
      action: 'project.deleted', entityType: 'project', entityId: projectId, label: `deleted project ${project.name}` });
    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }

  async members(userId: string, projectId: string) {
    const { project } = await this.access.project(projectId, userId);
    const [members, overrides] = await Promise.all([
      this.prisma.workspaceMember.findMany({ where: { workspaceId: project.workspaceId },
        include: { user: { select: publicUserSelect } }, orderBy: { createdAt: 'asc' } }),
      this.prisma.projectMember.findMany({ where: { projectId } }),
    ]);
    const byUser = new Map(overrides.map(p => [p.userId, p]));
    return members.map(m => ({ id: byUser.get(m.userId)?.id || m.id, user: m.user,
      role: ['OWNER', 'ADMIN'].includes(m.role) ? m.role : (byUser.get(m.userId)?.role || m.role),
      inherited: !byUser.has(m.userId) || ['OWNER', 'ADMIN'].includes(m.role), createdAt: m.createdAt }));
  }

  async setMember(userId: string, projectId: string, dto: SetProjectMemberDto) {
    const { project, workspaceRole } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN']);
    this.access.assertCanGrant(workspaceRole, dto.role);
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: dto.userId } },
      include: { user: { select: publicUserSelect } } });
    if (!member) throw new NotFoundException('Add this user to the workspace first');
    if (['OWNER', 'ADMIN'].includes(member.role)) throw new ForbiddenException('Cannot override a workspace manager');
    await this.prisma.projectMember.upsert({ where: { projectId_userId: { projectId, userId: dto.userId } },
      create: { projectId, userId: dto.userId, role: dto.role }, update: { role: dto.role } });
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'project.member.updated', entityType: 'member', entityId: dto.userId,
      label: `set ${member.user.name}'s project role to ${dto.role.toLowerCase()}` });
    return this.members(userId, projectId);
  }

  async updateMember(userId: string, projectId: string, targetId: string, dto: UpdateProjectMemberDto) {
    return this.setMember(userId, projectId, { userId: targetId, role: dto.role });
  }

  async removeMember(userId: string, projectId: string, targetId: string) {
    const { project } = await this.access.project(projectId, userId, ['OWNER', 'ADMIN']);
    const deleted = await this.prisma.projectMember.deleteMany({ where: { projectId, userId: targetId } });
    if (!deleted.count) throw new NotFoundException('No project-specific role to remove');
    await this.audit.record({ workspaceId: project.workspaceId, projectId, actorId: userId,
      action: 'project.member.reset', entityType: 'member', entityId: targetId, label: 'reset a project role to the workspace role' });
    return { success: true };
  }

  async activity(userId: string, projectId: string) {
    await this.access.project(projectId, userId);
    return this.audit.projectActivity(projectId);
  }
}
