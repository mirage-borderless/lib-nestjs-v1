import { Injectable, Scope, UnauthorizedException } from '@nestjs/common'
import { I18nService }                              from 'nestjs-i18n'
import { JWE, JWK, parse }                          from 'node-jose'
import { sprintf }                                  from 'sprintf-js'
import { hash }                                     from 'typeorm/util/StringUtils'
import { v4 as uuidv4 }                             from 'uuid'
import { IdentityUser }                             from '../conf/database/entity/identity-user.entity'
import { IdentityUserService }                      from '../conf/database/service/identity-user.service'
import { CommonJwtAutoDetect }                      from './jwt.detect'

@Injectable({ scope: Scope.REQUEST })
export class CommonAuthJwtService<T extends IdentityUser.Model = IdentityUser.Model> {

  constructor(
    private readonly identityRepo: IdentityUserService<T>,
    private readonly i18nService:  I18nService
  ) {}

  private async authenticate(claim: T | { [K in keyof IdentityUser.Model]?: any }) {
    const identityUser = await this.identityRepo.findByUsername(claim.username)
    if (!identityUser) {
      const validators: Validators = {
        values$: claim,
        errors: {
          username: {
            invalid: this.i18nService.translate(
              'common.auth.username.not_exist',
              { args: { username: claim.username } }
            )
          }
        }
      }
      throw new UnauthorizedException(validators)
    }
    const payload = {
      username: claim.username,
      password: hash(claim.password),
      exp:      Date.now() + 86400000
    }
    if (identityUser.password !== payload.password) {
      const validators: Validators = {
        values$: claim,
        errors: {
          password: { invalid : this.i18nService.translate(
              'common.auth.password.wrong'
            )
          }
        }
      }
      throw new UnauthorizedException(validators)
    }
    const verify: JwtUserSign<T> = {
      ...payload,
      id:      identityUser.id as IdentityUser.Id,
      idToken: uuidv4()        as IdentityUser.IdToken,
      detail:  identityUser
    }
    return {
      accessToken: await this.encrypt(verify),
      verify
    }
  }

