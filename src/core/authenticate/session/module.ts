import { DynamicModule, Provider, Type } from '@nestjs/common'
import { Constructor }                   from '@nestjs/common/utils/merge-with-values.util'
import { JwtModule, JwtService }                                                       from '@nestjs/jwt'
import { PassportModule }                                                              from '@nestjs/passport'
import { getRepositoryToken }                                                          from '@nestjs/typeorm'
import { Repository }                                                                  from 'typeorm'
import { ToastModule, ToastService }                                                   from '../../../util'
import { AuthRepositoryModule, DatabaseConnection, IdentityUser, IdentityUserService } from '../../database'
import { AuthenticateService }                                                         from './service'
import { SessionStrategy }                                                             from './strategy'

export class AuthenticateModule {

  static forRoot<T extends IdentityUser.Model = IdentityUser.Model, U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model> = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>>(
    config: {
      entity:   Function,
      connect:  DatabaseConnection,
      provider: Constructor<U>,
      exceptionHandlers: Type<any>[]
    }
  ): DynamicModule {
    const MODULES = [
      ...config.exceptionHandlers,
      JwtModule.register({
        secret:       'secret',
        signOptions: { expiresIn: '1h' },
        global:        true
      }),
      AuthRepositoryModule.forRoot({
        dsn:      'slave',
        connect: { ...config.connect, entities: [config.entity] },
      }),
      PassportModule.register({
        session:          true,
        defaultStrategy: 'cookie-session',
        property:        'user'
      }),
      ToastModule
    ]

    const PROVIDERS: Provider[] = [
      {
        provide:     config.provider,
        inject:     [getRepositoryToken(config.entity)],
        useFactory: (repository: Repository<T>) => new config.provider(repository)
      },
      {
        provide:     IdentityUserService,
        useExisting: config.provider
      },
      {
        provide:     AuthenticateService<T>,
        inject:     [IdentityUserService, JwtService, ToastService],
        useFactory: (userService: IdentityUserService<T>, jwt: JwtService, toast: ToastService) => new AuthenticateService<T>(userService, jwt, toast)
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
