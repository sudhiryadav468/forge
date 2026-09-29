import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/request-user';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@ApiTags('tasks') @ApiCookieAuth('nf_access')
@Controller()
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get('tasks') mine(@CurrentUser() user: RequestUser) { return this.service.mine(user.id); }
  @Get('projects/:projectId/tasks') list(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string) {
    return this.service.list(user.id, projectId);
  }
  @Post('projects/:projectId/tasks') create(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto) { return this.service.create(user.id, projectId, dto); }
  @Patch('tasks/:id') update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(user.id, id, dto);
  }
  @Delete('tasks/:id') remove(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.remove(user.id, id); }
}
