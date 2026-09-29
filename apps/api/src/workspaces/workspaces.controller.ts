import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/request-user';
import { WorkspacesService } from './workspaces.service';
import { AddWorkspaceMemberDto, CreateWorkspaceDto, UpdateWorkspaceDto, UpdateWorkspaceMemberDto } from './workspaces.dto';

@ApiTags('workspaces') @ApiCookieAuth('nf_access')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly service: WorkspacesService) {}
  @Get() list(@CurrentUser() user: RequestUser) { return this.service.list(user.id); }
  @Post() create(@CurrentUser() user: RequestUser, @Body() dto: CreateWorkspaceDto) { return this.service.create(user.id, dto); }
  @Get(':id') get(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.get(user.id, id); }
  @Patch(':id') update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.service.update(user.id, id, dto);
  }
  @Get(':id/members') members(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.members(user.id, id); }
  @Post(':id/members') addMember(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: AddWorkspaceMemberDto) {
    return this.service.addMember(user.id, id, dto);
  }
  @Patch(':id/members/:memberId') updateMember(@CurrentUser() user: RequestUser, @Param('id') id: string,
    @Param('memberId') memberId: string, @Body() dto: UpdateWorkspaceMemberDto) {
    return this.service.updateMember(user.id, id, memberId, dto);
  }
  @Delete(':id/members/:memberId') removeMember(@CurrentUser() user: RequestUser, @Param('id') id: string,
    @Param('memberId') memberId: string) { return this.service.removeMember(user.id, id, memberId); }
  @Get(':id/activity') activity(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.activity(user.id, id); }
}
