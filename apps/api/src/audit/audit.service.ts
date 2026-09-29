import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../common/constants';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(data: { workspaceId: string; projectId?: string; actorId: string; action: string;
    entityType: string; entityId: string; label: string }) {
    return this.prisma.auditLog.create({ data: { ...data, label: data.label.slice(0, 300) } });
  }
  async workspaceActivity(workspaceId: string, take = 15) {
    return this.prisma.auditLog.findMany({ where: { workspaceId }, orderBy: { createdAt: 'desc' },
      take, include: { actor: { select: publicUserSelect } } });
  }
  async projectActivity(projectId: string, take = 15) {
    return this.prisma.auditLog.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' },
      take, include: { actor: { select: publicUserSelect } } });
  }
}
