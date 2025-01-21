import { DynamicModule }                       from '@nestjs/common'
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { IdentityUser }                        from '../entity/identity-user.entity'

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
  entities?:   Function[]
}

export class AuthRepositoryModule {

  static forRoot<T extends IdentityUser.Model = IdentityUser.Model>(
    config: {
      dsn?:    'slave' | 'master',
      connect:  DatabaseConnection,
    }
  ): DynamicModule {
    function createTypeOrmOptions(dsn: 'slave' | 'master' = 'master'): TypeOrmModuleOptions {
      return {
        ...config.connect,
        database:                   config.connect.database ?? 'identity_user',
        type:                      'mssql',
        cache:                      false,
        migrationsRun:              false,
        migrationsTransactionMode: 'none',
        logging:                    true,
        name:                       dsn === 'master' ? undefined : dsn,
        synchronize:                dsn === 'master',
        retryAttempts:              1,
        verboseRetryLog:            true,
        options: {
          readOnlyIntent:         dsn === 'slave',
          trustServerCertificate: true,
        }
      }
    }
    const MODULES = [
      TypeOrmModule.forRoot(createTypeOrmOptions('slave')),
      TypeOrmModule.forRoot(createTypeOrmOptions('master')),
      TypeOrmModule.forFeature(config.connect.entities, 'slave'),
      TypeOrmModule.forFeature(config.connect.entities),
    ]
    return {
      module:  this,
      imports: MODULES,
      exports: MODULES,
      global:  true
    }
  }
}
