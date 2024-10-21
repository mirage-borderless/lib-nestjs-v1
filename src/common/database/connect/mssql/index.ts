import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { EntitySchema }                                from 'typeorm'

export class DatabaseMssqlConnector implements TypeOrmOptionsFactory {

  constructor(
    private readonly dbName: string,
    private readonly tables: EntitySchema[] | Function[],
    private readonly config: DatabaseSetting
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
      entities:                  this.tables,
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
