import { DynamicModule, Module, Provider, Type }                                   from '@nestjs/common'
import { getInjectionProviders }                                                   from '@nestjs/common/module-utils/utils';
import { Constructor }                                                             from '@nestjs/common/utils/merge-with-values.util';
import { JwtModule }                                                               from '@nestjs/jwt'
import { PassportModule }                                                          from '@nestjs/passport'
import { getRepositoryToken }                                                      from '@nestjs/typeorm';
import { EntityClassOrSchema }                                                     from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { Repository }                                                                  from 'typeorm';
import { AuthRepositoryModule, DatabaseConnection, IdentityUser, IdentityUserService } from '../../database'
import { ToastModule }                                                                 from '../../notify'
import { AuthenticateService }                                                     from './service'
import { SessionStrategy }                                                         from './strategy'

@Module({})
export class AuthenticateModule {

  static forRoot<U extends IdentityUserService<T>, T extends IdentityUser.Model = IdentityUser.Model>(
    config: {
      dsn?:     'slave' | 'master',
      entity:    EntityClassOrSchema,
      connect:   DatabaseConnection,
      provider:  Constructor<U>,
    }
  ): DynamicModule {
    const MODULES = [
      JwtModule.register({
        secret:       'secret',
        signOptions: { expiresIn: '1h' },
        global:        true
      }),
      AuthRepositoryModule.forRoot(config as any),
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
      exports:   [...MODULES, ...PROVIDERS]
    }
  }
}
