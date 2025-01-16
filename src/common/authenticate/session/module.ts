import { DynamicModule, Module, Provider, Type } from '@nestjs/common'
import { JwtModule, JwtService }                 from '@nestjs/jwt'
import { PassportModule }                        from '@nestjs/passport'
import { IdentityUser }        from 'src/common/database/auth'
import { AuthenticateService } from './service'
import { SessionStrategy }     from './strategy'

const MODULES = [
  JwtModule.register({
    secret:       'secret',
    signOptions: { expiresIn: '1h' },
    global:        true
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
        inject:     [JwtService],
        provide:     SessionStrategy,
        useFactory: (jwtService: JwtService) => new SessionStrategy(ctor, jwtService)
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
