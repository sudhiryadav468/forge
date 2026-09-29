import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Morgan' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(100) name!: string;

  @ApiProperty({ example: 'alex@example.com' })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(255) email!: string;

  @ApiProperty({ minLength: 10, maxLength: 128 })
  @IsString() @MinLength(10) @MaxLength(128)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, { message: 'Password must contain a letter and a number' })
  password!: string;
}

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() email!: string;
  @IsString() password!: string;
}
