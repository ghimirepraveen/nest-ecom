import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
