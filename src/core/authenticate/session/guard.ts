import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard }                                                               from '@nestjs/passport'
import { IdentityUser }                                                            from '../../database'
import { CookieKeys, ErrorMessage }                                                from '../constants'

@Injectable()
export class AuthenticatedAsUser extends AuthGuard('cookie-session') {
  async canActivate(context: ExecutionContext) {
    const result   = (await super.canActivate(context)) as boolean
    const request  = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<FastifyReply>()
    if (!!request.user) {
      switch (request.user.detail.role) {
        case IdentityUser.Role.IS_USER:
        case IdentityUser.Role.IS_EDITOR:
        case IdentityUser.Role.IS_OWNER: break;
        case IdentityUser.Role.IS_NONE:
                 throw new ForbiddenException   (ErrorMessage.ALERT.accessDenied)
        default: throw new UnauthorizedException(ErrorMessage.ALERT.unauthorized)
      }
    } else {
      response.clearCookie(CookieKeys.AUTHORIZATION)
    }
    return result
  }
}

@Injectable()
export class AuthenticatedAsEditor extends AuthGuard('cookie-session') {
  async canActivate(context: ExecutionContext) {
    const result   = (await super.canActivate(context)) as boolean
    const request  = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<FastifyReply>()
    if (!!request.user) {
      switch (request.user.detail.role) {
        case IdentityUser.Role.IS_EDITOR:
        case IdentityUser.Role.IS_OWNER: break;
        default: throw new ForbiddenException(ErrorMessage.ALERT.accessDenied)
      }
    } else {
      response.clearCookie(CookieKeys.AUTHORIZATION)
    }
    return result
  }
}

@Injectable()
export class AuthenticatedAsAdmin extends AuthGuard('cookie-session') {
  async canActivate(context: ExecutionContext) {
    const result   = (await super.canActivate(context)) as boolean
    const request  = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<FastifyReply>()
    if (!!request.user) {
      switch (request.user.detail.role) {
        case IdentityUser.Role.IS_OWNER: break;
        default: throw new ForbiddenException(ErrorMessage.ALERT.accessDenied)
      }
    } else {
      response.clearCookie(CookieKeys.AUTHORIZATION)
    }
    return result
  }
}