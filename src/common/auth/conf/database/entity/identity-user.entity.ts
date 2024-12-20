import { UUIDBaseEntity } from '../../../../database/entity/uuid.base-entity'
import { Column, Entity } from 'typeorm'

/**
 * Table user mặc định
 */
export namespace IdentityUser {
  export type  Id      = string & { readonly __brand: unique symbol }
  export const Id      = (id: string) => id as Id
  export type  IdToken = string & { readonly __brand: unique symbol }

  export class JwtSign<T extends IdentityUser.Model = IdentityUser.Model> {
    id:       IdentityUser.Id
    username: string
    password: string
    exp:      number
    idToken:  IdentityUser.IdToken
    detail:   T
  }

  export enum Role {
    IS_GUEST,
    IS_VIEWER,
    IS_EDITOR,
    IS_OWNER,
  }

  @Entity('user')
  class IdentityUserTable extends UUIDBaseEntity<IdentityUser.Id> {
    //~~~~~~~~~~~~~~
    //~~~[Column]~~~
    /* 1 */ @Column({ type: 'nvarchar', width: 255, unique: true                      }) username: string
    /* 2 */ @Column({ type: 'nvarchar', width: 255,                                   }) password: string
    /* 3 */ @Column({ type: 'tinyint',  width: 4,   default: Role.IS_VIEWER.valueOf() }) role:     Role
  }

  export type  Model = IdentityUserTable
  export const Model = IdentityUserTable
}
