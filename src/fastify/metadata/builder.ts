import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable }                                                 from 'rxjs'

@Injectable()
export class MvcHttpMetadataInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler()
    context.switchToHttp().getResponse<FastifyReply>().buildViewValue(handler)
    return next.handle()
  }
}
