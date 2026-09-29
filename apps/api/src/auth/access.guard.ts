import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../common/constants';
import { IS_PUBLIC_KEY } from '../common/public.decorator';
import type { AuthenticatedRequest } from '../common/request-user';

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService,
    private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.nf_access;
    if (typeof token !== 'string') throw new UnauthorizedException('Please sign in');
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; sid: string; type: string }>(token,
        { secret: process.env.ACCESS_TOKEN_SECRET, algorithms: ['HS256'] });
      if (payload.type !== 'access' || !payload.sub || !payload.sid) throw new Error('Invalid token type');
      const session = await this.prisma.refreshSession.findUnique({ where: { id: payload.sid },
        select: { userId: true, revokedAt: true, expiresAt: true } });
      if (!session || session.userId !== payload.sub || session.revokedAt || session.expiresAt < new Date())
        throw new Error('Session revoked');
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: publicUserSelect });
      if (!user) throw new Error('User not found');
      (request as AuthenticatedRequest).user = user;
      return true;
    } catch { throw new UnauthorizedException('Session expired. Please sign in again.'); }
  }
}
