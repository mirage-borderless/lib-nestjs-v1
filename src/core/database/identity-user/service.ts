import { Injectable }               from '@nestjs/common'
import { Constructor }              from '@nestjs/common/utils/merge-with-values.util'
import { ConfigService }            from '@nestjs/config'
import crypto                       from 'crypto'
import { DeleteResult, Repository } from 'typeorm'
import { Keypair }                  from './entity/keypair'
import { IdentityUser }             from './entity/user.entity'

@Injectable()
export abstract class IdentityUserService<T extends IdentityUser.Model = IdentityUser.Model> {
  abstract add(user: IdentityUser.ModelWithNoId):  Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract update(user: T):                        Promise<T> | Promise<boolean> | Promise<number> | Promise<void>
  abstract get(id: IdentityUser.Id):               Promise<T>
  abstract findByUsername(username: string):       Promise<T>
  abstract remove(id: IdentityUser.Id):            Promise<DeleteResult>
  abstract removeByCriteria(criteria: Partial<T>): Promise<DeleteResult>
  abstract getKeyPair():                           Promise<Keypair.Model>

  static get instance(): Constructor<IdentityUserService> {
    return class extends IdentityUserService {

      add(user: IdentityUser.ModelWithNoId): Promise<IdentityUser.Model> | Promise<boolean> | Promise<number> | Promise<void> {
        return this.repository.save(user)
      }

      findByUsername(username: string): Promise<IdentityUser.Model> {
        return this.repository.findOne({ where: { username } })
      }

      get(id: IdentityUser.Id): Promise<IdentityUser.Model> {
        return this.repository.findOne({ where: { id } })
      }

      remove(id: IdentityUser.Id): Promise<DeleteResult> {
        return this.repository.delete({ id })
      }

      update(user: IdentityUser.Model): Promise<IdentityUser.Model> | Promise<boolean> | Promise<number> | Promise<void> {
        return this.repository.save(user)
      }

      removeByCriteria(criteria: Partial<IdentityUser.Model>): Promise<DeleteResult> {
        return this.repository.delete(criteria)
      }

      async getKeyPair() {
        let keypair = await this.keypairService.createQueryBuilder().getOne()
        if (!keypair) {
          keypair = new Keypair.Model()
          crypto.generateKeyPair('rsa', {
            modulusLength:        2048,
            publicKeyEncoding:  { type: 'spki',  format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          }, async (err: Error | null, publicKey: string, privateKey: string) => {
            keypair.privateKey = privateKey
            keypair.publicKey  = publicKey
            await this.keypairService.save(keypair)
          })
        }
        return keypair
      }

      constructor(
        private readonly repository:     Repository<IdentityUser.Model>,
        private readonly keypairService: Repository<Keypair.Model>,
        private readonly configService:  ConfigService
      ) {super()}
    }
  }
}
