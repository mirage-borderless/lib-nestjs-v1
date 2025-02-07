import { UUIDBaseEntity } from '../../entity/uuid.base-entity'
import { Column, Entity } from 'typeorm'
import { v4 as uuid }     from 'uuid'

/**
 * Table user mặc định
 */
export namespace IdentityUser {
  export type  Id          = string & { readonly __brand: unique symbol }
  export const Id          = (id: string) => id as Id
  export type  IdToken     = string & { readonly __brand: unique symbol }
  export const NextIdToken = () => uuid() as IdToken

  export class JwtSign {
    id:      IdentityUser.Id
    idToken: IdentityUser.IdToken = IdentityUser.NextIdToken()

    constructor(public detail?: Model) {
      if (!!detail) {
        this.id = IdentityUser.Id(detail.id)
      }
    }
  }

  export enum Role {
    IS_NONE,
    IS_GUEST,
    IS_USER,
    IS_EDITOR,
    IS_OWNER,
  }

  @Entity('user')
  class IdentityUserTable extends UUIDBaseEntity<IdentityUser.Id> {
    //~~~~~~~~~~~~~~
    //~~~[Column]~~~
    /* 1 */ @Column({ type: 'nvarchar', width: 255, unique: true                    }) username: string
    /* 2 */ @Column({ type: 'nvarchar', width: 255,                                 }) password: string
    /* 3 */ @Column({ type: 'tinyint',  width: 4,   default: Role.IS_USER.valueOf() }) role:     Role
  }

  export type Model<T = IdentityUserTable> = T extends IdentityUserTable ? T : IdentityUserTable
  export const Model = IdentityUserTable
  export type ModelWithNoId<T = IdentityUserTable> = T extends IdentityUserTable ? Omit<T, 'id'> : Omit<IdentityUserTable, 'id'>
}
