import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { issueInclude } from '../issues/issues.service';
import { taskInclude } from '../tasks/tasks.service';
import { publicUserSelect } from '../common/constants';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly projects: ProjectsService) {}
  async overview(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({ where: { userId }, select: { workspaceId: true } });
    const workspaceIds = memberships.map(m => m.workspaceId);
    const [projects, allProjectIds] = await Promise.all([
      this.projects.list(userId),
      this.prisma.project.findMany({ where: { workspaceId: { in: workspaceIds } }, select: { id: true } }),
    ]);
    const projectIds = allProjectIds.map(p => p.id);
    const [issueGroups, completedTasks, recentIssues, myTasks, activity] = await Promise.all([
      this.prisma.issue.groupBy({ by: ['status'], where: { projectId: { in: projectIds } }, _count: { _all: true } }),
      this.prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
      this.prisma.issue.findMany({ where: { projectId: { in: projectIds } }, include: issueInclude,
        orderBy: { updatedAt: 'desc' }, take: 5 }),
      this.prisma.task.findMany({ where: { projectId: { in: projectIds }, assignedToId: userId,
        status: { not: 'DONE' } }, include: taskInclude, orderBy: { dueDate: 'asc' }, take: 5 }),
      this.prisma.auditLog.findMany({ where: { workspaceId: { in: workspaceIds } },
        orderBy: { createdAt: 'desc' }, take: 7, include: { actor: { select: publicUserSelect } } }),
    ]);
    const issueBreakdown = { OPEN: 0, IN_PROGRESS: 0, REVIEW: 0, RESOLVED: 0, CLOSED: 0 };
    for (const group of issueGroups) issueBreakdown[group.status] = group._count._all;
    return { stats: { projects: allProjectIds.length,
      openIssues: issueBreakdown.OPEN + issueBreakdown.IN_PROGRESS + issueBreakdown.REVIEW,
      inProgressIssues: issueBreakdown.IN_PROGRESS, completedTasks, workspaces: workspaceIds.length },
      projects: projects.slice(0, 4), recentIssues, myTasks, activity, issueBreakdown };
  }
}
