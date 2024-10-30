import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { EntitySchema }                                from 'typeorm'
import { MixedList }                                   from 'typeorm/common/MixedList'

export class DatabaseMssqlConnector implements TypeOrmOptionsFactory {

  constructor(
    private readonly dbName:   string,
    private readonly entities: MixedList<Function | string | EntitySchema>,
    private readonly config:   DatabaseSetting
  ) {}

  createTypeOrmOptions(dsn: 'slave' | 'master' = 'master'): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      name:                      dsn === 'master' ? undefined : dsn,
      type:                      'mssql',
      username:                  this.config.host_spec.username,
      password:                  this.config.host_spec.password,
      port:                      this.config.host_spec.port,
      host:                      this.config.host_spec.host,
      database:                  this.dbName,
      entities:                  this.entities,
      synchronize:               dsn === 'master',
      logging:                   ['error', 'query', 'log'],
      cache:                     false,
      migrationsTransactionMode: 'none',
      autoLoadEntities:          true,
      retryAttempts:             1,
      verboseRetryLog:           true,
      options:                   {
        readOnlyIntent:         dsn === 'slave',
        trustServerCertificate: true
      }
    }
  }
}
