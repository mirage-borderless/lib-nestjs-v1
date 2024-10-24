import { Module }                     from '@nestjs/common'
import { CommonAuthRepositoryModule } from '../conf/database/service/_module'
import { CommonJwtAutoDetect }        from './jwt.detect'
import { CommonAuthJwtGuard }         from './jwt.guard'
import { CommonAuthJwtService }       from './jwt.service'
import { ToastModule }                from '../../notify/toast/_module'

const MODULES = [
  CommonAuthRepositoryModule,
  ToastModule
]

const PROVIDERS = [
  CommonAuthJwtService,
  CommonAuthJwtGuard,
  CommonJwtAutoDetect
]

@Module({
  imports:   MODULES,
  providers: PROVIDERS,
  exports:   PROVIDERS,
})
export class CommonAuthJwtModule {}
