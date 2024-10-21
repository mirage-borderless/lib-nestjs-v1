import { ToastService } from 'src/common/notify/toast/toast.service'
import { Module }       from '@nestjs/common'

@Module({
  providers: [ToastService],
  exports:   [ToastService]
})
export class ToastModule {}
