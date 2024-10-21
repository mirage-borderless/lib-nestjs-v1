import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class CommonAuthJwtGuard implements CanActivate {

  async canActivate(context : ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    if (!request.isAuthenticated) throw new UnauthorizedException('Chưa đăng nhập')
    return true
  }
}
