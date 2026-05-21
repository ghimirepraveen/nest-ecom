import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Auth, AuthSchema } from './schemas/auth.schema';
import { Token, TokenSchema } from './schemas/token.schema';
import { MailModule } from '../mail/mail.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtRefreshAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtRefreshAuthGuard],
})
export class AuthModule {}
