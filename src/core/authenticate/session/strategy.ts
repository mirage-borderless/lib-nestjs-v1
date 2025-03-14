import { forwardRef, Inject, Injectable, UnauthorizedException }      from '@nestjs/common'
import { ConfigService }                                              from '@nestjs/config'
import { PassportStrategy }                                           from '@nestjs/passport'
import { plainToInstance }                                            from 'class-transformer'
import { ExtractJwt, Strategy, VerifiedCallback }                     from 'passport-jwt'
import { FunctionStatic }                                             from '../../../util'
import { IdentityUser, IdentityUserService, Keypair, KeypairService } from '../../database'
import { CookieKeys, ErrorMessage }                                   from '../constants'

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy as any, 'cookie-session', true) {

  private keypair: Keypair.Model

  constructor(
    readonly configService: ConfigService,
    @Inject(forwardRef(() => IdentityUserService))
    readonly userService:    IdentityUserService,
    @Inject(forwardRef(() => KeypairService))
    private readonly keypairService: KeypairService
  ) {
    super({
      jwtFromRequest:    ExtractJwt.fromExtractors([(req) => req.cookies[CookieKeys.AUTHORIZATION]]),
      secretOrKey:       configService.get<string>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_SECRET', 'secret'),
      passReqToCallback: true,
      ignoreExpiration:  false
    }, async (
      request:    FastifyRequest,
      jwtDecoded: { data: string, iat: number, exp: number },
      done:       VerifiedCallback
    ) => {
      const transform = async (dataStringify: string) => {
        try {
          const parseJson = JSON.parse(dataStringify) as Partial<IdentityUser.JwtSign>
          const payload   = plainToInstance(IdentityUser.JwtSign, parseJson)
          if (!!payload) {
            request.user            = await this.validate(payload)
            request.isAuthenticated = !!request.user
            done(null, request.user)
          }
          done(new UnauthorizedException(ErrorMessage.ALERT.invalidToken))
        } catch (e) {
          done(new UnauthorizedException(ErrorMessage.ALERT.invalidToken))
        }
      }
      if (configService.get<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPT_ENABLE', false)) {
        this.keypair = this.keypair ?? await this.keypairService.get()
        FunctionStatic
          .decrypt(jwtDecoded.data, this.keypair.privateKey, function (e) {
            done(new UnauthorizedException(ErrorMessage.NOTICE.reSignIn))
          })
          .then(transform)
      } else await transform(jwtDecoded.data)
    })
  }

  /**
   * Validate authentication
   */
  async validate(payload: JwtUserSign) {
    if (!payload) throw new UnauthorizedException(ErrorMessage.ALERT.invalidToken)
    const user = await this.userService.get(payload.id)
    if (!!user && user.password === payload.detail.password && user.username === user.username) {
      return payload
    }
    if (!payload) throw new UnauthorizedException(ErrorMessage.ALERT.invalidToken)
  }
}