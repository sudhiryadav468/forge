import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { publicUserSelect } from '../common/constants';
import { ChangePasswordDto, UpdateProfileDto } from './users.dto';
import type { Response } from 'express';
import argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService) {}
  async update(userId: string, dto: UpdateProfileDto) {
    return { user: await this.prisma.user.update({ where: { id: userId }, data: { name: dto.name }, select: publicUserSelect }) };
  }
  async changePassword(userId: string, dto: ChangePasswordDto, res: Response) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!await argon2.verify(user.passwordHash, dto.currentPassword)) throw new UnauthorizedException('Current password is incorrect');
    if (await argon2.verify(user.passwordHash, dto.newPassword)) throw new BadRequestException('Choose a different password');
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await argon2.hash(dto.newPassword,
      { type: argon2.argon2id }) } });
    await this.auth.signOutEverywhere(userId, res);
    return { success: true, message: 'Password changed. Sign in again on all devices.' };
  }
}
