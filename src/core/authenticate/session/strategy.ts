import { Injectable, UnauthorizedException }      from '@nestjs/common'
import { ConfigService }                          from '@nestjs/config'
import { PassportStrategy }                       from '@nestjs/passport'
import { plainToInstance }                        from 'class-transformer'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'
import { FunctionStatic }                         from '../../../util'
import { IdentityUser }                           from '../../database'
import { CookieKeys, ErrorMessage }               from './constants'
import * as crypto                                from 'crypto'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy as any, 'cookie-session', true) {

  private privateKey: string
  private publicKey:  string

  constructor(
    private readonly configService: ConfigService
  ) {
    crypto.generateKeyPair('rsa', {
      modulusLength:        2048,
      publicKeyEncoding:  { type: 'spki',  format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }, (err: Error | null, publicKey: string, privateKey: string) => {
      this.privateKey = privateKey
      this.publicKey  = publicKey
    })
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies[CookieKeys.AUTHORIZATION]]),
      secretOrKey:        configService.get<string>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_SECRET', 'secret'),
      passReqToCallback:  true,
      ignoreExpiration:   false
    }, (
      request:    FastifyRequest,
      jwtDecoded: { data: string, iat: number, exp: number },
      done:       VerifiedCallback
    ) => {
      const transform = (dataStringify: string) => {
        try {
          const parseJson = JSON.parse(dataStringify) as Partial<IdentityUser.JwtSign>
          const payload   = plainToInstance(IdentityUser.JwtSign, parseJson)
          if (!!payload) {
            request.user            = this.validate(payload)
            request.isAuthenticated = !!request.user
            done(null, request.user)
          }
          done(new UnauthorizedException(ErrorMessage.ALERT.invalidToken))
        } catch (e) {
          done(new UnauthorizedException(ErrorMessage.ALERT.invalidToken))
        }
      }
      configService.get<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPTED', false)
        ? FunctionStatic
          .decrypt(jwtDecoded.data, configService.get('MIRAGE_CRYPTO_PRIVATE_KEY'))
          .then(transform)
        : transform(jwtDecoded.data)
    })
  }

  /**
   * Validate authentication
   */
  validate(payload: JwtUserSign) {
    if (!payload) throw new UnauthorizedException(ErrorMessage.ALERT.invalidToken)
    return payload
  }
}