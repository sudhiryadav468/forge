import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';

/** Signed-in and public mutations both require a matching same-origin CSRF token. */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
    const cookie = req.cookies?.nf_csrf;
    const header = req.headers['x-csrf-token'];
    if (typeof cookie !== 'string' || typeof header !== 'string' ||
      !/^[a-f0-9]{64}$/i.test(cookie) || !/^[a-f0-9]{64}$/i.test(header) ||
      !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) {
      throw new ForbiddenException('Invalid CSRF token. Refresh and try again.');
    }
    return true;
  }
}
