import { DynamicModule, Module, Provider, Type }                   from '@nestjs/common'
import { getInjectionProviders }                                   from '@nestjs/common/module-utils/utils';
import { Constructor }                                             from '@nestjs/common/utils/merge-with-values.util';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { EntityClassOrSchema }                                     from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { Repository }                                              from 'typeorm'
import { IdentityUser }                                            from '../entity/identity-user.entity'
import { IdentityUserService }                                     from './identity-user.service'

export type DatabaseConnection = {
  host:        string,
  port:        number,
  /**
   * Default: identity_user
   */
  database?:   string,
  /**
   * Migrations path
   */
  migrations?: string[],
  username:    string,
  password:    string
}

function createTypeOrmOptions(
  dsn:     'slave' | 'master' = 'master',
  entities: any[],
  config:   DatabaseConnection,
): TypeOrmModuleOptions {
  return <TypeOrmModuleOptions>{
    ...config,
    database:                   config.database ?? 'identity_user',
    type:                      'mssql',
    cache:                      false,
    migrationsRun:              false,
    migrationsTransactionMode: 'none',
    logging:                    true,
    name:                      dsn === 'master' ? undefined : dsn,
    entities,
    synchronize:               dsn === 'master',
    retryAttempts:             1,
    verboseRetryLog:           true,
    options:                   {
      readOnlyIntent:         dsn === 'slave',
      trustServerCertificate: true,
    }
  }
}

@Module({})
export class AuthRepositoryModule {

  static forRoot<U extends IdentityUserService<T>, T extends IdentityUser.Model = IdentityUser.Model>(
    config: {
      dsn?:    'slave' | 'master',
      entity:   EntityClassOrSchema,
      connect:  DatabaseConnection,
      provider: Constructor<U>
    }
  ): DynamicModule {
    const MODULES = [
      TypeOrmModule.forRoot(createTypeOrmOptions('slave',  [config.entity], config.connect)),
      TypeOrmModule.forRoot(createTypeOrmOptions('master', [config.entity], config.connect)),
      TypeOrmModule.forFeature([config.entity], 'slave'),
      TypeOrmModule.forFeature([config.entity]),
    ]
    const PROVIDERS: Provider[] = [
      {
        provide:    IdentityUserService<T>,
        inject:     [getRepositoryToken(config.entity, config.dsn ?? 'slave')],
        useFactory: (repository: Repository<T>) => new IdentityUserService<T>(repository)
      },
      {
        provide:    'UserService',
        inject:     [getRepositoryToken(config.entity, 'slave'), getRepositoryToken(config.entity)],
        useFactory: (salve: Repository<T>, master: Repository<T>) => new config.provider(salve, master) as U,
        useClass:    config.provider
      }
    ]
    return {
      imports:   MODULES,
      module:    this,
      providers: PROVIDERS,
      exports:   [...MODULES, ...PROVIDERS,],
      global:    true
    }
  }
}
