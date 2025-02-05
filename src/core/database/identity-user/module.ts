import { DynamicModule, Provider }                                      from '@nestjs/common'
import { Constructor }                                                  from '@nestjs/common/utils/merge-with-values.util'
import { ConfigModule, ConfigService }                                  from '@nestjs/config'
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import * as process                                                     from 'process'
import { Repository }                                                   from 'typeorm'
import { AuthenticateModule }                                           from '../../authenticate'
import { IdentityUser, IdentityUserService }                            from '../identity-user'

type ModifyUserTableWithService<
  T extends IdentityUser.Model = IdentityUser.Model,
  U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
          = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
> = {
  service: Constructor<U>,
  table:   Function
}

type ModifyUserTableWithoutService<
  T extends IdentityUser.Model = IdentityUser.Model,
  U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
          = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
> = Function

export class IdentityUserDatabaseModule {

  static forRoot<
    T extends IdentityUser.Model = IdentityUser.Model,
    U extends IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
            = IdentityUserService<T extends IdentityUser.Model ? T : IdentityUser.Model>
  >(
    setting: {
      /**
       * User table, user service
       * */
      user?: ModifyUserTableWithService | ModifyUserTableWithoutService,
      /**
       * Other tables in database identity
       * */
      tables?:   Function[],
      /**
       * Authenticate strategy by jwt or cookie session
       */
      strategy: 'jwt' | 'cookie-session',
      /**
       * Enable encrypt, using encrypto library
       */
      encrypt?:  boolean
    }
  ): DynamicModule {
    const userTableSetting = typeof setting.user !== 'function' ? setting.user : {
      service: IdentityUserService.instance,
      table:   setting.user
    }

    function createTypeOrmOptions(dsn: 'master') {
      return (<TypeOrmModuleAsyncOptions>{
        useFactory: async (configService: ConfigService) => ({
          type:       'mssql',
          name:        dsn === 'master' ? undefined : dsn,
          logging:   ['error', 'query', 'log'],
          host:        process.env.NODE_ENV === 'development' ? 'localhost' : configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER', 'localhost'),
          port:        process.env.NODE_ENV === 'development' ?      parseInt(configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER_EXPOSE_PORT')) : 1433,
          username:   'sa',
          password:    configService.get('MIRAGE_MSSQL_CONFIG_SA_PASSWORD', ''),
          database:    configService.get('MIRAGE_MSSQL_DATABASE_IDENTITY_USER', 'identity_user'),
          entities:   [...setting.tables, userTableSetting.table],
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
      TypeOrmModule.forFeature([...setting.tables, userTableSetting.table]),
      AuthenticateModule.forRoot({
        enableToast:   true,
        enableEncrypt: setting.encrypt === true,
        strategy:      setting.strategy
      })
    ]
    const PROVIDERS: Provider[] = [
      {
        provide:     userTableSetting.service,
        inject:     [getRepositoryToken(userTableSetting.table)],
        useFactory: (repository: Repository<T>) => new userTableSetting.service(repository)
      },
      {
        provide:     IdentityUserService,
        useExisting: userTableSetting.service
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
