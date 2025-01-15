import { ForbiddenException, Injectable, Type, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy }                                            from '@nestjs/passport'
import { plainToInstance }                                       from 'class-transformer'
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt'
import { IdentityUser }                                     from 'src/common/database/auth/entity/identity-user.entity'
import { CookieKeys }                                       from 'src/common/authenticate/session/constants'
import { AuthenticateService }                              from 'src/common/authenticate/session/service'
import { FunctionStatic }                                        from 'src/util'
import JwtSign = IdentityUser.JwtSign

@Injectable()
export class SessionStrategy<T extends IdentityUser.Model = IdentityUser.Model> extends PassportStrategy(Strategy, 'cookie-session') {

  constructor(
    private readonly identityUserCtor: Type<T>,
    private readonly authService:      AuthenticateService
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
    const callback = async (
      request: FastifyRequest,
      token:   string,
      _:       Function
    ) => {
      const decrypted: string = await FunctionStatic.decrypt(token)
      const payload           = JSON.parse(decrypted) as Partial<JwtSign<T>>
      if (!!payload) {
        const user              = plainToInstance(identityUserCtor, payload.detail)
        const sign              = new IdentityUser.JwtSign(user)
        request.user            = this.validate(sign)
        request.isAuthenticated = !!request.user
      }
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
    if (!payload)                                           throw new UnauthorizedException()
    if ( payload.iat < Date.now())                          throw new UnauthorizedException()
    if ( payload.detail.role === IdentityUser.Role.IS_NONE) throw new ForbiddenException()
    return payload
  }
}