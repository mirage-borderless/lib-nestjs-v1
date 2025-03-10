import { RENDER_METADATA }                     from '@nestjs/common/constants'
import { Reflector }                           from '@nestjs/core'
import { NestFastifyApplication }              from '@nestjs/platform-fastify'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import fp                                      from 'fastify-plugin'
import { Toast }                               from '../../util'
import { ToastService }                        from '../../util'
import { PageTitle, Stepper, UseCss, UseJs }   from '../metadata'

const register = fp

const plugins: FastifyPluginAsync = async (
  instance: FastifyInstance,
  app:      NestFastifyApplication
) => {
  /**
   * Lưu instance của application vào request
   * */
  instance.decorateRequest('backend', function (this: FastifyRequest) {
    return app
  })
  /**
   * Validator setter
   * */
  instance.decorateReply('setValidatorErrors', function (
    this:  FastifyReply,
    error: Record<any, any>,
    form?: Record<any, any>
  ) {
    this.locals.validators = {
      errors:  error,
      values$: form ?? this.request.body as object
    }
    return this
  })
  instance.decorateReply('formFieldError', function (
    this:  FastifyReply,
    field: string,
    error: Record<any, any>,
    form?: Record<any, any>
  ) {
    if (!!error) {
      this.locals.validators = {
        errors: { ...(this.locals.validators?.errors as object || {}), [field]: error },
        values$: form ?? this.request.body as object
      }
    }
    return this
  })
  /**
   * Notification reply
   * */
  instance.decorateReply('withNotification', function (this: FastifyReply, toast: Toast) {
    const request      = this.request as FastifyRequest
    const toastService = request.backend().get(ToastService)
    if (!!toastService) {
      toastService.sendToClient(this.locals?.idToken || request.user?.idToken, toast)
    }
    return this
  })
  /**
   * Render html template
   * */
  instance.decorateReply('viewAsHtml', function (this: FastifyReply, handler: Function) {
    this.buildViewValue(handler)
    const template = Reflect.getMetadata(RENDER_METADATA, handler)
    this.view(template)
  })
  /**
   * Append view value before send
   * */
  instance.decorateReply('buildViewValue', function (this: FastifyReply, handler: Function) {
    const request   = this.request as FastifyRequest
    const response  = this
    const reflector = new Reflector()
    const styles    = reflector.get(UseCss,    handler)
    const scripts   = reflector.get(UseJs,     handler)
    const title     = reflector.get(PageTitle, handler)
    const stepper   = reflector.get(Stepper,   handler)
    const userAgent = request.headers['user-agent']
    const isMobile  = userAgent ? /Mobile|Android|iPhone|iPad|iPod|Windows Phone|KFAPWI|BlackBerry|BB10/i.test(userAgent) : false
    const locals    = response.locals || {}
    if (!!styles)  locals.styles  = (locals.styles  ?? []).concat(styles)
    if (!!scripts) locals.scripts = (locals.scripts ?? []).concat(scripts)
    if (!!title)   locals.title   = title
    if (!!stepper) locals.stepper = stepper
    locals.isMobile               = isMobile
    locals.request                = request
    return this
  })
}

/**
 * @function
 * Sử dụng tất cả các plugins của @mirage-borderless
 * */
export const corePlugins = (app: NestFastifyApplication) =>
  register((instance: FastifyInstance) => plugins(instance, app), {
    name:    'lib-core-plugins-v1',
    fastify: '5.x'
  }
)
