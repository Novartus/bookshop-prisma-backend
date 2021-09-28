import { AuthGuard } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '.prisma/client';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T extends User>(err: Error, user: T, info: Error): T {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          data: { ...info },
        })
      );
    }
    return user;
  }
}
