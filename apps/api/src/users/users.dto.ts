import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UpdateProfileDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
}
export class ChangePasswordDto {
  @IsString() currentPassword!: string;
  @IsString() @MinLength(10) @MaxLength(128)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'Password must contain a letter and a number' })
  newPassword!: string;
}
