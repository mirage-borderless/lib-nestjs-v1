import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService }                        from '@nestjs/jwt'
import { IdentityUser, IdentityUserService } from 'src/common/database/auth'
import { FunctionStatic }                    from 'src/util'
import { hash }                              from 'typeorm/util/StringUtils'

@Injectable()
export class AuthenticateService<T extends IdentityUser.Model = IdentityUser.Model> {

  constructor(
    private readonly userService: IdentityUserService<T>,
    private readonly jwtService:  JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<T> {
    // const user = await this.accountService.findByUsername(username)
    // if (!!user && user.password === hash(pass)) {
    //   return user
    // }
    // return null

    return { username: 'admin', password: '' } as T
  }

  async signIn(username: string, pass: string) {
    const user = await this.userService.findByUsername(username)
    if (!!user) {
      if (user.password === hash(pass)) {
        const jwtUserSign: JwtUserSign<T> = new IdentityUser.JwtSign<T>(user)
        return this.jwtService.sign(FunctionStatic.encrypt(jwtUserSign), {
          secret: 'secret'
        })
      }
      throw new UnauthorizedException('authenticate.sign_in.wrong_pass')
    }
    throw new UnauthorizedException('authenticate.sign_in.not_exist_user')
  }
}
