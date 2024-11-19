import { FunctionStatic }                                                        from 'src/util'
import { IdentityUser }                                                          from '../../common'
import { createParamDecorator, ExecutionContext, NotImplementedException, Type } from '@nestjs/common'

import { Reflector }             from '@nestjs/core'
import { plainToInstance }       from 'class-transformer'
import { validate }              from 'class-validator'

export const UseJs     = Reflector.createDecorator<string[] | string>()
export const UseCss    = Reflector.createDecorator<string[] | string>()
export const PageTitle = Reflector.createDecorator<string>()
export const Stepper   = Reflector.createDecorator<{ index: number, steps: string[] }>()

/**
 * Lấy ra thông tin người dùng hiện tại từ request atrributes
 */
export const User = createParamDecorator(
  <T extends IdentityUser.Model = IdentityUser.Model>(ctor: Type<T>, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    if (!request.user) throw new NotImplementedException('Not found attribute key user from request context, please login first, corrupted...')
    request.user.detail = plainToInstance(ctor, request.user.detail)
    return request.user
  }
)

/**
 * Lấy ra data của form được post từ html
 */
export const FormBody = createParamDecorator(
  async <T extends FormBase = FormBase>(ctor: Type<T & FormBase>, ctx: ExecutionContext) => {
    const request  = ctx.switchToHttp().getRequest<FastifyRequest>()
    const response = ctx.switchToHttp().getResponse<FastifyReply>()
    const formBody = <T>plainToInstance(ctor, request.body)
    const errors   = await validate(formBody)
    if (errors.length) {
      formBody.isValid     = false
      const form           = errors[0].target as FormBase
      const takeFirstError = (constraints: { [key: string]: string }) => {
        if (!constraints) return {}
        const firstKey = Object.keys(constraints)[0]
        return { [firstKey]: constraints[firstKey] }
      }
      Object.keys(form).map(field =>
        response.formFieldError(field,
          takeFirstError(errors.find(_ => _.property === field)?.constraints)))
    } else {
      formBody.isValid           = true
      response.setValidatorErrors(null)
    }
    return formBody
  }
)

/**
 * Lấy value từ cookie
 * */
export const CookieValue = createParamDecorator(
  async <T>(option: { key: string, ctor: Type<T>, decrypted?: boolean }, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest>()
    const raw     = request.cookies[option.key] || ''
    if (!raw || raw.trim() === '') { return null }

    const handler        = ctx.getHandler()
    const classPrototype = ctx.getClass().prototype
    const paramTypes     = Reflect.getMetadata('design:paramtypes', classPrototype, handler.name)
    console.log('paramTypes', paramTypes)
    const propertyKeys = ["cart"]
    console.log('propertyKeys', propertyKeys)
    const propertyKey  = propertyKeys.find(key => Reflect.getMetadata('CookieValue', handler))
    console.log('propertyKey', propertyKey)
    console.log('propertyKey2', Reflect.getMetadata('CookieValue', handler))
    console.log('propertyKey32', Reflect.getMetadataKeys(handler))
    const propertyType = Reflect.getMetadata("design:type", classPrototype, propertyKey)
    console.log('propertyType', propertyType)

    if (!option.decrypted) {
      return await FunctionStatic.decrypt(raw).then(value =>
        plainToInstance(option.ctor, JSON.parse(value)))
    }
    return plainToInstance(option.ctor, JSON.parse(raw))
  }
)
