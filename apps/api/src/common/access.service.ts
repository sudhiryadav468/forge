import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** All workspace and project reads/writes must pass through this service. */
@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async workspace(workspaceId: string, userId: string, allowed?: Role[]) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundException('Workspace not found');
    const member = await this.prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
    if (!member) throw new NotFoundException('Workspace not found');
    if (allowed && !allowed.includes(member.role)) throw new ForbiddenException('Insufficient workspace permissions');
    return { workspace, role: member.role };
  }

  async project(projectId: string, userId: string, allowed?: Role[]) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    const workspaceMember = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!workspaceMember) throw new NotFoundException('Project not found');
    const projectMember = await this.prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
    // Workspace owners/admins always retain management rights. Other roles may be overridden per project.
    const role = ['OWNER', 'ADMIN'].includes(workspaceMember.role) ? workspaceMember.role :
      (projectMember?.role || workspaceMember.role);
    if (allowed && !allowed.includes(role)) throw new ForbiddenException('Insufficient project permissions');
    return { project, role, workspaceRole: workspaceMember.role };
  }

  async requireAssignable(workspaceId: string, targetUserId: string | null | undefined) {
    if (!targetUserId) return;
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });
    if (!member) throw new BadRequestException('Assignee must be a workspace member');
  }

  /** Project managers can never promote someone to workspace/project ADMIN unless they own the workspace. */
  assertCanGrant(actorWorkspaceRole: Role, role: Role) {
    if (role === 'OWNER') throw new ForbiddenException('Workspace ownership cannot be transferred here');
    if (role === 'ADMIN' && actorWorkspaceRole !== 'OWNER')
      throw new ForbiddenException('Only the workspace owner may grant admin access');
  }
}
