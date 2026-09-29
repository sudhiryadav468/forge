import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser, RequestUser } from '../common/request-user';
import { Public } from '../common/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @Get('config') config() { return { demoAvailable: process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production' }; }
  @Public() @Get('csrf') csrf(@Res({ passthrough: true }) res: Response) { return this.auth.csrf(res); }
  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register') register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.register(dto, res);
  }
  @Public() @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login') login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.auth.login(dto, res);
  }
  @Public() @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('demo') demo(@Res({ passthrough: true }) res: Response) { return this.auth.demo(res); }
  @Public() @Post('refresh') refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.refresh(req.cookies?.nf_refresh, res);
  }
  @Public() @Post('logout') logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.auth.logout(req.cookies?.nf_refresh, res);
  }
  @ApiCookieAuth('nf_access') @Get('me') me(@CurrentUser() user: RequestUser) { return { user }; }
}
