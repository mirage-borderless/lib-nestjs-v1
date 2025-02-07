import { IncrementBaseEntity } from '../../entity/increment.base-entity'
import { Column, Entity }      from 'typeorm'

/**
 * Table user mặc định
 */
export namespace Keypair {
  export type  Id = number & { readonly __brand: unique symbol }
  export const Id = (id: number) => id as Id

  @Entity('keypair')
  class KeyPairTable extends IncrementBaseEntity<Keypair.Id> {
    //~~~~~~~~~~~~~~
    //~~~[Column]~~~
    /* 1 */ @Column({ type: 'text' }) publicKey:  string
    /* 2 */ @Column({ type: 'text' }) privateKey: string
  }

  export type  Model = KeyPairTable
  export const Model = KeyPairTable
}
