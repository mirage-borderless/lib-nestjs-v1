import { InjectDataSource }            from '@nestjs/typeorm'
import { EntityClassOrSchema }         from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { sprintf }                     from 'sprintf-js'
import { DataSource, type Repository } from 'typeorm'

export class DynamicRepository<T> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private   readonly entity:     EntityClassOrSchema
  ) {}

  protected useDatabase(dbName: string): Repository<T> {
    const table = this.dataSource.getMetadata(this.entity)
    table.tablePath = sprintf('%s.dbo.%s', dbName, table.tableName)
    return table.connection.getRepository(this.entity)
  }
}
