import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequestUser } from '../common/request-user';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard') @ApiCookieAuth('nf_access')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get() overview(@CurrentUser() user: RequestUser) { return this.service.overview(user.id); }
}
