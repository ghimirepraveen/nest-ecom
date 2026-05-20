import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { extractBearerToken, verifyJwt } from '../utils/jwt.util';

@Injectable()
export class JwtRefreshAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();

    try {
      const token = extractBearerToken(request.headers.authorization);
      request.user = verifyJwt(
        token,
        process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      );
      return true;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
