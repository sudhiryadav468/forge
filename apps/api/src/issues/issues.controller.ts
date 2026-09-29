import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/request-user';
import { IssuesService } from './issues.service';
import { CreateCommentDto, CreateIssueDto, IssueFilterDto, UpdateIssueDto } from './issues.dto';

@ApiTags('issues') @ApiCookieAuth('nf_access')
@Controller()
export class IssuesController {
  constructor(private readonly service: IssuesService) {}
  @Get('issues') all(@CurrentUser() user: RequestUser) { return this.service.all(user.id); }
  @Get('projects/:projectId/issues') list(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string,
    @Query() filter: IssueFilterDto) { return this.service.list(user.id, projectId, filter); }
  @Post('projects/:projectId/issues') create(@CurrentUser() user: RequestUser, @Param('projectId') projectId: string,
    @Body() dto: CreateIssueDto) { return this.service.create(user.id, projectId, dto); }
  @Get('issues/:id') get(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.get(user.id, id); }
  @Patch('issues/:id') update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateIssueDto) {
    return this.service.update(user.id, id, dto);
  }
  @Delete('issues/:id') remove(@CurrentUser() user: RequestUser, @Param('id') id: string) { return this.service.remove(user.id, id); }
  @Get('issues/:id/comments') comments(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.service.comments(user.id, id);
  }
  @Post('issues/:id/comments') addComment(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.service.addComment(user.id, id, dto);
  }
}
