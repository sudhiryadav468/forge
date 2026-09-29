import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(3) @MaxLength(200) title!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsOptional() @IsString() assignedToId?: string | null;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) dueDate?: string | null;
}
export class UpdateTaskDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MinLength(3) @MaxLength(200) title?: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string | null;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @IsOptional() @IsString() assignedToId?: string | null;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) dueDate?: string | null;
}