  public async encrypt(
    raw:         JwtUserSign<T>,
    format:      "general" | "compact" | "flattened" | undefined = 'compact',
    contentAlg = "A256GCM",
    alg        = "RSA-OAEP"
  ) {
    const _publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn/RPKjXvesflD4UuLKMg
+8r33Ym/XzyZNtL1JOAogFs4zt1EZk9dF0p8unlTNteQ4Bw4rHxNk8iH+7bK9Ll1
CLI3OiOapR2V5smatZTuPTxzFz6zQx0DqlxDlUMqYubZOmyCQHu1P0tEpkHhyBuu
lJtXRO2JUcLlUIk392a/B0Xh/K5AJ1XUeKYNovQ2N2tBJxahR04VzoG2kiOopK8m
DeH2TbmfSYlih83miLUwUnmGfO7FJbSK/X9cRTWeB0dMdTXpe73OiebkYY25IuPL
j0XRGT+VQ1T30DznDEgTX4e5pnudtkSVddp6H02NizLbrVjOZEvETmaxhQn84U2l
EwIDAQAB
-----END PUBLIC KEY-----`
    const publicKey = await JWK.asKey(_publicKey, "pem")
    const buffer    = Buffer.from(JSON.stringify(raw))
    return await JWE.createEncrypt({
      format,
      contentAlg: contentAlg,
      fields:     { alg: alg }
    }, publicKey).update(buffer).final()
  }

  private async decrypt(encryptedBody: string) {
    const _privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCf9E8qNe96x+UP
hS4soyD7yvfdib9fPJk20vUk4CiAWzjO3URmT10XSny6eVM215DgHDisfE2TyIf7
tsr0uXUIsjc6I5qlHZXmyZq1lO49PHMXPrNDHQOqXEOVQypi5tk6bIJAe7U/S0Sm
QeHIG66Um1dE7YlRwuVQiTf3Zr8HReH8rkAnVdR4pg2i9DY3a0EnFqFHThXOgbaS
I6ikryYN4fZNuZ9JiWKHzeaItTBSeYZ87sUltIr9f1xFNZ4HR0x1Nel7vc6J5uRh
jbki48uPRdEZP5VDVPfQPOcMSBNfh7mme522RJV12nofTY2LMtutWM5kS8ROZrGF
CfzhTaUTAgMBAAECggEAE7+qvIfvOuYOQnXLhyhW7K+ZHcmhjqUhN5MhQD3K0low
792C0ezvje4c6zsKiqVf1kO1vZoVS+9A1tOxSDjTmdDDH9MAh21ZMibnCo9KQNZD
UXXk1R7ycmi00Wt7Ar4EyQFXrZV4gcmNvsc4lKfSTLfHNRPs1eLtxB1FAy8027VT
nKL1xlybbLpZSs9XQKRKP8a649+IhyIYiEgTWLPvDK832iQMU7d9uBCLGDe0k/hZ
VdTG8RvfdwbMs6G1d539/DwmtD5rcGeIgISDCC719DvrTQyoFknGmOv9JmfV1kzg
P4nxBmgY+/mfUxcNJXMHNbwDdNQsCvTr4YyM6t6WNQKBgQDQ4ih9/RiPu3Mq3cQ3
yUuqrlVi9YhiMRgwoHjjnKv5DSPQoJafKQ987gWKEn54ZRq6EpoY3YxJIGkvaSAQ
+VCZeRXE/6TdaLq86WHzDKDy1+ug8HJyKQMCx8cFCuzuLD9d8DJQPiM5n4pmGobJ
SXFuI9LjBfwqF2oUEbuAmJ4JNwKBgQDECMVu2gI9DmOv4BNgDNnAAq6WZZB5PLzq
holzXUzKLWxUbRallgB0ts1nBUmpDT9/q92YHbyC4hfIFB4/lAgUwV6E36ii9RHd
p/GzTbUKQWCwS3piHKZfD+B8Oo7p18dF6oPQuZHmKCQ3369EkLgGvJBu3IsF3Ac8
Gc3w12PBBQKBgCaJgwTze+OQpsfC0F+mcKJVtYUjXX0YJ6lZAdSkZAn3xaLI7eEB
V00qMLVvggu+Q3cO1YU+4pHfO+i2UWcwSBF4iG6m54i9uK3/tMV9j/gdo+g2VDcB
n/+UUgB5KosqeKphFTc+r4sDByqdPD7IoPe7/j1KLmKpnTWEq/4mqglzAoGBAJyT
zO6fnw4ZgjImLhOX8AzXl491DBJqGxLP5tWIfh82bMJ6Z45W44JVyHYy2QT4GfHl
2pb3mWyJHimnOAncOSAq204SPuX6DQ0YaYun06SfV5U4lEXtUE25prpTI3dP7FDB
4gtDTW+iPFuMhLelR/fJgSuraDeD6RtuGPn3cCvpAoGALVMsCmJeoaADU0LNCz+t
CLfdi+LaZarbCwoWuTLaPM4PrpC+WPBChLhe6GJgUZ0hjoDiblZWQ9tpNdo/axLi
cPcxsYkAchMZa7ZqRSbHCFpUFepxupZXzt9o2hDTTHSt6/pMMDM6vtSvPotCzrcs
2zxNEP22bafCIRJC8dv5ozA=
-----END PRIVATE KEY-----`
    const keystore = JWK.createKeyStore()
    await keystore.add(await JWK.asKey(_privateKey, 'pem'))
    const outPut       = parse.compact(encryptedBody.replace('Bearer ', ''))
    const decryptedVal = await outPut.perform(keystore) as JWE.DecryptResult
    return Buffer.from(decryptedVal.plaintext).toString()
  }

  /**
   * Tạo ra accessToken
   */
  public async authenticateAndSetJwtCookie(claim: T | { [K in keyof IdentityUser.Model]?: any }) {
    return await this.authenticate(claim)
  }

  /**
   * Decode token -> JwtUserSign
   * */
  public async decode(token: string): Promise<JwtUserSign<T>> {
    const verify = await this.decrypt(token.replace('Bearer ', ''))
    if (!!verify) return JSON.parse(verify) as JwtUserSign<T>
    return null
  }

  public getAccessToken(request: FastifyRequest, from?: 'header' | 'cookie') {
    const tokenFromHeader: string = request.headers[CommonJwtAutoDetect.HEADER_VIA_AUTHORIZATION] as string
    const tokenFromCookie: string = request.cookies[CommonJwtAutoDetect.COOKIE_VIA_AUTHORIZATION] as string
    return !from ? tokenFromHeader || tokenFromCookie : from === 'header' ? tokenFromHeader : tokenFromCookie
  }

  public logout(response: FastifyReply) {
    response.clearCookie(CommonJwtAutoDetect.COOKIE_VIA_AUTHORIZATION)
  }
}
