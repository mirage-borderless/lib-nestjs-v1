import { ToastService } from './service'
import { Module }       from '@nestjs/common'

@Module({
  providers: [ToastService],
  exports:   [ToastService]
})
export class ToastModule {}
