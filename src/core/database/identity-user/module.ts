import { DynamicModule, Provider }                                      from '@nestjs/common'
import { Constructor }                                                  from '@nestjs/common/utils/merge-with-values.util'
import { ConfigModule, ConfigService }                                  from '@nestjs/config'
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import * as process                                                     from 'process'
import { Repository }                                                   from 'typeorm'
import { IdentityUser, IdentityUserService }                            from '../identity-user'

export class IdentityUserDatabaseModule {

  static forRoot<
    T extends IdentityUser.Model = IdentityUser.Model,
    U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
            = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
  >(
    register: {
      /**
       * User table, user service
       * */
      user: {
        service: Constructor<U>,
        table:   Function
      },
      /**
       * Other tables in database identity
       * */
      tables?: Function[],
    }
  ): DynamicModule {
    function createTypeOrmOptions(dsn: 'master') {
      return (<TypeOrmModuleAsyncOptions>{
        useFactory: async (configService: ConfigService) => ({
          type:       'mssql',
          name:        dsn === 'master' ? undefined : dsn,
          logging:   ['error', 'query', 'log'],
          host:        process.env.NODE_ENV === 'development' ? 'localhost' : configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER', 'localhost'),
          port:        process.env.NODE_ENV === 'development' ? parseInt(configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER_EXPOSE_PORT')) : 1433,
          username:   'sa',
          password:    configService.get('MIRAGE_MSSQL_CONFIG_SA_PASSWORD', ''),
          database:    configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER', 'identity_user'),
          entities:   [...register.tables, register.user.table],
          synchronize: dsn === 'master',
          options: {
            trustServerCertificate: true,
          }
        }),
        inject: [ConfigService],
        imports:[ConfigModule]
      })
    }
    const MODULES = [
      TypeOrmModule.forRootAsync(createTypeOrmOptions('master')),
      TypeOrmModule.forFeature([...register.tables, register.user.table]),
    ]
    const PROVIDERS: Provider[] = [
      {
        provide:     register.user.service,
        inject:     [getRepositoryToken(register.user.table)],
        useFactory: (repository: Repository<T>) => new register.user.service(repository)
      },
      {
        provide:     IdentityUserService,
        useExisting: register.user.service
      }
    ]
    return {
      module:     this,
      imports:    MODULES,
      providers:  PROVIDERS,
      exports:   [...MODULES, ...PROVIDERS],
      global:     true
    }
  }
}
