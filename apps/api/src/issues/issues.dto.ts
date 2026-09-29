import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { IssuePriority, IssueStatus } from '@prisma/client';

export class CreateIssueDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(3) @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsEnum(IssuePriority) priority?: IssuePriority;
  @IsOptional() @IsString() assignedToId?: string | null;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(30, { each: true }) labels?: string[];
}
export class UpdateIssueDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MinLength(3) @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string | null;
  @IsOptional() @IsEnum(IssueStatus) status?: IssueStatus;
  @IsOptional() @IsEnum(IssuePriority) priority?: IssuePriority;
  @IsOptional() @IsString() assignedToId?: string | null;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(30, { each: true }) labels?: string[];
}
export class IssueFilterDto {
  @IsOptional() @IsEnum(IssueStatus) status?: IssueStatus;
  @IsOptional() @IsEnum(IssuePriority) priority?: IssuePriority;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
}
export class CreateCommentDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(1) @MaxLength(5000) content!: string;
}
