import { Injectable }   from '@nestjs/common'
import { Repository }   from 'typeorm'
import { IdentityUser } from '../entity/identity-user.entity'

@Injectable()
export abstract class IdentityUserService<T extends IdentityUser.Model = IdentityUser.Model> {
  abstract add(user: IdentityUser.ModelWithNoId): Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract update(user: T):                       Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract get(id: IdentityUser.Id):              Promise<T>
  abstract findByUsername(username: string):      Promise<T>
  abstract remove(id: IdentityUser.Id):           Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract remove(username: string):              Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
}
