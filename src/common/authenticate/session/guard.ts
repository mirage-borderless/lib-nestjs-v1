import { Injectable } from '@nestjs/common'
import { AuthGuard }  from '@nestjs/passport'

@Injectable()
export class AuthenticatedAsUser extends AuthGuard('cookie-session') {}