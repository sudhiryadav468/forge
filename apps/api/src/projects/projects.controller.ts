import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/request-user';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, SetProjectMemberDto, UpdateProjectDto, UpdateProjectMemberDto } from './projects.dto';

@ApiTags('projects') @ApiCookieAuth('nf_access')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}
  @Get() list(@CurrentUser() user: RequestUser, @Query('workspaceId') workspaceId?: string) {
    return this.service.list(user.id, workspaceId);
  }
  @Post() create(@CurrentUser() user: RequestUser, @Body() dto: CreateProjectDto) {
    return this.service.create(user.id, dto);
  }
  @Get(':id') get(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.get(user.id, id); }
  @Patch(':id') update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.service.update(user.id, id, dto);
  }
  @Delete(':id') remove(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.remove(user.id, id); }
  @Get(':id/members') members(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.members(user.id, id); }
  @Post(':id/members') setMember(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: SetProjectMemberDto) {
    return this.service.setMember(user.id, id, dto);
  }
  @Patch(':id/members/:memberId') updateMember(@CurrentUser() user: RequestUser, @Param('id') id: string,
    @Param('memberId') memberId: string, @Body() dto: UpdateProjectMemberDto) {
    return this.service.updateMember(user.id, id, memberId, dto);
  }
  @Delete(':id/members/:memberId') removeMember(@CurrentUser() user: RequestUser, @Param('id') id: string,
    @Param('memberId') memberId: string) { return this.service.removeMember(user.id, id, memberId); }
  @Get(':id/activity') activity(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.activity(user.id, id); }
}
