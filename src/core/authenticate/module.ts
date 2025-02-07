import { DynamicModule, Provider }                           from '@nestjs/common'
import { ConfigModule, ConfigService }                       from '@nestjs/config'
import { JwtModule, JwtService }                             from '@nestjs/jwt'
import { PassportModule }                                    from '@nestjs/passport'
import { ToastModule, ToastService }                         from '../../util'
import { IdentityUser, IdentityUserService, KeypairService } from '../database'
import { JwtStrategy }                                       from './jwt/strategy'
import { AuthenticateService }                               from './service'
import { SessionStrategy }                                   from './session/strategy'

type WithNotification    = { enableToast: true  }
type WithoutNotification = { enableToast: false }

type AuthenticateSetting = { enableEncrypt: boolean, strategy: 'jwt' | 'cookie-session' } & (WithNotification | WithoutNotification)

export class AuthenticateModule {

  static forRoot<
    T extends IdentityUser.Model = IdentityUser.Model,
    U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
            = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
  >(setting: AuthenticateSetting): DynamicModule {
    const MODULES = [
      ConfigModule,
      JwtModule.registerAsync({
        imports:    [ConfigModule],
        inject:     [ConfigService],
        useFactory: (configService: ConfigService) => ({
          secret:        configService.get<string>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_SECRET', 'secret'),
          signOptions: { expiresIn: '1h' },
          global:        true
        })
      }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule,
    ]

    const PROVIDERS: Provider[] = [
      {
        provide:     AuthenticateService<T>,
        inject:     [IdentityUserService, JwtService, ToastService, ConfigService, KeypairService],
        useFactory: async (
          userService:    IdentityUserService<T>,
          jwt:            JwtService,
          toast:          ToastService,
          configService:  ConfigService,
          keypairService: KeypairService
        ) => {
          if (setting.enableEncrypt === true) {
            configService.set<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPT_ENABLE', true)
          }
          return new AuthenticateService<T>(
            setting.enableToast === true ? toast : undefined,
            userService,
            jwt,
            configService,
            keypairService
          )
        }
      }
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers: [...PROVIDERS, setting.strategy === 'cookie-session' ? SessionStrategy : JwtStrategy],
      exports:   [...MODULES, ...PROVIDERS]
    }
  }
}
