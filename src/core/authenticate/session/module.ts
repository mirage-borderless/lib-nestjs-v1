import { DynamicModule, Provider }     from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtService }       from '@nestjs/jwt'
import { PassportModule }                    from '@nestjs/passport'
import { ToastModule, ToastService }         from '../../../util'
import { IdentityUser, IdentityUserService } from '../../database'
import { AuthenticateService }               from './service'
import { SessionStrategy }                   from './strategy'

export type AuthenticateWithNotification    = { enableToast: true  }
export type AuthenticateWithoutNotification = { enableToast: false }

export class AuthenticateModule {

  static forRoot<
    T extends IdentityUser.Model = IdentityUser.Model,
    U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
            = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
  >(
    config: AuthenticateWithNotification | AuthenticateWithoutNotification
  ): DynamicModule {
    const MODULES = [
      JwtModule.register({
        secret:       'secret',
        signOptions: { expiresIn: '1h' },
        global:        true
      }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule,
      ConfigModule
    ]

    // TODO: add MIRAGE_CRYPTO_PUBLIC_KEY, MIRAGE_CRYPTO_PRIVATE_KEY to config
    const PROVIDERS: Provider[] = [
      {
        provide:     AuthenticateService<T>,
        inject:     [IdentityUserService, JwtService, ToastService, ConfigService],
        useFactory: (
          userService:   IdentityUserService<T>,
          jwt:           JwtService,
          toast:         ToastService,
          configService: ConfigService
        ) => new AuthenticateService<T>(config.enableToast === true ? toast : undefined, userService, jwt, configService)
      }
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers: [...PROVIDERS, SessionStrategy],
      exports:   [...MODULES, ...PROVIDERS]
    }
  }
}
