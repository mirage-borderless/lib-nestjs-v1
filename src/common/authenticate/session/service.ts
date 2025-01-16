import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService }                        from '@nestjs/jwt'
import { ErrorMessage }                      from 'src/common/authenticate/session/constants'
import { IdentityUser, IdentityUserService } from 'src/common/database/auth'
import { FunctionStatic }                    from 'src/util'
import { hash }                              from 'typeorm/util/StringUtils'

@Injectable()
export class AuthenticateService<T extends IdentityUser.Model = IdentityUser.Model> {

  constructor(
    private readonly userService: IdentityUserService<T>,
    private readonly jwtService:  JwtService
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.userService.findByUsername(username)
    if (!!user) {
      if (user.password === hash(pass)) {
        const jwtUserSign: JwtUserSign = new IdentityUser.JwtSign(user)
        return this.jwtService.sign({ data: FunctionStatic.encrypt(jwtUserSign) })
      }
      throw new UnauthorizedException(ErrorMessage.SIGN_IN.wrongPass)
    }
    throw new UnauthorizedException(ErrorMessage.SIGN_IN.notExistUser)
  }
}
