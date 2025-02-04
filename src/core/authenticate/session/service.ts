import { forwardRef, Inject, Injectable, Optional, UnauthorizedException } from '@nestjs/common'
import { ConfigService }                                                   from '@nestjs/config'
import { JwtService }                                                      from '@nestjs/jwt'
import { hash }                                                            from 'typeorm/util/StringUtils'
import { FunctionStatic }                                                  from '../../../util'
import { ToastService }                                                    from '../../../util/notify'
import { IdentityUser, IdentityUserService }                               from '../../database'
import { ErrorMessage }                                                    from './constants'

@Injectable()
export class AuthenticateService<T extends IdentityUser.Model = IdentityUser.Model> {

  constructor(
    @Optional()
    private readonly toastService: ToastService,
    @Inject(forwardRef(() => IdentityUserService<T>))
    private readonly userService:   IdentityUserService<T>,
    private readonly jwtService:    JwtService,
    private readonly configService: ConfigService
  ) { }

  async signIn(claim: Pick<IdentityUser.Model, 'username' | 'password'>) {
    const user = await this.userService.findByUsername(claim.username)
    if (!!user) {
      if (user.password === hash(claim.password)) {
        const jwtUserSign: JwtUserSign = new IdentityUser.JwtSign(user)
        if (!!this.toastService) {
          this.toastService.addClient(jwtUserSign.idToken)
        }
        return {
          token: this.jwtService.sign({
            data: this.configService.get<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPTED', false)
              ? await FunctionStatic.encrypt(jwtUserSign, this.configService.get<string>('MIRAGE_CRYPTO_PUBLIC_KEY'))
              : jwtUserSign
          }),
          data: jwtUserSign
        }
      }
      throw new UnauthorizedException(ErrorMessage.SIGN_IN.wrongPass)
    }
    throw new UnauthorizedException(ErrorMessage.SIGN_IN.notExistUser)
  }

  async signInTest(user: IdentityUser.JwtSign) {
    if (!!this.toastService) {
      this.toastService.addClient(user.idToken)
    }
    return {
      token: this.jwtService.sign({
        data: this.configService.get<boolean>('MIRAGE_AUTHENTICATE_PASSPORT_JWT_ENCRYPTED', false)
          ? await FunctionStatic.encrypt(user, this.configService.get<string>('MIRAGE_CRYPTO_PUBLIC_KEY'))
          : JSON.stringify(user)
      }),
      data: user
    }
  }

  async signOut(user: JwtUserSign) {
    if (!!this.toastService) {
      this.toastService.removeClient(user.idToken)
    }
  }
}
