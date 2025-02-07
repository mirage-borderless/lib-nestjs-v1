import { UUIDBaseEntity } from '../../entity/uuid.base-entity'
import { Column, Entity } from 'typeorm'

/**
 * Table user mặc định
 */
export namespace Keypair {
  export type Id = string & { readonly __brand: unique symbol }

  @Entity('keypair')
  class KeyPairTable extends UUIDBaseEntity<Keypair.Id> {
    //~~~~~~~~~~~~~~
    //~~~[Column]~~~
    /* 1 */ @Column({ type: 'text' }) publicKey:  string
    /* 2 */ @Column({ type: 'text' }) privateKey: string
  }

  export type  Model = KeyPairTable
  export const Model = KeyPairTable
}
