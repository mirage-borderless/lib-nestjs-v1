import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthenticateService {

  async validateUser(username: string, pass: string): Promise<any> {
    return { username, pass }
  }
}
