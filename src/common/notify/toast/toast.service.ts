import { IdentityUser } from '../../auth/conf/database/entity/identity-user.entity'
import { Toast }        from './model'
import { Injectable }   from '@nestjs/common'
import { Subject }      from 'rxjs'

/**
 * Service thông báo đẩy
 */
@Injectable()
export class ToastService {

  readonly channel$ = new Map<IdentityUser.IdToken, Subject<Toast>>()

  /**
   * Thêm client vào các kênh, hàng chờ toast
   * */
  public sendToClient(idToken: IdentityUser.IdToken, payload: Toast) {
    if (!this.channel$.has(idToken)) {
      this.addClient(idToken)
    }
    setTimeout(() => this.channel$.get(idToken).next(payload), 500)
  }

  public sendToClientOneTime(idToken: IdentityUser.IdToken, payload: Toast) {
    if (!this.channel$.has(idToken)) {
      this.addClient(idToken)
    }
    setTimeout(() => {
      this.channel$.get(idToken).next(payload)
      this.channel$.delete(idToken)
    }, 500)
  }

  /**
   * Xoá người dùng khỏi hàng chờ toast
   */
  public removeClient(idToken: IdentityUser.IdToken) {
    if (this.channel$.has(idToken)) this.channel$.delete(idToken)
  }

  /**
   * Add client
   */
  public addClient(idToken: IdentityUser.IdToken): void {
    this.channel$.set(idToken, new Subject<Toast>())
  }
}
