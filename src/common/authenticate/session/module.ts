import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { JwtModule }                             from '@nestjs/jwt'
import { PassportModule }      from '@nestjs/passport'
import { IdentityUser }        from 'src/common/database/auth'
import { AuthenticateService } from './service'
import { SessionStrategy }     from './strategy'

const MODULES = [
  JwtModule.register({
    secret:       'secret',
    signOptions: { expiresIn: '60s' }
  }),
  // DaoServiceModule,
  PassportModule.register({
    session:          true,
    defaultStrategy: 'cookie-session',
    property:        'user'
  }),
]

@Module({})
export class AuthenticateModule {

  static forRoot<T extends IdentityUser.Model>(ctor: Type<T>): DynamicModule {
    const PROVIDERS: Provider[] = [
      AuthenticateService,
      {
        inject:     [AuthenticateService],
        provide:     SessionStrategy,
        useFactory: (authService: AuthenticateService) => new SessionStrategy(ctor, authService)
      },
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers:  PROVIDERS,
      exports:   [AuthenticateService]
    }
  }
}
