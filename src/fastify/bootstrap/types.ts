import { FastifyCookie }          from '@fastify/cookie';
import { FastifyViewOptions }     from '@fastify/view'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { IdentityUser }           from 'src/common/database/auth'
import { Toast }                  from '../../common/notify/toast/model'

type setValidatorErrors = (this: FastifyReply, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type formFieldError     = (this: FastifyReply, field: string, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type buildViewValue     = (this: FastifyReply, handler: Function) => FastifyReply
type viewAsHtml         = (this: FastifyReply, handler: Function) => void
type backend            = ()                                      => NestFastifyApplication
type withNotification   = (this: FastifyReply, toast: Toast)      => FastifyReply

declare module 'fastify' {
  /**
   * @global
   * Định nghĩa Reply global cho response
   * */
  interface FastifyReply extends FastifyViewOptions {
    locals: {
      /**
       * @description
       * Sử dụng style css nào cho trang hiện tại
       * */
      styles?:       string[]
      /**
       * @description
       * Sử dụng javascript nào cho trang hiện tại
       * */
      scripts?:      string[]
      /**
       * @description
       * Title của trang hiện tại
       * */
      title?:        string
      /**
       * @description
       * Kiểm tra thiết bị có phải là mobile hay không từ user-agent
       * */
      isMobile?:     boolean
      /**
       * @description
       * Kiểm tra hợp lệ của form hoặc model
       * */
      validators?:   Validators
      /**
       * @description
       * Id phiên đăng nhập
       * */
      idToken?:      IdentityUser.IdToken
      /**
       * @description
       * Request server nhận được từ client
       * */
      request?:      FastifyRequest
      /**
       * @description
       * Sử dụng cho màn hình các bước cần thực hiện
       * */
      stepper?:      { index: number, steps: string[] }
      [key: string]: any
    }
    /**
     * @function
     * Set error không hợp lệ cho form hoặc model
     * */
    setValidatorErrors: setValidatorErrors
    /**
     * @function
     * Set error không hợp lệ cho field cụ thể trong form hoặc model
     * */
    formFieldError:     formFieldError
    /**
     * @function
     * Phát hiện các Metadata decorator như @UseJs, @UseCss, ... để thêm vào
     * locals trước khi render view
     * */
    buildViewValue:     buildViewValue
    /**
     * @function
     * Render 1 template html
     * */
    viewAsHtml:         viewAsHtml
    /**
     * @function
     * Gửi đi thông báo đến trình duyệt bằng SSE
     * */
    withNotification:   withNotification
    /**
     * @function
     * Các phương thức tự định nghĩa khác
     * */
    [method: string | symbol]: (this: FastifyReply, ...args: any[]) => FastifyReply
  }

  interface FastifyRequest extends FastifyCookie {
    /**
     * @var
     * Lưu trữ thông tin người dùng đang đăng nhập vào request
     * */
    user:            JwtUserSign
    /**
     * @var
     * Người dùng đã đăng nhập
     * */
    isAuthenticated: boolean
    /**
     * @var
     * Application instance
     * */
    backend:         backend
  }
}
