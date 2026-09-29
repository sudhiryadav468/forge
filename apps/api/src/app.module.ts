import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AccessGuard } from './auth/access.guard';
import { CsrfGuard } from './auth/csrf.guard';
import { AccessService } from './common/access.service';
import { AuditService } from './audit/audit.service';
import { WorkspacesController } from './workspaces/workspaces.controller';
import { WorkspacesService } from './workspaces/workspaces.service';
import { ProjectsController } from './projects/projects.controller';
import { ProjectsService } from './projects/projects.service';
import { IssuesController } from './issues/issues.controller';
import { IssuesService } from './issues/issues.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { HealthController } from './common/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({}),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 90 }])],
  controllers: [AuthController, WorkspacesController, ProjectsController, IssuesController,
    TasksController, DashboardController, HealthController, UsersController],
  providers: [PrismaService, AuthService, AccessService, AuditService, WorkspacesService,
    ProjectsService, IssuesService, TasksService, DashboardService, UsersService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_GUARD, useClass: AccessGuard }],
})
export class AppModule {}
