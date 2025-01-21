import { InjectDataSource }                               from '@nestjs/typeorm'
import { EntityClassOrSchema }                            from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { DataSource, DataSourceOptions, type Repository } from 'typeorm'

export class DynamicRepository<T> {
  constructor(
    @InjectDataSource()
    protected readonly dataSource: DataSource,
    private   readonly entity:     EntityClassOrSchema
  ) {}

  /**
   * Sử dụng schema để switch sang database khác
   * */
  protected async switchDatabaseConnection(
    option: Partial<DataSourceOptions>
  ): Promise<Repository<T>> {
    const sourceOptions = <DataSourceOptions>{ ...this.dataSource.options, ...option }
    const schema        = new DataSource(sourceOptions)
    return await schema.initialize().then(_ => _.getRepository(this.entity))
  }
}
