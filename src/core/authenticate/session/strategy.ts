import { Injectable, UnauthorizedException }                                                             from '@nestjs/common'
import { PassportStrategy }                                                                              from '@nestjs/passport'
import { plainToInstance }                                                                               from 'class-transformer'
import { ExtractJwt, Strategy, StrategyOptionsWithRequest, VerifiedCallback, VerifyCallbackWithRequest } from 'passport-jwt'
import { FunctionStatic }                                                                                from '../../../util'
import { IdentityUser }                                                                                  from '../../database'
import { CookieKeys, ErrorMessage }                                                                      from './constants'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'cookie-session', true) {

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
    const callback: VerifyCallbackWithRequest = (
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
  validate(payload: JwtUserSign) {
    if (!payload) throw new UnauthorizedException(ErrorMessage.ALERT.invalidToken)
    return payload
  }
}