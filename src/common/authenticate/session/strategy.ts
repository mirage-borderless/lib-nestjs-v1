import { ForbiddenException, Injectable, UnauthorizedException }              from '@nestjs/common'
import { PassportStrategy }                                                   from '@nestjs/passport'
import { plainToInstance }                                                    from 'class-transformer'
import { ExtractJwt, Strategy, StrategyOptionsWithRequest, VerifiedCallback } from 'passport-jwt'
import { CookieKeys, ErrorMessage }                                           from '../../../common/authenticate/session/constants'
import { IdentityUser }                                                       from '../../../common/database/auth/entity/identity-user.entity'
import { FunctionStatic }                                                     from '../../../util'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'cookie-session') {

  constructor() {
    /**
     * Detect jwt from request cookies
     */
    const jwtFromRequest = ExtractJwt.fromExtractors([
      (req: FastifyRequest) => req.cookies[CookieKeys.AUTHORIZATION]
    ])
    /**
     * Fn handle passport verify callback
     */
    const callback = (
      request:    FastifyRequest,
      jwtDecoded: { data: string, iat: number, exp: number },
      done:       VerifiedCallback
    ) => {
      FunctionStatic.decrypt(jwtDecoded.data).then(async (dataStringify: string) => {
        try {
          const parseJson = JSON.parse(dataStringify) as Partial<IdentityUser.JwtSign>
          const payload   = plainToInstance(IdentityUser.JwtSign, parseJson)
          if (!!payload) {
            request.user            = this.validate(payload)
            request.isAuthenticated = !!request.user
          }
          done(null, request.user)
        } catch (e) {
          done(new UnauthorizedException(ErrorMessage.ALERT.invalidToken))
        }
      }).catch(e => done(new UnauthorizedException(ErrorMessage.ALERT.tokenExpired)))
    }
    /**
     * Register request handler
     */
    super(<StrategyOptionsWithRequest>{
      jwtFromRequest,
      ignoreExpiration:  false,
      secretOrKey:      'secret',
      passReqToCallback: true
    }, callback)
  }

  /**
   * Validate authentication
   */
  private validate(payload: JwtUserSign) {
    if (!payload)                                           throw new UnauthorizedException(ErrorMessage.ALERT.invalidToken)
    if ( payload.detail.role === IdentityUser.Role.IS_NONE) throw new ForbiddenException   (ErrorMessage.ALERT.accessDenied)
    return payload
  }
}