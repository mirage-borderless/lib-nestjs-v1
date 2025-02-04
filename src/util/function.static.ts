import * as crypto         from 'crypto'
import { JWE, JWK, parse } from 'node-jose'

export class FunctionStatic {

  static  async encrypt(
    raw:         any,
    _publicKey: string = '',
    format:      "general" | "compact" | "flattened" | undefined = 'compact',
    contentAlg = "A256GCM",
    alg        = "RSA-OAEP",
  ) {
    const publicKey = await JWK.asKey(_publicKey, "pem")
    const buffer    = Buffer.from(JSON.stringify(raw))
    return await JWE.createEncrypt({
      format,
      contentAlg: contentAlg,
      fields:     { alg: alg }
    }, publicKey).update(buffer).final()
  }

  static stringToMD5(Message: string): string {
    const hash = crypto.createHash('md5')
    hash.update(Message, 'utf8')
    return hash.digest('hex')
  }

  static replaceInvalidCharacter(input: string) {
    return input.replace(/[^\w\s\-_]/ug, '')
  }

  static async decrypt(encryptedBody: string, _privateKey: string) {
    const keystore = JWK.createKeyStore()
    await keystore.add(await JWK.asKey(_privateKey, 'pem'))
    const outPut       = parse.compact(encryptedBody)
    const decryptedVal = await outPut.perform(keystore) as JWE.DecryptResult
    return Buffer.from(decryptedVal.plaintext).toString()
  }
}
