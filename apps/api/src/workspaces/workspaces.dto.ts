import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme Engineering' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
}
export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {}
export class AddWorkspaceMemberDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email!: string;
  @IsEnum(Role) role!: Role;
}
export class UpdateWorkspaceMemberDto {
  @IsEnum(Role) role!: Role;
}
