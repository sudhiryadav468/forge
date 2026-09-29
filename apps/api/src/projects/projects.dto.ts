import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { ProjectStatus, Role } from '@prisma/client';

export class CreateProjectDto {
  @IsString() workspaceId!: string;
  @ApiProperty({ example: 'Commerce API' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsOptional() @Matches(/^[A-Z][A-Z0-9]{1,11}$/, { message: 'Key must be 2–12 uppercase letters/numbers, starting with a letter' }) key?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
}
export class UpdateProjectDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
}
export class SetProjectMemberDto {
  @IsString() userId!: string;
  @IsEnum(Role) role!: Role;
}
export class UpdateProjectMemberDto { @IsEnum(Role) role!: Role; }
