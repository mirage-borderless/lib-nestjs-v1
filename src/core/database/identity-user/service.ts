import { Injectable }               from '@nestjs/common'
import { Constructor }              from '@nestjs/common/utils/merge-with-values.util'
import { DeleteResult, Repository } from 'typeorm'
import { IdentityUser }             from './entity/identity-user.entity'

@Injectable()
export abstract class IdentityUserService<T extends IdentityUser.Model = IdentityUser.Model> {
  abstract add(user: IdentityUser.ModelWithNoId):  Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract update(user: T):                        Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract get(id: IdentityUser.Id):               Promise<T>
  abstract findByUsername(username: string):       Promise<T>
  abstract remove(id: IdentityUser.Id):            Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract removeByCriteria(criteria: Partial<T>): Promise<DeleteResult>

  static get instance(): Constructor<IdentityUserService> {
    return class extends IdentityUserService {

      add(user: IdentityUser.ModelWithNoId): Promise<IdentityUser.Model> | Promise<boolean> | Promise<number> | Promise<void> {
        return Promise.resolve(undefined)
      }

      findByUsername(username: string): Promise<IdentityUser.Model> {
        return Promise.resolve(undefined)
      }

      get(id: IdentityUser.Id): Promise<IdentityUser.Model> {
        return Promise.resolve(undefined)
      }

      remove(id: IdentityUser.Id): Promise<IdentityUser.Model> | Promise<boolean> | Promise<number> | Promise<void> {
        return Promise.resolve(undefined)
      }

      update(user: IdentityUser.Model): Promise<IdentityUser.Model> | Promise<boolean> | Promise<number> | Promise<void> {
        return this.repository.save(user)
      }

      removeByCriteria(criteria: Partial<IdentityUser.Model>): Promise<DeleteResult> {
        return this.repository.delete(criteria)
      }
      constructor(private readonly repository: Repository<IdentityUser.Model>) {super()}
    }
  }
}
