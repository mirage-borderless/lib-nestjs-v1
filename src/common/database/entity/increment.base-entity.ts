import { DefaultBaseEntity }      from 'src/common/database/entity/default.base-entity'
import { PrimaryGeneratedColumn } from 'typeorm'

export class IncrementBaseEntity<T> extends DefaultBaseEntity {
  @PrimaryGeneratedColumn('increment') id: T
}
