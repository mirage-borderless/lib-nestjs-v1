import { ToastService } from './toast.service'
import { Module }       from '@nestjs/common'

@Module({
  providers: [ToastService],
  exports:   [ToastService]
})
export class ToastModule {}
