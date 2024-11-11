import { ConfigService }                               from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { EntitySchema }                                from 'typeorm'

export class DatabasePostgresConnector implements TypeOrmOptionsFactory {

  constructor(
    private readonly tables: EntitySchema[] | Function[],
    private readonly configService: ConfigService
  ) {}

  createTypeOrmOptions(dsn: 'slave' | 'master' = 'master'): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    const configure = this.configService.get('db.mssql.???')
    return {
      name:                      dsn === 'master' ? undefined : dsn,
      type:                      'postgres',
      url:                       configure.connection.database.url,
      entities:                  this.tables,
      synchronize:               dsn === 'master',
      logging:                   ['error', 'query'],
      cache:                     false,
      migrationsTransactionMode: 'none',
      autoLoadEntities:          true,
      keepConnectionAlive:       true,
      retryAttempts:             1,
      retryDelay:                2000,
      verboseRetryLog:           true,
      replication: {
        master: {
          url: configure.connection.database.url,
        },
        slaves: [{
          url: configure.connection.database.url,
        }]
      }
    }
  }
}
