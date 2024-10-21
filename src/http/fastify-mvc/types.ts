import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { Toast }                  from '../../common/notify/toast/model'
import { IdentityUser }           from '../../common/auth/conf/database/entity/identity-user.entity'

type setValidatorErrors = (this: FastifyReply, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type formFieldError     = (this: FastifyReply, field: string, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type buildViewValue     = (this: FastifyReply, handler: Function) => FastifyReply
type viewAsHtml         = (this: FastifyReply, handler: Function) => void
type backend            = ()                                      => NestFastifyApplication
type withNotification   = (this: FastifyReply, toast: Toast)      => FastifyReply

declare module 'fastify' {
  export interface FastifyReply {
    locals: {
      styles?:       string[]
      scripts?:      string[]
      bundles?:      string[]
      title?:        string
      isMobile?:     boolean
      flash?:        { message: string | object | [], type: 'error' | 'warning' | 'info' }
      validators?:   Validators
      idToken?:      IdentityUser.TokenId
      request?:      FastifyRequest
      stepper?:      { index: number, steps: string[] }
      [key: string]: any
    }
    setValidatorErrors: setValidatorErrors
    formFieldError:     formFieldError
    buildViewValue:     buildViewValue
    viewAsHtml:         viewAsHtml
    withNotification:   withNotification
    [key: string | symbol]: (this: FastifyReply, ...args: any[]) => FastifyReply
  }

  interface FastifyRequest {
    user:            JwtUserSign
    isAuthenticated: boolean
    backend:         backend
  }
}
