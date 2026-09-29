import { Body, Controller, Patch, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, RequestUser } from '../common/request-user';
import { UsersService } from './users.service';
import { ChangePasswordDto, UpdateProfileDto } from './users.dto';

@ApiTags('users') @ApiCookieAuth('nf_access')
@Controller('users/me')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Patch() update(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.service.update(user.id, dto);
  }
  @Patch('password') changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response) { return this.service.changePassword(user.id, dto, res); }
}
