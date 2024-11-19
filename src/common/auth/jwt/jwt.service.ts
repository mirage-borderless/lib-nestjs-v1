import { Injectable, Scope, UnauthorizedException } from '@nestjs/common'
import { FunctionStatic }                           from '../../../util'
import { hash }                                     from 'typeorm/util/StringUtils'
import { v4 as uuidv4 }                             from 'uuid'
import { IdentityUser }                             from '../conf/database/entity/identity-user.entity'
import { IdentityUserService }                      from '../conf/database/service/identity-user.service'
import { CommonJwtAutoDetect }                      from './jwt.detect'

@Injectable({ scope: Scope.REQUEST })
export class CommonAuthJwtService<T extends IdentityUser.Model = IdentityUser.Model> {

  constructor(
    private readonly identityRepo: IdentityUserService<T>,
  ) {}

  private async authenticate(claim: T | { [K in keyof IdentityUser.Model]?: any }) {
    const identityUser = await this.identityRepo.findByUsername(claim.username)
    if (!identityUser) {
      const validators: Validators = {
        values$: claim,
        errors: {
          username: { invalid: 'common.auth.username.not_exist' }
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
          password: { invalid :
              'common.auth.password.wrong'
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
      accessToken: await FunctionStatic.encrypt(verify),
      verify
    }
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
    const verify = await FunctionStatic.decrypt(token.replace('Bearer ', ''))
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
