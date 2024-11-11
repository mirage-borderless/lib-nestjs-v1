import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'

export class DatabaseMssqlConnector implements TypeOrmOptionsFactory {

  constructor(
    private readonly dbName: string,
    private readonly config: DbConfigHostSpec
  ) {}

  createTypeOrmOptions(dsn: 'slave' | 'master' = 'master'): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    const options  = this.config[this.dbName]?.options || {}
    const entities = options.entities || []
    return {
      name:                      dsn === 'master' ? undefined : dsn,
      type:                      'mssql',
      username:                  this.config.host_spec.username,
      password:                  this.config.host_spec.password,
      port:                      this.config.host_spec.port,
      host:                      this.config.host_spec.host,
      database:                  this.dbName,
      entities:                  entities,
      synchronize:               dsn === 'master',
      logging:                   ['error', 'query', 'log'],
      cache:                     false,
      migrationsTransactionMode: 'none',
      autoLoadEntities:          true,
      retryAttempts:             1,
      verboseRetryLog:           true,
      options:                   {
        ...options,
        readOnlyIntent:         dsn === 'slave',
        trustServerCertificate: true,
      }
    }
  }
}
