import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Public() @Get()
  check() { return { status: 'ok', service: 'nexusforge-api', timestamp: new Date().toISOString() }; }
  @Public() @Get('database')
  async database() {
    try { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ok', service: 'postgresql' }; }
    catch { throw new ServiceUnavailableException('Database unavailable'); }
  }
}
