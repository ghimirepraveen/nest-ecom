import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  UnauthorizedException,
  type Type,
} from '@nestjs/common';
import { Request } from 'express';
import type { UserType } from '../constant';

export function UserTypeGuard(requiredUserType: UserType): Type<CanActivate> {
  @Injectable()
  class UserTypeGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest<
        Request & {
          user?: { userType?: UserType; role?: UserType };
        }
      >();

      const userType = request.user?.userType ?? request.user?.role;

      if (!userType) {
        throw new UnauthorizedException('User type not found in token');
      }

      if (userType !== requiredUserType) {
        throw new UnauthorizedException(
          `User does not have the required user type: ${requiredUserType}`,
        );
      }

      return true;
    }
  }

  return mixin(UserTypeGuardMixin);
}
