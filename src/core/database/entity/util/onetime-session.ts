import { IdentityUser }                               from '../../identity-user'
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm'
import { UUIDBaseEntity }                             from '../uuid.base-entity'

export namespace OnetimeSession {
  /**
   * Declare types
   * */
  export type  Id = string & { readonly __brand: unique symbol }
  export const Id = (id: string): Id => id as Id

  @Entity('onetime_session')
  class OnetimeSessionTable extends UUIDBaseEntity<Id> {
    /* 1 */ @Column({ name: 'content', type: 'text'   }) content: any
    /* 2 */ @Column({ name: 'expired', type: 'bigint' }) expired: number

    isExpired(): boolean {
      return this.expired < Date.now()
    }

    @BeforeInsert()
    onInsert() {
      if (typeof this.content === 'object') {
        this.content = JSON.stringify(this.content)
      }
    }

    @BeforeUpdate()
    onUpdate() {
      if (typeof this.content === 'object') {
        this.content = JSON.stringify(this.content)
      }
    }

    decodeContent<T extends Content>(): T {
      try {
        return JSON.parse(this.content) as T
      } catch (e) {
        return this.content
      }
    }

    setContent(content: Content): this {
      this.content = content
      return this
    }

    constructor(expiredMs?: number) {
      super()
      if (expiredMs > 0) {
        this.expired = Date.now() + expiredMs
      }
    }
  }

  export const Model                                                      = OnetimeSessionTable
  export type  Model<T extends OnetimeSessionTable = OnetimeSessionTable> = T extends OnetimeSessionTable ? T : OnetimeSessionTable
  export interface Content {
    userid:        IdentityUser.Id,
    username:      string,
    idToken:       IdentityUser.IdToken,
    [key: string]: any
  }
}
