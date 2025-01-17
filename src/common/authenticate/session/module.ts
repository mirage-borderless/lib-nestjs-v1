import { DynamicModule, Module, Provider }    from '@nestjs/common'
import { JwtModule }                          from '@nestjs/jwt'
import { PassportModule }                     from '@nestjs/passport'
import { EntityClassOrSchema }                from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { AuthRepositoryModule, IdentityUser } from '../../../common/database/auth'
import { ToastModule }                        from '../../../common/notify'
import { AuthenticateService }                from './service'
import { SessionStrategy }                    from './strategy'

@Module({})
export class AuthenticateModule {

  static forRoot<T extends IdentityUser.Model = IdentityUser.Model>(entity: EntityClassOrSchema): DynamicModule {
    const MODULES = [
      JwtModule.register({
        secret:       'secret',
        signOptions: { expiresIn: '1h' },
        global:        true
      }),
      AuthRepositoryModule.forRoot({ entity }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule
    ]

    const PROVIDERS: Provider[] = [
      AuthenticateService<T>,
      SessionStrategy
    ]
    return {
      imports:    MODULES,
      module:     this,
      providers:  PROVIDERS,
      exports:   [AuthenticateService<T>]
    }
  }
}
