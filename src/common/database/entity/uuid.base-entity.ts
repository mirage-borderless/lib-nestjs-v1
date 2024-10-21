import { PrimaryGeneratedColumn } from 'typeorm'
import { DefaultBaseEntity }      from 'src/common/database/entity/default.base-entity'

export class UUIDBaseEntity<T = string & { readonly __brand: unique symbol }> extends DefaultBaseEntity {
  @PrimaryGeneratedColumn('uuid') id: T
}
