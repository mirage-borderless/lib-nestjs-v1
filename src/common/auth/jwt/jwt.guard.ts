import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { I18nService }                                                      from 'nestjs-i18n'

@Injectable()
export class CommonAuthJwtGuard implements CanActivate {

  constructor(private readonly i18nService: I18nService) {}

  async canActivate(context : ExecutionContext) {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    if (!request.isAuthenticated) throw new UnauthorizedException(this.i18nService.translate('common.auth.unauthorized'))
    return true
  }
}
