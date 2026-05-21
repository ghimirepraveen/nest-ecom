import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUserDetails, AuthService } from '../auth.service';
import { JwtPayload, extractBearerToken, verifyJwt } from '../utils/jwt.util';

type AuthenticatedRequest = Request & {
  user?: JwtPayload & Partial<AuthenticatedUserDetails>;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    try {
      const token = extractBearerToken(request.headers.authorization);
      const payload = verifyJwt(
        token,
        process.env.JWT_ACCESS_SECRET || 'access-secret',
      );

      const userDetails = await this.authService.getUserById(payload.sub);
      request.user = { ...payload, ...userDetails };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
