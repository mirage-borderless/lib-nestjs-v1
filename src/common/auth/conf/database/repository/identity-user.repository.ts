import { Injectable }   from '@nestjs/common'
import { Repository }   from 'typeorm'
import { IdentityUser } from '../entity/identity-user.entity'

@Injectable()
export class IdentityUserRepository<T extends IdentityUser.Model = IdentityUser.Model> {
  
  constructor(private readonly _repository: Repository<T>) {}

  public async get(id: IdentityUser.Id) {
    return this._repository.createQueryBuilder().where({ id }).getOne()
  }

  public async findByUsername(username: string): Promise<T> {
    return this._repository.createQueryBuilder().where({ username }).getOne()
  }
}
