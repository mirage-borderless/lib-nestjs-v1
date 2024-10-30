import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { I18nService }                                                                          from 'nestjs-i18n'
import { IdentityUser }                                                                         from '../conf/database/entity/identity-user.entity'
import { CommonAuthJwtService }                                                                 from './jwt.service'
import { ToastService }                                                                         from '../../notify/toast/toast.service'

@Injectable()
export class CommonJwtAutoDetect<T extends IdentityUser.Model = IdentityUser.Model> implements CanActivate {

  public static readonly COOKIE_VIA_AUTHORIZATION = 'Authorization'
  public static readonly HEADER_VIA_AUTHORIZATION = 'Authorization'

  constructor(
    @Inject(forwardRef(() =>       CommonAuthJwtService<T>))
    private readonly jwtService:   CommonAuthJwtService<T>,
    private readonly toastService: ToastService,
    private readonly i18nService:  I18nService
  ) {}

  canActivate(context: ExecutionContext) {
    const request       = context.switchToHttp().getRequest<FastifyRequest>()
    const response      = context.switchToHttp().getResponse<FastifyReply>()
    const authorization = this.jwtService.getAccessToken(request)
    if (!!authorization) {
      return this.jwtService.decode(authorization).then(async (jwt: JwtUserSign<T>) => {
        if (Date.now() > jwt.exp) {
          this.toastService.removeClient(jwt.idToken)
          response.clearCookie(CommonJwtAutoDetect.COOKIE_VIA_AUTHORIZATION)
          throw new UnauthorizedException(this.i18nService.translate('common.auth.error.session_expired'))
        }
        request.user            = jwt
        request.isAuthenticated = true
        response.locals.uuid    = jwt.idToken
        return true
      })
    }
    return new Promise<boolean>((resolve, reject) => resolve(true))
  }
}
