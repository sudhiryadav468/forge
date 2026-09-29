import { ConflictException, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import argon2 from 'argon2';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../common/constants';
import { LoginDto, RegisterDto } from './auth.dto';

const ACCESS_AGE = 15 * 60 * 1000;
const REFRESH_AGE = 7 * 24 * 60 * 60 * 1000;
const cookieBase = () => ({ secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const });
const hashToken = (value: string) => createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  csrf(res: Response) {
    const token = randomBytes(32).toString('hex');
    res.cookie('nf_csrf', token, { ...cookieBase(), httpOnly: false, path: '/' });
    return { csrfToken: token };
  }

  async register(dto: RegisterDto, res: Response) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } }))
      throw new ConflictException('An account with this email already exists');
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    let user;
    try {
      user = await this.prisma.user.create({ data: { name: dto.name, email: dto.email, passwordHash },
        select: publicUserSelect });
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') throw new ConflictException('An account with this email already exists');
      throw error;
    }
    await this.createSession(user.id, res);
    return { user };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !await argon2.verify(user.passwordHash, dto.password))
      throw new UnauthorizedException('Invalid email or password');
    await this.createSession(user.id, res);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { user: safeUser };
  }

  async demo(res: Response) {
    if (process.env.DEMO_MODE !== 'true' || process.env.NODE_ENV === 'production')
      throw new ForbiddenException('Demo sign-in is disabled');
    const user = await this.prisma.user.findUnique({ where: { email: 'demo@nexusforge.dev' }, select: publicUserSelect });
    if (!user) throw new ForbiddenException('Seed the demo data first');
    await this.createSession(user.id, res);
    return { user };
  }

  async refresh(rawToken: string | undefined, res: Response) {
    if (!rawToken) throw new UnauthorizedException('No refresh session');
    const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash: hashToken(rawToken) } });
    if (!session || session.expiresAt < new Date()) {
      this.clearCookies(res);
      throw new UnauthorizedException('Session expired');
    }
    // A reused rotated token invalidates every active session for this user.
    if (session.revokedAt) {
      await this.prisma.refreshSession.updateMany({ where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() } });
      this.clearCookies(res);
      throw new UnauthorizedException('Session was already used');
    }
    const claimed = await this.prisma.refreshSession.updateMany({ where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() } });
    if (claimed.count !== 1) { this.clearCookies(res); throw new UnauthorizedException('Session was already used'); }
    const user = await this.prisma.user.findUnique({ where: { id: session.userId }, select: publicUserSelect });
    if (!user) { this.clearCookies(res); throw new UnauthorizedException('Account not found'); }
    await this.createSession(user.id, res);
    return { user };
  }

  async logout(rawToken: string | undefined, res: Response) {
    if (rawToken) await this.prisma.refreshSession.updateMany({ where: { tokenHash: hashToken(rawToken), revokedAt: null },
      data: { revokedAt: new Date() } });
    this.clearCookies(res);
    return { success: true };
  }

  private async createSession(userId: string, res: Response) {
    const refresh = randomBytes(48).toString('hex');
    const session = await this.prisma.refreshSession.create({ data: { userId, tokenHash: hashToken(refresh),
      expiresAt: new Date(Date.now() + REFRESH_AGE) } });
    const access = await this.jwt.signAsync({ sub: userId, sid: session.id, type: 'access' },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: '15m', algorithm: 'HS256' });
    res.cookie('nf_access', access, { ...cookieBase(), httpOnly: true, path: '/api', maxAge: ACCESS_AGE });
    res.cookie('nf_refresh', refresh, { ...cookieBase(), httpOnly: true, path: '/api/auth', maxAge: REFRESH_AGE });
  }

  async signOutEverywhere(userId: string, res: Response) {
    await this.prisma.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    this.clearCookies(res);
  }

  private clearCookies(res: Response) {
    res.clearCookie('nf_access', { ...cookieBase(), path: '/api' });
    res.clearCookie('nf_refresh', { ...cookieBase(), path: '/api/auth' });
  }
}
