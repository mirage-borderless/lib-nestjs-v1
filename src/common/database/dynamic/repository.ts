import { InjectDataSource }                               from '@nestjs/typeorm'
import { EntityClassOrSchema }                            from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { sprintf }                                        from 'sprintf-js'
import { DataSource, DataSourceOptions, type Repository } from 'typeorm'

export class DynamicRepository<T> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private   readonly entity:     EntityClassOrSchema
  ) {}

  /**
   * @deprecated
   * */
  protected useDatabase(dbName: string): Repository<T> {
    const table = this.dataSource.getMetadata(this.entity)
    table.tablePath = sprintf('%s.dbo.%s', dbName, table.tableName)
    return table.connection.getRepository(this.entity)
  }

  /**
   * Sử dụng schema để switch sang database khác
   * */
  protected async switchSchema(option: Partial<DataSourceOptions>): Promise<Repository<T>> {
    const sourceOptions = { ...this.dataSource.options, ...option } as DataSourceOptions
    const schema        = new DataSource(sourceOptions)
    return await schema.initialize().then(_ => _.getRepository(this.entity))
  }
}
