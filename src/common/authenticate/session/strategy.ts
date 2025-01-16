import { ForbiddenException, Injectable, Type, UnauthorizedException } from '@nestjs/common'
import { JwtService }                                                  from '@nestjs/jwt'
import { PassportStrategy }                                            from '@nestjs/passport'
import { plainToInstance }                                             from 'class-transformer'
import { ExtractJwt, Strategy, StrategyOptionsWithRequest }            from 'passport-jwt'
import { CookieKeys, ErrorMessage }                                    from 'src/common/authenticate/session/constants'
import { IdentityUser }                                                from 'src/common/database/auth/entity/identity-user.entity'
import { FunctionStatic }                                              from 'src/util'

@Injectable()
export class SessionStrategy<T extends IdentityUser.Model> extends PassportStrategy(Strategy, 'cookie-session') {

  constructor(
    private readonly identityUserCtor: Type<T>,
    private readonly jwtService:       JwtService
  ) {
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
      done:       (err: any, secretOrKey?: string | Buffer) => void
    ) => {
      FunctionStatic.decrypt(jwtDecoded.data).then(async (originalData: string) => {
        try {
          const payload = plainToInstance(IdentityUser.JwtSign, JSON.parse(originalData))
          if (!!payload) {
            request.user            = this.validate(payload)
            request.isAuthenticated = !!request.user
          }
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