import { Injectable }       from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import crypto               from 'crypto'
import { Keypair }          from './entity/keypair'
import { Repository }       from 'typeorm'

@Injectable()
export class KeypairService {

  constructor(
    @InjectRepository(Keypair.Model)
    private readonly keypairRepository: Repository<Keypair.Model>
  ) {}

  public async get() {
    let keypair = await this.keypairRepository.findOne({ where: { id: Keypair.Id(1) }, cache: true })
    if (!keypair) {
      keypair = new Keypair.Model()
      crypto.generateKeyPair('rsa', {
        modulusLength:      2048,
        publicKeyEncoding:  { type: 'spki',  format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      }, async (err: Error | null, publicKey: string, privateKey: string) => {
        keypair.privateKey = privateKey
        keypair.publicKey  = publicKey
        await this.keypairRepository.save(keypair, { reload: false })
      })
    }
    return keypair
  }
}