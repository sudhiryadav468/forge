import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface RequestUser { id: string; name: string; email: string; avatarUrl: string | null }
export type AuthenticatedRequest = Request & { user: RequestUser };
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser =>
  ctx.switchToHttp().getRequest<AuthenticatedRequest>().user);
