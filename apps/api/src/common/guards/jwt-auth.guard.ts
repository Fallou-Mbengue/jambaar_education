import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const cls = context.getClass();
    const isPublic = this.reflector
      ? this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, cls])
      : !!(Reflect.getMetadata(IS_PUBLIC_KEY, handler) ?? Reflect.getMetadata(IS_PUBLIC_KEY, cls));
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, _info?: any, _context?: ExecutionContext, _status?: any): TUser {
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException('Invalid or expired token');
    }
    return user as TUser;
  }
}
