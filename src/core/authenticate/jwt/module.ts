import { Module, Provider }    from '@nestjs/common'
import { JwtModule }           from '@nestjs/jwt'
import { PassportModule }      from '@nestjs/passport'
import { AuthenticateService } from './service'
import { JwtStrategy }         from './strategy'

const MODULES = [
  PassportModule,
  JwtModule.register({
    secret:       'hieuht',
    signOptions: { expiresIn: '60s' }
  })
]

const PROVIDERS: Provider[] = [
  JwtStrategy,
  AuthenticateService,
]

@Module({
  imports:    MODULES,
  providers:  PROVIDERS,
  exports:   [AuthenticateService]
})
export class AuthenticateModule {}
