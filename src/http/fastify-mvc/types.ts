import { FastifyCookie }          from '@fastify/cookie';
import { FastifyViewOptions }     from '@fastify/view'
import { NestFastifyApplication } from '@nestjs/platform-fastify'
import { IdentityUser }           from '../../common/auth/conf/database/entity/identity-user.entity'
import { Toast }                  from '../../common/notify/toast/model'

type setValidatorErrors = (this: FastifyReply, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type formFieldError     = (this: FastifyReply, field: string, error: Record<any, any>, form?: Record<any, any>) => FastifyReply
type buildViewValue     = (this: FastifyReply, handler: Function) => FastifyReply
type viewAsHtml         = (this: FastifyReply, handler: Function) => void
type backend            = ()                                      => NestFastifyApplication
type withNotification   = (this: FastifyReply, toast: Toast)      => FastifyReply

declare module 'fastify' {
  interface FastifyReply extends FastifyViewOptions {
    locals: {
      styles?:       string[]
      scripts?:      string[]
      bundles?:      string[]
      title?:        string
      isMobile?:     boolean
      flash?:        { message: string | object | [], type: 'error' | 'warning' | 'info' }
      validators?:   Validators
      idToken?:      IdentityUser.IdToken
      request?:      FastifyRequest
      stepper?:      { index: number, steps: string[] }
      [key: string]: any
    }
    setValidatorErrors: setValidatorErrors
    formFieldError:     formFieldError
    buildViewValue:     buildViewValue
    viewAsHtml:         viewAsHtml
    withNotification:   withNotification
    [method: string | symbol]: (this: FastifyReply, ...args: any[]) => FastifyReply
  }

  interface FastifyRequest extends FastifyCookie {
    user:            JwtUserSign
    isAuthenticated: boolean
    backend:         backend
  }
}
