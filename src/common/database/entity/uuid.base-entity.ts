import { PrimaryGeneratedColumn } from 'typeorm'
import { DefaultBaseEntity }      from '../../database/entity/default.base-entity'

export class UUIDBaseEntity<T = string & { readonly __brand: unique symbol }> extends DefaultBaseEntity {
  @PrimaryGeneratedColumn('uuid') id: T
}
