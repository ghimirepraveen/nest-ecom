import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class VerifyOtpAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  otp!: string;
}
