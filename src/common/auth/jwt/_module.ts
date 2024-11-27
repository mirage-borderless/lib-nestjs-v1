import { Module }                     from '@nestjs/common'
import { CommonAuthRepositoryModule } from '../conf/database/service/_module'
import { CommonAuthJwtGuard }         from './jwt.guard'
import { CommonAuthJwtService }       from './jwt.service'
import { ToastModule }                from '../../notify'

const MODULES = [
  CommonAuthRepositoryModule,
  ToastModule,
]

const PROVIDERS = [
  CommonAuthJwtService,
  CommonAuthJwtGuard
]

@Module({
  imports:   MODULES,
  providers: PROVIDERS,
  exports:   PROVIDERS,
})
export class CommonAuthJwtModule {}
