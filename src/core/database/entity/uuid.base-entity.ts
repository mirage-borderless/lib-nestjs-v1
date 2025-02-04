import { PrimaryGeneratedColumn } from 'typeorm'
import { DefaultBaseEntity }      from './default.base-entity'

export class UUIDBaseEntity<T = string & { readonly __brand: unique symbol }> extends DefaultBaseEntity {
  @PrimaryGeneratedColumn('uuid') id: T
}
