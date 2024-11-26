import { CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { ToastService }                                         from '../../notify'
import { CommonAuthJwtService }                                 from './jwt.service'

export class CommonAuthJwtGuard implements CanActivate {

  static readonly COOKIE_VIA_AUTHORIZATION = 'Authorization'
  static readonly HEADER_VIA_AUTHORIZATION = 'Authorization'


  async canActivate(context: ExecutionContext) {
    const request       = context.switchToHttp().getRequest<FastifyRequest>()
    const response      = context.switchToHttp().getResponse<FastifyReply>()
    const jwtService    = await request.backend().resolve(CommonAuthJwtService)
    const toastService  = await request.backend().resolve(ToastService)
    const authorization = jwtService.getAccessToken(request)
    if (!!authorization) {
      return jwtService.decode(authorization).then(async (jwt: JwtUserSign) => {
        if (Date.now() > jwt.exp) {
          toastService.removeClient(jwt.idToken)
          response.clearCookie(CommonAuthJwtGuard.COOKIE_VIA_AUTHORIZATION)
          throw new UnauthorizedException('common.auth.error.session_expired')
        }
        request.user            = jwt
        request.isAuthenticated = !!request.user
        response.locals.uuid    = jwt.idToken
        return true
      })
    }
    if (!request.isAuthenticated) throw new UnauthorizedException('common.auth.unauthorized')
    return true
  }
}
